#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// Type definitions for tool arguments
interface SendMessageArgs {
  webhook_url: string;
  content: string;
  username?: string;
  avatar_url?: string;
  embed?: {
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
  };
}

// Tool definition
const sendMessageTool: Tool = {
  name: "discord_send_message",
  description: "Send a message to a Discord channel via webhook",
  inputSchema: {
    type: "object",
    properties: {
      webhook_url: {
        type: "string",
        description: "The full Discord webhook URL",
      },
      content: {
        type: "string",
        description: "The message text to send",
      },
      username: {
        type: "string",
        description: "Custom username for the webhook message (optional)",
      },
      avatar_url: {
        type: "string",
        description: "Custom avatar URL for the webhook message (optional)",
      },
      embed: {
        type: "object",
        description: "Optional embed object for rich message formatting",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          color: { type: "number" },
          fields: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                value: { type: "string" },
                inline: { type: "boolean" },
              },
              required: ["name", "value"],
            },
          },
        },
      },
    },
    required: ["webhook_url", "content"],
  },
};

class DiscordWebhookClient {
  async sendMessage(args: SendMessageArgs): Promise<any> {
    const payload = {
      content: args.content,
      username: args.username,
      avatar_url: args.avatar_url,
      embeds: args.embed ? [args.embed] : undefined,
    };

    const response = await fetch(args.webhook_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return response.json();
  }
}

async function main() {
  console.error("Starting Discord Webhook MCP Server...");
  const server = new Server(
    {
      name: "Discord Webhook MCP Server",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  const discordClient = new DiscordWebhookClient();

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: CallToolRequest) => {
      console.error("Received CallToolRequest:", request);
      try {
        if (!request.params.arguments) {
          throw new Error("No arguments provided");
        }

        switch (request.params.name) {
          case "discord_send_message": {
            const args = request.params.arguments as unknown as SendMessageArgs;
            
            if (!args.webhook_url || !args.content) {
              throw new Error("Missing required arguments: webhook_url and content");
            }

            const response = await discordClient.sendMessage(args);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        console.error("Error executing tool:", error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: error instanceof Error ? error.message : String(error),
              }),
            },
          ],
        };
      }
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error("Received ListToolsRequest");
    return {
      tools: [sendMessageTool],
    };
  });

  const transport = new StdioServerTransport();
  console.error("Connecting server to transport...");
  await server.connect(transport);

  console.error("Discord Webhook MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
