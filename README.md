# MCP Server Discord Webhook - GitHub Integration

## Setup Guide

### Prerequisites
- GitHub Account
- Personal Access Token
- Docker or NPX installed

### Step 1: Create a Personal Access Token

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Click on "Generate new token"
3. Select the appropriate token scope:
   - For private repositories: Select `repo` scope ("Full control of private repositories")
   - For public repositories only: Select `public_repo` scope

### Step 2: Configuration Options

#### Option 1: Docker Configuration

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "mcp/github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_PERSONAL_ACCESS_TOKEN"
      }
    }
  }
}
```

#### Option 2: NPX Configuration

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_PERSONAL_ACCESS_TOKEN"
      }
    }
  }
}
```

### Security Notes
- Keep your Personal Access Token confidential
- Do not commit the token to version control
- Use environment variables or secure token management practices

### Troubleshooting
- Ensure the token has the correct permissions
- Verify your network and GitHub access
- Check Docker or NPX installation

## Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## License
[Add License Information]
