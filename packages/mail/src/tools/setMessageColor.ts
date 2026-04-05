import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";

type MessageColor = "blue" | "gray" | "green" | "orange" | "purple" | "red" | "yellow" | "none";

export async function setMessageColor(
  account: string,
  mailbox: string,
  messageIds: string[],
  color: MessageColor,
) {
  const acct = escapeForAppleScript(account);
  const mbox = escapeForAppleScript(mailbox);

  const colorLine =
    color === "none"
      ? `set background color of item 1 of msgs to none`
      : `set background color of item 1 of msgs to ${color}`;

  let updatedCount = 0;
  for (const msgId of messageIds) {
    const id = escapeForAppleScript(msgId);
    const script = `
tell application "Mail"
  set msgs to (messages of mailbox "${mbox}" of account "${acct}" whose message id is "${id}")
  if (count of msgs) > 0 then
    ${colorLine}
    return "updated"
  end if
  return "not_found"
end tell`;

    const result = await runAppleScript(script);
    if (result === "updated") updatedCount++;
  }

  return { updatedCount, requestedCount: messageIds.length };
}
