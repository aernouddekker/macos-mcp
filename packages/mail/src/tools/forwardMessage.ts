import { runAppleScript, escapeForAppleScript, withLaunch } from "../lib/applescript.js";

export async function forwardMessage(
  account: string,
  mailbox: string,
  messageId: string,
  to: string[],
  body?: string,
  sendImmediately: boolean = false,
) {
  const acct = escapeForAppleScript(account);
  const mbox = escapeForAppleScript(mailbox);
  const msgId = escapeForAppleScript(messageId);

  const recipientLines = to
    .map((addr) => {
      const escaped = escapeForAppleScript(addr);
      return `    make new to recipient at end of to recipients of fwdMsg with properties {address:"${escaped}"}`;
    })
    .join("\n");

  // Outgoing forwards share the rich-text-editor desync that reply hits:
  // `set content of fwdMsg to "..." & (content of fwdMsg)` clears the
  // auto-quoted forwarded body instead of prepending. Recipient mutation via
  // `make new to recipient` is safe (separate property), so we keep that
  // AppleScript path and only route the cover-note body through the
  // pasteboard — see replyToMessage.ts for the full rationale.
  const bodyPasteBlock = body
    ? `
set savedClip to ""
try
  set savedClip to (the clipboard as text)
end try
set the clipboard to "${escapeForAppleScript(body)}"

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
`
    : "";

  const sendBlock = sendImmediately ? `tell application "Mail" to send fwdMsg` : "";

  const script = withLaunch("Mail", `
tell application "Mail"
  set msgs to (messages of mailbox "${mbox}" of account "${acct}" whose message id is "${msgId}")
  if (count of msgs) is 0 then
    return "NOT_FOUND"
  end if
  set m to item 1 of msgs
  set fwdMsg to forward m with opening window
${recipientLines}
end tell

${bodyPasteBlock}

${sendBlock}

tell application "Mail"
  return subject of fwdMsg
end tell`, { keepOpen: !sendImmediately });

  const raw = await runAppleScript(script);
  if (raw === "NOT_FOUND") {
    return null;
  }

  return {
    subject: raw.trim(),
    status: sendImmediately ? ("sent" as const) : ("draft_created" as const),
  };
}
