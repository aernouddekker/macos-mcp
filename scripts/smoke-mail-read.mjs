// Read-only live check. Usage: node scripts/smoke-mail-read.mjs ACCOUNT MAILBOX [LOCAL_ID]
// Requires Mail.app to be running; prints only timing and body length, never email contents.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const [account, mailbox, suppliedId] = process.argv.slice(2);
assert.ok(account && mailbox, "Usage: node scripts/smoke-mail-read.mjs ACCOUNT MAILBOX [LOCAL_ID]");
execFileSync("pgrep", ["-x", "Mail"], { stdio: "ignore" });
const client = new Client({ name: "mail-read-smoke", version: "1.0.0" });
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [fileURLToPath(new URL("../packages/mail/dist/index.js", import.meta.url))],
  stderr: "ignore",
});

async function call(name, args) {
  const result = await client.callTool({ name, arguments: args });
  // Do not print errors containing scripts or message data.
  assert.ok(!result.isError, `${name} failed`);
  return result.content.filter(item => item.type === "text").map(item => item.text).join("\n");
}

try {
  await client.connect(transport);
  let id = suppliedId;
  if (!id) {
    const messages = JSON.parse(await call("search-messages", { account, mailbox, query: "", limit: 1 }));
    assert.ok(messages.length, "Mailbox is empty");
    id = messages[0].id;
  }
  assert.match(id, /^[1-9]\d*$/);
  const started = Date.now();
  const message = JSON.parse(await call("read-message", { account, mailbox, messageId: id }));
  assert.ok(message.body.length > 0, "Expected a nonempty message body");
  console.log(JSON.stringify({ readSucceeded: true, elapsedMs: Date.now() - started, bodyCharacters: message.body.length }));
  assert.equal(await call("read-message", { account, mailbox, messageId: "2147483647" }), "Message not found.");
  console.log("Missing local ID correctly returns not found");
} finally {
  await client.close();
}
