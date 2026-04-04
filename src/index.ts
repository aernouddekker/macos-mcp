#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { listMailboxes } from "./tools/listMailboxes.js";
import { searchMessages } from "./tools/searchMessages.js";
import { readMessage } from "./tools/readMessage.js";
import { composeMessage } from "./tools/composeMessage.js";
import { sendMessage } from "./tools/sendMessage.js";
import { replyToMessage } from "./tools/replyToMessage.js";

const server = new McpServer({
  name: "mailappmcp",
  version: "0.1.0",
});

server.tool(
  "list-mailboxes",
  "List all mailboxes across all Mail.app accounts with unread counts",
  {},
  async () => {
    const mailboxes = await listMailboxes();
    return { content: [{ type: "text", text: JSON.stringify(mailboxes, null, 2) }] };
  },
);

server.tool(
  "search-messages",
  "Search messages in a mailbox by subject or sender",
  {
    account: z.string().describe("Mail account name (e.g. 'iCloud', 'Gmail')"),
    mailbox: z.string().describe("Mailbox name (e.g. 'INBOX', 'Sent Messages')"),
    query: z.string().describe("Search query — matches against subject and sender"),
    limit: z.number().optional().default(25).describe("Max results to return"),
  },
  async ({ account, mailbox, query, limit }) => {
    const messages = await searchMessages(account, mailbox, query, limit);
    return { content: [{ type: "text", text: JSON.stringify(messages, null, 2) }] };
  },
);

server.tool(
  "read-message",
  "Read the full content of a specific email message",
  {
    account: z.string().describe("Mail account name"),
    mailbox: z.string().describe("Mailbox name"),
    messageId: z.string().describe("RFC Message-ID of the email (from search results)"),
  },
  async ({ account, mailbox, messageId }) => {
    const message = await readMessage(account, mailbox, messageId);
    if (!message) {
      return { content: [{ type: "text", text: "Message not found." }] };
    }
    return { content: [{ type: "text", text: JSON.stringify(message, null, 2) }] };
  },
);

server.tool(
  "compose-message",
  "Create a new email draft in Mail.app (opens compose window, does NOT send)",
  {
    to: z.array(z.string()).describe("Recipient email addresses"),
    subject: z.string().describe("Email subject"),
    body: z.string().describe("Email body text"),
    cc: z.array(z.string()).optional().describe("CC email addresses"),
  },
  async ({ to, subject, body, cc }) => {
    const result = await composeMessage(to, subject, body, cc);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "send-message",
  "Create and immediately send an email via Mail.app",
  {
    to: z.array(z.string()).describe("Recipient email addresses"),
    subject: z.string().describe("Email subject"),
    body: z.string().describe("Email body text"),
    cc: z.array(z.string()).optional().describe("CC email addresses"),
  },
  async ({ to, subject, body, cc }) => {
    const result = await sendMessage(to, subject, body, cc);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "reply-to-message",
  "Reply to an existing email message",
  {
    account: z.string().describe("Mail account name"),
    mailbox: z.string().describe("Mailbox name"),
    messageId: z.string().describe("RFC Message-ID of the email to reply to"),
    body: z.string().describe("Reply body text"),
    replyAll: z.boolean().optional().default(false).describe("Reply to all recipients"),
    sendImmediately: z.boolean().optional().default(false).describe("Send immediately instead of opening as draft"),
  },
  async ({ account, mailbox, messageId, body, replyAll, sendImmediately }) => {
    const result = await replyToMessage(account, mailbox, messageId, body, replyAll, sendImmediately);
    if (!result) {
      return { content: [{ type: "text", text: "Original message not found." }] };
    }
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
