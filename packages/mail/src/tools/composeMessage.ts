import { runAppleScript, runJXA, escapeForAppleScript, withLaunch, jsLiteral } from "../lib/applescript.js";

export async function composeMessage(
  to: string[],
  subject: string,
  body: string,
  cc?: string[],
  htmlBody?: string,
) {
  if (htmlBody !== undefined) {
    return composeHtmlMessage(to, subject, body, cc, htmlBody);
  }

  const subj = escapeForAppleScript(subject);
  const content = escapeForAppleScript(body);

  const toRecipients = to
    .map((addr) => `make new to recipient at end of to recipients with properties {address:"${escapeForAppleScript(addr)}"}`)
    .join("\n    ");

  const ccRecipients = (cc ?? [])
    .map((addr) => `make new cc recipient at end of cc recipients with properties {address:"${escapeForAppleScript(addr)}"}`)
    .join("\n    ");

  const script = withLaunch("Mail", `
tell application "Mail"
  set newMsg to make new outgoing message with properties {subject:"${subj}", content:"${content}", visible:true}
  tell newMsg
    ${toRecipients}
    ${ccRecipients}
  end tell
  return id of newMsg
end tell`);

  const msgId = await runAppleScript(script);
  return { outgoingMessageId: msgId.trim(), status: "draft_created" as const };
}

async function composeHtmlMessage(
  to: string[],
  subject: string,
  body: string,
  cc: string[] | undefined,
  htmlBody: string,
) {
  // JXA path: Mail.app's outgoing message exposes an `htmlContent` setter
  // (not in the .sdef but supported at runtime) that converts an HTML string
  // into rich-text body, so the recipient sees rendered formatting instead of
  // raw tags. The plain `body` is still set as the content fallback for any
  // client/log that reads the plain-text representation.
  const script = `
var Mail = Application('Mail');
var msg = Mail.OutgoingMessage({
  subject: ${jsLiteral(subject)},
  content: ${jsLiteral(body)},
  visible: true
});
Mail.outgoingMessages.push(msg);
msg.htmlContent = ${jsLiteral(htmlBody)};
${jsLiteral(to)}.forEach(function(addr) {
  msg.toRecipients.push(Mail.ToRecipient({address: addr}));
});
${jsLiteral(cc ?? [])}.forEach(function(addr) {
  msg.ccRecipients.push(Mail.CcRecipient({address: addr}));
});
msg.id();
`;

  const msgId = await runJXA(script);
  return { outgoingMessageId: msgId.trim(), status: "draft_created" as const };
}
