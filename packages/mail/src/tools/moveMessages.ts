import { runAppleScript, escapeForAppleScript } from "../lib/applescript.js";

export async function moveMessages(
  account: string,
  mailbox: string,
  messageIds: string[],
  toAccount: string,
  toMailbox: string,
) {
  const acct = escapeForAppleScript(account);
  const mbox = escapeForAppleScript(mailbox);
  const toAcct = escapeForAppleScript(toAccount);
  const toMbox = escapeForAppleScript(toMailbox);

  let movedCount = 0;
  for (const msgId of messageIds) {
    const id = escapeForAppleScript(msgId);
    const script = `
tell application "Mail"
  set msgs to (messages of mailbox "${mbox}" of account "${acct}" whose message id is "${id}")
  if (count of msgs) > 0 then
    set targetMbox to mailbox "${toMbox}" of account "${toAcct}"
    move (item 1 of msgs) to targetMbox
    return "moved"
  end if
  return "not_found"
end tell`;

    const result = await runAppleScript(script);
    if (result === "moved") movedCount++;
  }

  return { movedCount, requestedCount: messageIds.length };
}
