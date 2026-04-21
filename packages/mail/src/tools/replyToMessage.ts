import { runAppleScript, escapeForAppleScript, withLaunch } from "../lib/applescript.js";

export async function replyToMessage(
  account: string,
  mailbox: string,
  messageId: string,
  body: string,
  replyAll: boolean = false,
  sendImmediately: boolean = false,
  attachments?: string[],
) {
  const acct = escapeForAppleScript(account);
  const mbox = escapeForAppleScript(mailbox);
  const msgId = escapeForAppleScript(messageId);
  const content = escapeForAppleScript(body);

  const replyParams = replyAll
    ? "with opening window, reply to all"
    : "with opening window";
  const sendCmd = sendImmediately ? "send replyMsg" : "";

  const attachmentLines = (attachments ?? [])
    .map((path) => `    make new attachment with properties {file name:POSIX file "${escapeForAppleScript(path)}"} at after the last paragraph`)
    .join("\n");
  const attachmentBlock = attachmentLines
    ? `tell replyMsg\n${attachmentLines}\n  end tell`
    : "";

  const script = withLaunch("Mail", `
tell application "Mail"
  set msgs to (messages of mailbox "${mbox}" of account "${acct}" whose message id is "${msgId}")
  if (count of msgs) is 0 then
    return "NOT_FOUND"
  end if
  set m to item 1 of msgs
  set replyMsg to reply m ${replyParams}
  set origBody to ""
  try
    set origBody to (content of replyMsg) as text
  end try
  set content of replyMsg to "${content}" & linefeed & linefeed & origBody
  ${attachmentBlock}
  ${sendCmd}
  return subject of replyMsg
end tell`);

  const raw = await runAppleScript(script);
  if (raw === "NOT_FOUND") {
    return null;
  }

  return {
    subject: raw.trim(),
    status: sendImmediately ? ("sent" as const) : ("draft_created" as const),
  };
}
