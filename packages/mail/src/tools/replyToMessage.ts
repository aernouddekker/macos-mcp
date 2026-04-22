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

  const attachmentLines = (attachments ?? [])
    .map((path) => `    make new attachment with properties {file name:POSIX file "${escapeForAppleScript(path)}"} at after the last paragraph`)
    .join("\n");
  const attachmentBlock = attachmentLines
    ? `tell replyMsg\n${attachmentLines}\n  end tell`
    : "";

  const sendBlock = sendImmediately
    ? `tell application "Mail" to send replyMsg`
    : "";

  // Outgoing replies in modern Mail use a rich-text NSAttributedString editor
  // that is *not* exposed via the AppleScript `content` property — the getter
  // returns an empty string and setting it clears the editor instead of
  // filling it. So we inject the body via the pasteboard: the cursor opens
  // above the auto-quoted thread, so one Cmd-V inserts our text without
  // disturbing the quoted section, signature, or In-Reply-To / References
  // headers set by the `reply` verb.
  const script = withLaunch("Mail", `
tell application "Mail"
  set msgs to (messages of mailbox "${mbox}" of account "${acct}" whose message id is "${msgId}")
  if (count of msgs) is 0 then
    return "NOT_FOUND"
  end if
  set m to item 1 of msgs
  set replyMsg to reply m ${replyParams}
  ${attachmentBlock}
end tell

set savedClip to ""
try
  set savedClip to (the clipboard as text)
end try
set the clipboard to "${content}"

tell application "Mail" to activate
delay 0.3
set pasteErr to missing value
try
  tell application "System Events"
    tell process "Mail"
      set frontmost to true
      delay 0.2
      if frontmost is false then
        error "Mail lost focus before body paste — aborting to avoid pasting into another app"
      end if
      keystroke "v" using command down
      delay 0.3
    end tell
  end tell
on error errText
  set pasteErr to errText
end try
try
  set the clipboard to savedClip
end try
if pasteErr is not missing value then error pasteErr

${sendBlock}

tell application "Mail"
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
