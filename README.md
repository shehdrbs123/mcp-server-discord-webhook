# Discord Webhook MCP Server

## Overview
This Model Context Protocol (MCP) server enables sending messages to Discord channels via webhooks.

## Tools

### `discord_send_message`
Send a message to a Discord channel using a webhook.

#### Input Parameters
- `webhook_url` (string, required): The full Discord webhook URL
- `content` (string, required): The message text to send
- `username` (string, optional): Custom username for the webhook message
- `avatar_url` (string, optional): Custom avatar URL for the webhook message
- `embed` (object, optional): Embed object for rich message formatting

## Setup

1. Create a Discord Webhook:
   - Go to your Discord channel settings
   - Create a webhook and copy its URL

2. Environment Variables:
   - No persistent environment variables required

## Usage

Use the `discord_send_message` tool to send messages through a Discord webhook.

## License
MIT License
