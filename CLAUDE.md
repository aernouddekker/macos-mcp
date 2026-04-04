# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A macOS Mail.app MCP server — a Node.js/TypeScript server using `@modelcontextprotocol/sdk` that wraps AppleScript calls to Mail.app via `osascript`. Gives Claude Code and Cowork native email access. Runs locally, no auth needed, works with any account configured in Mail.app (iCloud, Gmail, etc.).

## Build & Run

```bash
npm run build          # Compile TypeScript → dist/
npm start              # Run the MCP server (stdio transport)
```

There are no tests yet. The server communicates over stdio — it's not an HTTP server.

## Architecture

**Transport:** Stdio via `StdioServerTransport`. No HTTP, no SSE.

**Entry point:** `src/index.ts` — creates `McpServer`, registers all eight tools with Zod schemas, connects transport.

**AppleScript layer:** `src/applescript.ts` — `runAppleScript()` executes scripts via `child_process.execFile("osascript", ...)`. Uses delimiter-based parsing (`|||` between fields, `~~~` between records) to convert AppleScript string output into structured JSON. `escapeForAppleScript()` handles quote/backslash escaping for user input interpolated into scripts.

**Eight tools in `src/tools/`:**

| Tool | File | What it does |
|------|------|-------------|
| `list-mailboxes` | `listMailboxes.ts` | Lists all mailboxes across all accounts with unread counts |
| `search-messages` | `searchMessages.ts` | Searches messages in a mailbox by subject/sender |
| `read-message` | `readMessage.ts` | Reads full email content by RFC Message-ID |
| `compose-message` | `composeMessage.ts` | Creates a draft (opens compose window, does NOT send) |
| `send-message` | `sendMessage.ts` | Creates and immediately sends an email (supports from/attachments) |
| `reply-to-message` | `replyToMessage.ts` | Replies to an existing message (supports reply-all) |
| `delete-messages` | `deleteMessages.ts` | Deletes messages by RFC Message-ID |
| `mark-as-read` | `markAsRead.ts` | Marks messages as read by RFC Message-ID |

**Message addressing:** Messages are identified by the triple (account, mailbox, messageId) where messageId is the RFC Message-ID header. `search-messages` returns these; `read-message`, `reply-to-message`, `delete-messages`, and `mark-as-read` consume them.

**Safety:** `compose-message` creates a visible draft without sending. `send-message` is a separate explicit action. `reply-to-message` has a `sendImmediately` flag (defaults to false).

## Key Constraints

- AppleScript string escaping is critical — all user input must go through `escapeForAppleScript()` before interpolation into scripts.
- `osascript` has a 30s timeout and 10MB buffer limit (configured in `applescript.ts`).
- `content contains` searches in AppleScript can be very slow on large mailboxes.
- Mail.app must be running (or will be auto-launched by `tell application "Mail"`).
