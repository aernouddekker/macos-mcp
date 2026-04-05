# macos-mcp

MCP servers for macOS native apps — gives [Claude Code](https://claude.ai/code), [Claude Desktop](https://claude.ai/download), and any MCP client native access to Mail, Numbers, and Contacts.

No API keys, no OAuth, no cloud services. Talks directly to macOS apps via AppleScript. Runs locally on your Mac.

## Servers

### Mail (`mailappmcp`) — 13 tools

Works with every email account configured in Mail.app — iCloud, Gmail, Outlook, Fastmail, you name it.

| Tool | Description |
|------|-------------|
| `list-mailboxes` | List all mailboxes across all accounts with unread counts |
| `search-messages` | Search messages by subject or sender (empty query lists all) |
| `read-message` | Read the full content of a specific email |
| `compose-message` | Create a draft in Mail.app (does **not** send) |
| `send-message` | Send an email immediately (supports `from` and attachments) |
| `reply-to-message` | Reply or reply-all to a message |
| `forward-message` | Forward a message to new recipients |
| `move-messages` | Move messages between mailboxes |
| `delete-messages` | Delete messages by Message-ID |
| `mark-as-read` | Mark messages as read |
| `flag-message` | Flag/unflag messages with color support |
| `save-attachment` | Save email attachments to disk |
| `check-for-new-mail` | Trigger a mail fetch for one or all accounts |

### Numbers (`numbersmcp`) — 24 tools

Works with any open Numbers spreadsheet.

| Tool | Description |
|------|-------------|
| `list-spreadsheets` | List all open Numbers documents |
| `list-sheets` | List sheets and tables in a document |
| `read-range` | Read cell values from a range (e.g. "A1:C10") |
| `read-table` | Read an entire table as structured data |
| `write-cell` | Write a value to a specific cell |
| `write-range` | Write multiple values to a range |
| `get-formula` | Get the formula from a cell |
| `set-formula` | Set a formula on a cell |
| `add-row` | Append a row to a table |
| `delete-row` | Delete a row from a table |
| `add-column` | Add a column to a table |
| `delete-column` | Delete a column from a table |
| `add-sheet` | Add a new sheet to a document |
| `delete-sheet` | Delete a sheet from a document |
| `rename-sheet` | Rename a sheet |
| `add-table` | Add a new table to a sheet |
| `delete-table` | Delete a table from a sheet |
| `rename-table` | Rename a table |
| `sort-table` | Sort a table by a column |
| `merge-cells` | Merge a range of cells |
| `unmerge-cells` | Unmerge previously merged cells |
| `set-cell-format` | Set cell format (number, currency, date, percentage, etc.) |
| `set-cell-style` | Set font, color, background, bold, italic, alignment |
| `export-document` | Export to PDF, Excel, or CSV |

### Contacts (`contactsmcp`) — 12 tools

Works with the system address book — all accounts synced to Contacts.app.

| Tool | Description |
|------|-------------|
| `search-contacts` | Search contacts by name, email, or phone |
| `read-contact` | Get full contact details |
| `create-contact` | Create a new contact |
| `update-contact` | Update contact fields |
| `delete-contact` | Delete a contact |
| `list-groups` | List all contact groups |
| `create-group` | Create a new contact group |
| `rename-group` | Rename a contact group |
| `delete-group` | Delete a contact group |
| `add-to-group` | Add a contact to a group |
| `remove-from-group` | Remove a contact from a group |
| `list-group-members` | List all contacts in a group |

## Requirements

- macOS (uses AppleScript — won't work on Linux/Windows)
- Node.js 18+

## Install

### From npm

```bash
npm install -g mailappmcp    # Mail server
npm install -g numbersmcp    # Numbers server
npm install -g contactsmcp   # Contacts server
```

### From source

```bash
git clone https://github.com/aernouddekker/macos-mcp.git
cd macos-mcp
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
    },
    "numbersmcp": {
      "command": "npx",
      "args": ["-y", "numbersmcp"]
    },
    "contactsmcp": {
      "command": "npx",
      "args": ["-y", "contactsmcp"]
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
    },
    "numbersmcp": {
      "command": "npx",
      "args": ["-y", "numbersmcp"]
    },
    "contactsmcp": {
      "command": "npx",
      "args": ["-y", "contactsmcp"]
    }
  }
}
```

## How it works

Each server runs locally over stdio. Tools build AppleScript strings, execute them via `osascript`, and parse the structured output back into JSON for the MCP response. A shared package (`@mailappmcp/shared`) provides the AppleScript runner, string escaping, and delimiter-based parsing.

### Safety

- `compose-message` opens a visible draft — you review before sending
- `send-message` is a separate, explicit action
- `reply-to-message` and `forward-message` default to draft mode (`sendImmediately: false`)
- `delete-messages` moves to Trash (standard Mail.app behavior)

## Known limitations

- `content contains` searches in AppleScript can be slow on large mailboxes — Mail server searches subject and sender by default
- `osascript` has a 30-second timeout per call
- Apps must be running (or will be auto-launched by AppleScript)
- Numbers tools require an open document

## License

MIT
