import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";

export async function replyToMessage(
  account: string,
  mailbox: string,
  messageId: string,
  body: string,
  replyAll: boolean = false,
  sendImmediately: boolean = false,
) {
  const acct = escapeForAppleScript(account);
  const mbox = escapeForAppleScript(mailbox);
  const msgId = escapeForAppleScript(messageId);
  const content = escapeForAppleScript(body);

  const replyCmd = replyAll ? "reply m replying to all" : "reply m";
  const sendCmd = sendImmediately ? "send replyMsg" : "";

  const script = `
tell application "Mail"
  set msgs to (messages of mailbox "${mbox}" of account "${acct}" whose message id is "${msgId}")
  if (count of msgs) is 0 then
    return "NOT_FOUND"
  end if
  set m to item 1 of msgs
  set replyMsg to ${replyCmd} with opening window
  set content of replyMsg to "${content}" & return & return & (content of replyMsg)
  ${sendCmd}
  return subject of replyMsg
end tell`;

  const raw = await runAppleScript(script);
  if (raw === "NOT_FOUND") {
    return null;
  }

  return {
    subject: raw.trim(),
    status: sendImmediately ? ("sent" as const) : ("draft_created" as const),
  };
}
