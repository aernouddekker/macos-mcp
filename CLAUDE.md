# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A monorepo of macOS MCP servers that wrap AppleScript calls to native macOS apps via `osascript`. Gives Claude Code and Cowork native access to Mail, Numbers, and Contacts. Runs locally, no auth needed, works with any accounts configured in the respective apps.

## Build & Run

```bash
npm install               # Install all workspace dependencies
npm run build             # Build all packages (shared → mail → numbers → contacts)
npm run build --workspace=packages/mail      # Build a single package
```

No tests yet. All servers communicate over stdio — they're not HTTP servers.

## Architecture

**Monorepo:** npm workspaces with four packages under `packages/`.

**Shared package (`@mailappmcp/shared`):** `packages/shared/src/applescript.ts` — `runAppleScript()` executes scripts via `child_process.execFile("osascript", ...)`. Uses delimiter-based parsing (`|||` between fields, `~~~` between records). `escapeForAppleScript()` handles quote/backslash escaping.

**Three MCP servers:**

| Package | npm name | App | Tools |
|---------|----------|-----|-------|
| `packages/mail` | `mailappmcp` | Mail.app | 13 tools: list-mailboxes, search-messages, read-message, compose-message, send-message, reply-to-message, delete-messages, mark-as-read, move-messages, forward-message, save-attachment, flag-message, check-for-new-mail |
| `packages/numbers` | `numbersmcp` | Numbers.app | 24 tools: list-spreadsheets, list-sheets, read-range, write-cell, write-range, add-row, read-table, get-formula, set-formula, add-column, delete-column, delete-row, add-sheet, delete-sheet, rename-sheet, add-table, delete-table, rename-table, sort-table, merge-cells, unmerge-cells, set-cell-format, set-cell-style, export-document |
| `packages/contacts` | `contactsmcp` | Contacts.app | 12 tools: search-contacts, read-contact, create-contact, update-contact, list-groups, add-to-group, remove-from-group, delete-contact, create-group, delete-group, rename-group, list-group-members |

**Pattern:** Each server's `src/index.ts` creates an `McpServer`, registers tools with Zod schemas, connects via `StdioServerTransport`. Each tool file builds an AppleScript string using helpers from `@mailappmcp/shared`, executes it, and parses the result.

## Key Constraints

- AppleScript string escaping is critical — all user input must go through `escapeForAppleScript()` before interpolation into scripts.
- `osascript` has a 30s timeout and 10MB buffer limit (configured in shared `applescript.ts`).
- Each macOS app must be running (or will be auto-launched by `tell application`).
- Numbers tools require an open document. Contacts tools work against the system address book.
- `compose-message` creates a visible draft without sending. `send-message` is a separate explicit action.
