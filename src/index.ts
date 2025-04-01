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
  webhook_url?: string;
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
        description: "The full Discord webhook URL (optional if set in environment)",
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
    required: ["content"],
  },
};

class DiscordWebhookClient {
  private webhookUrl: string;

  constructor() {
    // 환경변수에서 WEBHOOK_URL 읽기
    const url = process.env.WEBHOOK_URL;
    if (!url) {
      throw new Error("WEBHOOK_URL environment variable is not set");
    }
    this.webhookUrl = url;
  }

  async sendMessage(args: SendMessageArgs): Promise<any> {
    try {
      // 인자로 전달된 webhook_url이 있으면 그것을 사용, 없으면 환경변수의 URL 사용
      const webhookUrl = args.webhook_url || this.webhookUrl;

      const payload = {
        content: args.content,
        username: args.username,
        avatar_url: args.avatar_url,
        embeds: args.embed ? [args.embed] : undefined,
      };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // 응답 상태 확인
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // 성공적인 응답 처리
      // Discord webhook은 종종 204 No Content로 응답하므로 JSON 파싱 대신 상태 확인
      return {
        status: "success",
        message: "Message sent successfully",
        details: {
          statusCode: response.status,
          statusText: response.statusText
        }
      };
    } catch (error) {
      console.error("Discord webhook send error:", error);
      return {
        status: "error",
        message: error instanceof Error ? error.message : String(error)
      };
    }
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
            
            if (!args.content) {
              throw new Error("Missing required argument: content");
            }

            const response = await discordClient.sendMessage(args);
            return {
              content: [{ 
                type: "text", 
                text: JSON.stringify(response, null, 2) 
              }],
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