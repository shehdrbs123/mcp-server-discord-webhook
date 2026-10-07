import assert from "node:assert/strict";
import http from "node:http";
import readline from "node:readline";
import { spawn } from "node:child_process";
import test from "node:test";

function createRpcReader(stream) {
  const rl = readline.createInterface({ input: stream });
  const queue = [];
  const waiters = [];

  rl.on("line", (line) => {
    const message = JSON.parse(line);
    const waiterIndex = waiters.findIndex((waiter) => waiter.predicate(message));
    if (waiterIndex >= 0) {
      const [waiter] = waiters.splice(waiterIndex, 1);
      waiter.resolve(message);
    } else {
      queue.push(message);
    }
  });

  return {
    waitFor(predicate, timeoutMs = 5000) {
      const queuedIndex = queue.findIndex(predicate);
      if (queuedIndex >= 0) {
        return Promise.resolve(queue.splice(queuedIndex, 1)[0]);
      }

      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          const index = waiters.findIndex((waiter) => waiter.resolve === wrappedResolve);
          if (index >= 0) {
            waiters.splice(index, 1);
          }
          reject(new Error("Timed out waiting for JSON-RPC message"));
        }, timeoutMs);

        function wrappedResolve(message) {
          clearTimeout(timer);
          resolve(message);
        }

        waiters.push({ predicate, resolve: wrappedResolve });
      });
    },
    close() {
      rl.close();
    },
  };
}

function send(proc, message) {
  proc.stdin.write(`${JSON.stringify(message)}\n`);
}

test("discord_send_message preserves stdio behavior", async (t) => {
  let receivedRequest;
  const webhookReceived = new Promise((resolve) => {
    receivedRequest = resolve;
  });

  const webhook = http.createServer((req, res) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      receivedRequest({
        method: req.method,
        url: req.url,
        contentType: req.headers["content-type"],
        body: Buffer.concat(chunks).toString("utf8"),
      });
      res.statusCode = 204;
      res.statusMessage = "No Content";
      res.end();
    });
  });

  await new Promise((resolve) => webhook.listen(0, "127.0.0.1", resolve));
  const address = webhook.address();
  assert.ok(address && typeof address !== "string");

  const proc = spawn(process.execPath, ["dist/index.js"], {
    env: {
      ...process.env,
      WEBHOOK_URL: `http://127.0.0.1:${address.port}/discord-webhook`,
    },
    stdio: ["pipe", "pipe", "pipe"],
  });

  let stderr = "";
  proc.stderr.setEncoding("utf8");
  proc.stderr.on("data", (chunk) => {
    stderr += chunk;
  });

  const rpc = createRpcReader(proc.stdout);

  t.after(async () => {
    rpc.close();
    proc.kill();
    await new Promise((resolve) => webhook.close(resolve));
  });

  send(proc, {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "characterization-test", version: "1.0.0" },
    },
  });

  const initialized = await rpc.waitFor((message) => message.id === 1);
  assert.equal(initialized.result.serverInfo.name, "Discord Webhook MCP Server");
  assert.equal(initialized.result.serverInfo.version, "0.1.0");

  send(proc, {
    jsonrpc: "2.0",
    method: "notifications/initialized",
  });

  send(proc, {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {},
  });

  const listed = await rpc.waitFor((message) => message.id === 2);
  assert.equal(listed.result.tools.length, 1);
  assert.equal(listed.result.tools[0].name, "discord_send_message");
  assert.deepEqual(listed.result.tools[0].inputSchema.required, ["content"]);
  assert.equal(listed.result.tools[0].inputSchema.properties.webhook_url.type, "string");

  const embed = {
    title: "Migration characterization",
    description: "Preserve payload shape",
    color: 3447003,
    fields: [{ name: "field", value: "value", inline: true }],
  };

  send(proc, {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "discord_send_message",
      arguments: {
        content: "hello from characterization test",
        username: "migration-test",
        avatar_url: "https://example.com/avatar.png",
        embed,
      },
    },
  });

  const [callResult, request] = await Promise.all([
    rpc.waitFor((message) => message.id === 3),
    webhookReceived,
  ]);

  assert.equal(request.method, "POST");
  assert.equal(request.url, "/discord-webhook");
  assert.equal(request.contentType, "application/json");
  assert.deepEqual(JSON.parse(request.body), {
    content: "hello from characterization test",
    username: "migration-test",
    avatar_url: "https://example.com/avatar.png",
    embeds: [embed],
  });

  assert.equal(callResult.result.content.length, 1);
  assert.equal(callResult.result.content[0].type, "text");
  assert.deepEqual(JSON.parse(callResult.result.content[0].text), {
    status: "success",
    message: "Message sent successfully",
    details: {
      statusCode: 204,
      statusText: "No Content",
    },
  });

  assert.match(stderr, /Discord Webhook MCP Server running on stdio/);
});
