import { runAppleScript, escapeForAppleScript } from "../applescript.js";

export async function composeMessage(
  to: string[],
  subject: string,
  body: string,
  cc?: string[],
) {
  const subj = escapeForAppleScript(subject);
  const content = escapeForAppleScript(body);

  const toRecipients = to
    .map((addr) => `make new to recipient at end of to recipients with properties {address:"${escapeForAppleScript(addr)}"}`)
    .join("\n    ");

  const ccRecipients = (cc ?? [])
    .map((addr) => `make new cc recipient at end of cc recipients with properties {address:"${escapeForAppleScript(addr)}"}`)
    .join("\n    ");

  const script = `
tell application "Mail"
  set newMsg to make new outgoing message with properties {subject:"${subj}", content:"${content}", visible:true}
  tell newMsg
    ${toRecipients}
    ${ccRecipients}
  end tell
  return id of newMsg
end tell`;

  const msgId = await runAppleScript(script);
  return { outgoingMessageId: msgId.trim(), status: "draft_created" as const };
}
