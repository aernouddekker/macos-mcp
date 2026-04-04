import { runAppleScript, escapeForAppleScript } from "../applescript.js";

export async function markAsRead(
  account: string,
  mailbox: string,
  messageIds: string[],
) {
  const acct = escapeForAppleScript(account);
  const mbox = escapeForAppleScript(mailbox);

  let updatedCount = 0;
  for (const msgId of messageIds) {
    const id = escapeForAppleScript(msgId);
    const script = `
tell application "Mail"
  set msgs to (messages of mailbox "${mbox}" of account "${acct}" whose message id is "${id}")
  if (count of msgs) > 0 then
    set read status of item 1 of msgs to true
    return "done"
  end if
  return "not_found"
end tell`;

    const result = await runAppleScript(script);
    if (result === "done") updatedCount++;
  }

  return { updatedCount, requestedCount: messageIds.length };
}
