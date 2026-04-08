# macos-mcp

MCP servers for macOS native apps — gives [Claude Code](https://claude.ai/code), [Claude Desktop](https://claude.ai/download), and any MCP client native access to Mail, Numbers, Contacts, printing (CUPS), and FaceTime / phone calls.

No API keys, no OAuth, no cloud services. Talks directly to macOS apps via AppleScript, CUPS (`lp`/`lpstat`), and URL schemes (`tel://`, `facetime://`). Runs locally on your Mac.

## Servers

### Mail (`mailappmcp`) — 21 tools

Works with every email account configured in Mail.app — iCloud, Gmail, Outlook, Fastmail, you name it.

| Tool | Description |
|------|-------------|
| `list-mailboxes` | List all mailboxes across all accounts with unread counts |
| `list-accounts` | List configured mail accounts with email addresses and type |
| `list-signatures` | List available email signatures |
| `search-messages` | Search messages by subject or sender (empty query lists all) |
| `read-message` | Read the full content of a specific email |
| `get-message-source` | Get raw RFC822 source of a message |
| `list-attachments` | List attachments on a message with name, MIME type, size |
| `save-attachment` | Save email attachments to disk |
| `compose-message` | Create a draft in Mail.app (does **not** send) |
| `send-message` | Send an email immediately (supports `from` and attachments) |
| `reply-to-message` | Reply or reply-all to a message |
| `forward-message` | Forward a message to new recipients |
| `redirect-message` | Redirect a message (preserves original sender) |
| `move-messages` | Move messages between mailboxes |
| `delete-messages` | Delete messages by Message-ID |
| `mark-as-read` | Mark messages as read |
| `mark-as-junk` | Mark/unmark messages as junk |
| `flag-message` | Flag/unflag messages with color support |
| `set-message-color` | Set background color of messages in the message list |
| `check-for-new-mail` | Trigger a mail fetch for one or all accounts |
| `extract-email-address` | Parse "John Doe \<jdoe@example.com\>" into name and address |

### Numbers (`numbersmcp`) — 29 tools

Works with any open Numbers spreadsheet.

| Tool | Description |
|------|-------------|
| `list-spreadsheets` | List all open Numbers documents |
| `create-document` | Create a new Numbers document |
| `list-sheets` | List sheets and tables in a document |
| `get-active-sheet` | Get the currently active sheet |
| `read-range` | Read cell values from a range (e.g. "A1:C10") |
| `read-table` | Read an entire table as structured data |
| `write-cell` | Write a value to a specific cell |
| `write-range` | Write multiple values to a range |
| `clear-range` | Clear contents and formatting of a cell range |
| `get-formula` | Get the formula from a cell |
| `set-formula` | Set a formula on a cell |
| `add-row` | Append a row to a table |
| `delete-row` | Delete a row from a table |
| `add-column` | Add a column to a table |
| `delete-column` | Delete a column from a table |
| `resize-row-column` | Set row height or column width |
| `add-sheet` | Add a new sheet to a document |
| `delete-sheet` | Delete a sheet from a document |
| `rename-sheet` | Rename a sheet |
| `add-table` | Add a new table to a sheet |
| `delete-table` | Delete a table from a sheet |
| `rename-table` | Rename a table |
| `sort-table` | Sort a table by a column |
| `transpose-table` | Swap rows and columns of a table |
| `merge-cells` | Merge a range of cells |
| `unmerge-cells` | Unmerge previously merged cells |
| `set-cell-format` | Set cell format (number, currency, date, percentage, etc.) |
| `set-cell-style` | Set font, color, background, bold, italic, alignment |
| `export-document` | Export to PDF, Excel, or CSV |

### Contacts (`contactsmcp`) — 15 tools

Works with the system address book — all accounts synced to Contacts.app.

| Tool | Description |
|------|-------------|
| `search-contacts` | Search contacts by name, email, or phone |
| `search-by-modification-date` | Find contacts modified after a given date |
| `read-contact` | Get full contact details |
| `get-my-card` | Get the user's own contact card |
| `get-vcard` | Export a contact as vCard 3.0 text |
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

### Calendar (`calendarmcp`) — 25 tools

Works with every calendar configured in Calendar.app — iCloud, Google, Exchange, local, you name it.

| Tool | Description |
|------|-------------|
| `list-calendars` | List all calendars with name, writable flag, description |
| `get-calendar` | Get properties of a single calendar by name (incl. event count) |
| `create-calendar` | Create a new calendar |
| `update-calendar` | Rename a calendar or set its description |
| `delete-calendar` | **Not supported by Calendar.app** — returns a descriptive error; calendars must be removed from the Calendar.app UI |
| `switch-view` | Switch Calendar.app to day/week/month view, optionally jumping to a date |
| `reload-calendars` | Force Calendar.app to refresh from accounts |
| `list-events` | List events in a calendar between two ISO dates |
| `search-events` | Search events by summary substring within a date window (defaults: −30d to +365d). Scope to a single calendar for speed |
| `get-event` | Get full event details by uid |
| `create-event` | Create an event with summary, start, end, optional location/description/url |
| `update-event` | Patch any event field by uid |
| `delete-event` | Delete an event by uid |
| `move-event` | Move an event to another calendar (delete + recreate; new uid) |
| `duplicate-event` | Duplicate an event into the same or another calendar |
| `today-events` | List today's events in one calendar or across all |
| `upcoming-events` | List events in the next N days |
| `list-attendees` | List attendees on an event |
| `add-attendee` | Add an attendee with email and optional display name |
| `remove-attendee` | Remove an attendee by email |
| `list-alarms` | List display, mail, and sound alarms on an event |
| `add-display-alarm` | Add a display alarm N minutes before event start |
| `add-sound-alarm` | Add a sound alarm N minutes before event start |
| `add-mail-alarm` | Add a mail alarm N minutes before event start |
| `remove-alarm` | Remove an alarm by 1-based index from list-alarms output |

### Print (`printmcp`) — 5 tools

Wraps the macOS CUPS print system (`lp`, `lpstat`, `lpoptions`, `cancel`). Discovers any printer the Mac knows about — local USB, network, AirPrint, shared from another Mac. No AppleScript involved.

| Tool | Description |
|------|-------------|
| `list-printers` | List all CUPS printers with status, location, default flag |
| `get-printer-options` | List supported PPD options for a printer (sides, media size, color mode, …) with current defaults |
| `print-file` | Print a local file (PDF, plain text, JPEG/PNG, PostScript) with copies, duplex, paper size, page ranges, fit-to-page, and arbitrary `lp` options |
| `list-print-jobs` | List active print jobs (optionally filtered to a printer) |
| `cancel-print-job` | Cancel a queued or printing job by id |

Composes naturally with `mailappmcp`: e.g. *"print the attachment of the latest email from Hadi"* — search the message, `save-attachment` to a temp dir, then `print-file`.

### FaceTime (`facetimemcp`) — 3 tools

Initiates calls by handing URL schemes to `open`. Phone calls require an iPhone paired via Continuity (so macOS can route them through your phone).

| Tool | Description |
|------|-------------|
| `call-phone` | Place a cellular call via paired iPhone (`tel://`) |
| `call-facetime-audio` | Start a FaceTime audio call to a phone number or Apple ID email |
| `call-facetime-video` | Start a FaceTime video call to a phone number or Apple ID email |

Phone numbers are normalized + validated as E.164 (`+15551234567`); spaces, dashes, and parens are tolerated. macOS may show a confirmation prompt before dialing — there is no fully silent dial path, by design.

## Requirements

- macOS (uses AppleScript — won't work on Linux/Windows)
- Node.js 18+

## Install

### From npm

```bash
npm install -g mailappmcp            # Mail server
npm install -g numbersmcp            # Numbers server
npm install -g contactsmcp           # Contacts server
npm install -g @aernoud/calendarmcp  # Calendar server
npm install -g @aernoud/printmcp     # Print server (CUPS)
npm install -g @aernoud/facetimemcp  # FaceTime / phone calls
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
    "mailappmcp":   { "command": "npx", "args": ["-y", "mailappmcp"] },
    "numbersmcp":   { "command": "npx", "args": ["-y", "numbersmcp"] },
    "contactsmcp":  { "command": "npx", "args": ["-y", "contactsmcp"] },
    "calendarmcp":  { "command": "npx", "args": ["-y", "@aernoud/calendarmcp"] },
    "printmcp":     { "command": "npx", "args": ["-y", "@aernoud/printmcp"] },
    "facetimemcp":  { "command": "npx", "args": ["-y", "@aernoud/facetimemcp"] }
  }
}
```

### Claude Desktop / Cowork

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mailappmcp":   { "command": "npx", "args": ["-y", "mailappmcp"] },
    "numbersmcp":   { "command": "npx", "args": ["-y", "numbersmcp"] },
    "contactsmcp":  { "command": "npx", "args": ["-y", "contactsmcp"] },
    "calendarmcp":  { "command": "npx", "args": ["-y", "@aernoud/calendarmcp"] },
    "printmcp":     { "command": "npx", "args": ["-y", "@aernoud/printmcp"] },
    "facetimemcp":  { "command": "npx", "args": ["-y", "@aernoud/facetimemcp"] }
  }
}
```

## How it works

Each server runs locally over stdio. The Mail, Numbers, and Contacts servers build AppleScript strings, execute them via `osascript`, and parse the structured output back into JSON. The Print server shells out to CUPS (`lp`, `lpstat`, `lpoptions`, `cancel`); the FaceTime server hands `tel://` / `facetime://` URLs to `open`. A shared package (`@mailappmcp/shared`) provides the AppleScript runner, the generic command runner (`runCommand`), string escaping, and delimiter-based parsing.

