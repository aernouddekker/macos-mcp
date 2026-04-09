import { runAppleScript, escapeForAppleScript, withLaunch } from "../lib/applescript.js";

export async function markAsJunk(
  account: string,
  mailbox: string,
  messageIds: string[],
  isJunk: boolean = true,
) {
  const acct = escapeForAppleScript(account);
  const mbox = escapeForAppleScript(mailbox);
  const junkValue = isJunk ? "true" : "false";

  let updatedCount = 0;
  for (const msgId of messageIds) {
    const id = escapeForAppleScript(msgId);
    const script = withLaunch("Mail", `
tell application "Mail"
  set msgs to (messages of mailbox "${mbox}" of account "${acct}" whose message id is "${id}")
  if (count of msgs) > 0 then
    set junk mail status of item 1 of msgs to ${junkValue}
    return "updated"
  end if
  return "not_found"
end tell`);

    const result = await runAppleScript(script);
    if (result === "updated") updatedCount++;
  }

  return { updatedCount, requestedCount: messageIds.length };
}
