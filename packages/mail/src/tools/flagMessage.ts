import { runAppleScript, escapeForAppleScript } from "../lib/applescript.js";

export async function flagMessage(
  account: string,
  mailbox: string,
  messageIds: string[],
  flagIndex: number,
) {
  const acct = escapeForAppleScript(account);
  const mbox = escapeForAppleScript(mailbox);

  const unflag = flagIndex === -1;

  let updatedCount = 0;
  for (const msgId of messageIds) {
    const id = escapeForAppleScript(msgId);
    const flagLines = unflag
      ? `set flagged status of item 1 of msgs to false`
      : `set flagged status of item 1 of msgs to true
    set flag index of item 1 of msgs to ${flagIndex}`;

    const script = `
tell application "Mail"
  set msgs to (messages of mailbox "${mbox}" of account "${acct}" whose message id is "${id}")
  if (count of msgs) > 0 then
    ${flagLines}
    return "updated"
  end if
  return "not_found"
end tell`;

    const result = await runAppleScript(script);
    if (result === "updated") updatedCount++;
  }

  return { updatedCount, requestedCount: messageIds.length };
}