### Safety

- `compose-message` opens a visible draft — you review before sending
- `send-message` is a separate, explicit action
- `reply-to-message` and `forward-message` default to draft mode (`sendImmediately: false`)
- `delete-messages` moves to Trash (standard Mail.app behavior)

## Known limitations

### General

- `osascript` has a 30-second timeout per call
- Apps must be running (or will be auto-launched by AppleScript)

### Mail
- `content contains` searches in AppleScript can be slow on large mailboxes — Mail server searches subject and sender by default

### Numbers
- Numbers tools require an open document

### Calendar

These are limitations of Calendar.app's AppleScript interface itself, not the MCP server:

- **Calendars cannot be deleted via AppleScript.** `delete calendar` raises `-10000` (AppleEvent handler failed) on every modern macOS version. The `delete-calendar` tool checks that the calendar exists and then returns a descriptive error — you must remove calendars manually from the Calendar.app sidebar (right-click → Delete).
- **Calendars have no usable id/uid.** Calendar.app's `calendar` class does not expose a stable id via AppleScript (`uid of` raises `-10000`). All calendar tools therefore identify calendars by **name** — make sure your calendar names are unique.
- **`whose` filters are O(n) over events.** AppleScript scans every event in a calendar to evaluate `whose start date ≥ X` predicates. On a busy multi-calendar store, even an empty 7-day query across all calendars can take 60+ seconds and exceed the 30 s `osascript` timeout. **Always pass a `calendarName` to `list-events`, `search-events`, `today-events`, and `upcoming-events` when possible** to scope the scan. `search-events` additionally enforces a date window (default: −30 days to +365 days).
- **`move-event` reassigns the uid.** Calendar.app cannot reparent an event between calendars. The tool deletes the source event and creates a new one in the target calendar; the new event has a fresh uid (returned as `newUid` alongside `oldUid`).
- **Recurrence is exposed as raw RRULE strings** (e.g. `FREQ=WEEKLY;INTERVAL=1`) — read and write only, no parsing or expansion.

## License

MIT
