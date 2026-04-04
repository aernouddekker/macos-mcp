# mailappmcp

MCP server for macOS Mail.app — gives [Claude Code](https://claude.ai/code), [Claude Desktop](https://claude.ai/download), and any MCP client native email access.

No API keys, no OAuth, no cloud services. Talks directly to Mail.app via AppleScript. Works with every account you have configured — iCloud, Gmail, Outlook, Fastmail, you name it.

## Tools

| Tool | Description |
|------|-------------|
| `list-mailboxes` | List all mailboxes across all accounts with unread counts |
| `search-messages` | Search messages by subject or sender (empty query lists all) |
| `read-message` | Read the full content of a specific email |
| `compose-message` | Create a draft in Mail.app (does **not** send) |
| `send-message` | Send an email immediately (supports `from` and attachments) |
| `reply-to-message` | Reply or reply-all to a message |
| `delete-messages` | Delete messages by Message-ID |
| `mark-as-read` | Mark messages as read |

## Requirements

- macOS (uses AppleScript — won't work on Linux/Windows)
- Node.js 18+
- Mail.app configured with at least one account

## Install

### From npm

```bash
npm install -g mailappmcp
```

### From source

```bash
git clone https://github.com/aernouddekker/mailappmcp.git
cd mailappmcp
npm install
npm run build
```

## Configure

### Claude Code

Add to `~/.claude/settings.json` or your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "mailappmcp": {
      "command": "npx",
      "args": ["-y", "mailappmcp"]
    }
  }
}
```

Or if installed from source:

```json
{
  "mcpServers": {
    "mailappmcp": {
      "command": "node",
      "args": ["/path/to/mailappmcp/dist/index.js"]
    }
  }
}
```

### Claude Desktop / Cowork

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mailappmcp": {
      "command": "npx",
      "args": ["-y", "mailappmcp"]
    }
  }
}
```

## How it works

The server runs locally over stdio. Each tool builds an AppleScript, executes it via `osascript`, and parses the structured output back into JSON for the MCP response.

Messages are addressed by the triple **(account, mailbox, messageId)** where `messageId` is the RFC Message-ID header. The `search-messages` tool returns these identifiers; `read-message`, `reply-to-message`, `delete-messages`, and `mark-as-read` consume them.

### Safety

- `compose-message` opens a visible draft — you review before sending
- `send-message` is a separate, explicit action
- `reply-to-message` defaults to draft mode (`sendImmediately: false`)
- `delete-messages` moves to Trash (standard Mail.app behavior)

## Known limitations

- `content contains` searches in AppleScript can be slow on large mailboxes — the server searches subject and sender by default
- `osascript` has a 30-second timeout per call
- Mail.app must be running (or will be auto-launched)

## License

MIT
