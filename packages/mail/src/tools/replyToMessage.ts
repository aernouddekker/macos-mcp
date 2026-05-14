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

  const hasAttachments = (attachments ?? []).length > 0;
  const attachmentPasteSteps = hasAttachments
    ? [
        // Cursor-to-end once before the first attachment so files land after
        // the quoted thread, matching the original `at after the last
        // paragraph` intent.
        `tell application "System Events"
  tell process "Mail"
    if frontmost is false then
      error "Mail lost focus before attachment — aborting"
    end if
    key code 125 using command down
    delay 0.2
  end tell
end tell`,
        ...(attachments ?? []).map((path) => {
          const escaped = escapeForAppleScript(path);
          return `
set the clipboard to (POSIX file "${escaped}")
delay 0.15
tell application "System Events"
  tell process "Mail"
    if frontmost is false then
      error "Mail lost focus before attachment paste — aborting"
    end if
    keystroke "v" using command down
    delay 0.3
  end tell
end tell`;
        }),
      ].join("\n")
    : "";

  const sendBlock = sendImmediately
    ? `tell application "Mail" to send replyMsg`
    : "";

  // Strip cc-rewrite logic when not replyAll — keeps the AppleScript small.
  const ccRewriteBlock = replyAll
    ? `
    repeat with j from (count of cc recipients of replyMsg) to 1 by -1
      delete (cc recipient j of replyMsg)
    end repeat
    repeat with addr in origCcList
      make new cc recipient at end of cc recipients of replyMsg with properties {address:(contents of addr)}
    end repeat`
    : "";

  // Outgoing replies in modern Mail use a rich-text NSAttributedString editor
  // that is *not* exposed via the AppleScript `content` property — the getter
  // returns an empty string and setting it clears the editor instead of
  // filling it. So we inject the body via the pasteboard: the cursor opens
  // above the auto-quoted thread, so one Cmd-V inserts our text without
  // disturbing the quoted section, signature, or In-Reply-To / References
  // headers set by the `reply` verb.
  //
  // `make new attachment` has the same rich-text-clobber problem on replies
  // (verified empirically — it wipes the quoted thread even when invoked
  // without an `at` clause), so attachments also go through the pasteboard:
  // each path is put on the clipboard as a `POSIX file` and pasted into the
  // draft, which attaches the file without resetting the editor.
  //
  // Sent-by-me detection: `reply` addresses the new draft to the original
  // sender. For messages in Sent Messages the original sender is the user,
  // so the reply ends up addressed back to themselves. Detect this by
  // matching the original sender against every email address configured on
  // every Mail account (which includes iCloud Custom Domain aliases), and
  // when true, replace the auto-populated to/cc recipients with the original
  // audience captured before `reply` was called.
  const script = withLaunch("Mail", `
tell application "Mail"
  set msgs to (messages of mailbox "${mbox}" of account "${acct}" whose message id is "${msgId}")
  if (count of msgs) is 0 then
    return "NOT_FOUND"
  end if
  set m to item 1 of msgs

  set senderAddress to extract address from (sender of m)
  set isSentByMe to false
  repeat with anAccount in every account
    try
      if (email addresses of anAccount) contains senderAddress then
        set isSentByMe to true
        exit repeat
      end if
    end try
  end repeat

  set origToList to {}
  try
    repeat with r in (to recipients of m)
      set end of origToList to (address of r)
    end repeat
  end try
  set origCcList to {}
  try
    repeat with r in (cc recipients of m)
      set end of origCcList to (address of r)
    end repeat
  end try

  set replyMsg to reply m ${replyParams}

  if isSentByMe then
    repeat with i from (count of to recipients of replyMsg) to 1 by -1
      delete (to recipient i of replyMsg)
    end repeat
    repeat with addr in origToList
      make new to recipient at end of to recipients of replyMsg with properties {address:(contents of addr)}
    end repeat${ccRewriteBlock}
  end if
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
  ${attachmentPasteSteps}
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
