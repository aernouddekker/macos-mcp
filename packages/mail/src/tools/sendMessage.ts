import { runAppleScript, runJXA, escapeForAppleScript, jsLiteral } from "../lib/applescript.js";

export async function sendMessage(
  to: string[],
  subject: string,
  body: string,
  cc?: string[],
  from?: string,
  attachments?: string[],
  htmlBody?: string,
) {
  if (htmlBody !== undefined) {
    return sendHtmlMessage(to, subject, body, cc, from, attachments, htmlBody);
  }

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

async function sendHtmlMessage(
  to: string[],
  subject: string,
  body: string,
  cc: string[] | undefined,
  from: string | undefined,
  attachments: string[] | undefined,
  htmlBody: string,
) {
  // JXA path — see composeMessage for rationale. We assemble the message,
  // assign htmlContent so the wire body is HTML, then send.
  const senderAssign = from
    ? `msg.sender = ${jsLiteral(from)};`
    : "";

  const script = `
var Mail = Application('Mail');
var msg = Mail.OutgoingMessage({
  subject: ${jsLiteral(subject)},
  content: ${jsLiteral(body)},
  visible: false
});
Mail.outgoingMessages.push(msg);
${senderAssign}
msg.htmlContent = ${jsLiteral(htmlBody)};
${jsLiteral(to)}.forEach(function(addr) {
  msg.toRecipients.push(Mail.ToRecipient({address: addr}));
});
${jsLiteral(cc ?? [])}.forEach(function(addr) {
  msg.ccRecipients.push(Mail.CcRecipient({address: addr}));
});
${jsLiteral(attachments ?? [])}.forEach(function(p) {
  msg.content.attachments.push(Mail.Attachment({fileName: Path(p)}));
});
Mail.send(msg);
"sent";
`;

  await runJXA(script);
  return { status: "sent" as const };
}
