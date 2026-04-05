import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";

export async function sendMessage(
  to: string[],
  subject: string,
  body: string,
  cc?: string[],
  from?: string,
  attachments?: string[],
) {
  const subj = escapeForAppleScript(subject);
  const content = escapeForAppleScript(body);

  const senderProp = from ? `, sender:"${escapeForAppleScript(from)}"` : "";

  const toRecipients = to
    .map((addr) => `make new to recipient at end of to recipients with properties {address:"${escapeForAppleScript(addr)}"}`)
    .join("\n    ");

  const ccRecipients = (cc ?? [])
    .map((addr) => `make new cc recipient at end of cc recipients with properties {address:"${escapeForAppleScript(addr)}"}`)
    .join("\n    ");

  const attachmentLines = (attachments ?? [])
    .map((path) => `make new attachment with properties {file name:POSIX file "${escapeForAppleScript(path)}"} at after the last paragraph`)
    .join("\n    ");

  const script = `
tell application "Mail"
  set newMsg to make new outgoing message with properties {subject:"${subj}", content:"${content}", visible:false${senderProp}}
  tell newMsg
    ${toRecipients}
    ${ccRecipients}
    ${attachmentLines}
  end tell
  send newMsg
  return "sent"
end tell`;

  await runAppleScript(script);
  return { status: "sent" as const };
}
