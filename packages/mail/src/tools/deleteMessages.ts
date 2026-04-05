import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";

export async function deleteMessages(
  account: string,
  mailbox: string,
  messageIds: string[],
) {
  const acct = escapeForAppleScript(account);
  const mbox = escapeForAppleScript(mailbox);

  let deletedCount = 0;
  for (const msgId of messageIds) {
    const id = escapeForAppleScript(msgId);
    const script = `
tell application "Mail"
  set msgs to (messages of mailbox "${mbox}" of account "${acct}" whose message id is "${id}")
  if (count of msgs) > 0 then
    delete item 1 of msgs
    return "deleted"
  end if
  return "not_found"
end tell`;

    const result = await runAppleScript(script);
    if (result === "deleted") deletedCount++;
  }

  return { deletedCount, requestedCount: messageIds.length };
}
