import { runAppleScript, escapeForAppleScript, withLaunch } from "../lib/applescript.js";

export async function getMessageSource(
  account: string,
  mailbox: string,
  messageId: string,
) {
  const acct = escapeForAppleScript(account);
  const mbox = escapeForAppleScript(mailbox);
  const msgId = escapeForAppleScript(messageId);

  const script = withLaunch("Mail", `
tell application "Mail"
  set msgs to (messages of mailbox "${mbox}" of account "${acct}" whose message id is "${msgId}")
  if (count of msgs) is 0 then
    return "NOT_FOUND"
  end if
  return source of item 1 of msgs
end tell`);

  const raw = await runAppleScript(script);
  if (raw === "NOT_FOUND") {
    return null;
  }

  return { source: raw };
}
