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

  const bodyLine = body
    ? `set content of fwdMsg to "${escapeForAppleScript(body)}" & return & return & (content of fwdMsg)`
    : "";

  const sendLine = sendImmediately ? "send fwdMsg" : "";

  const script = withLaunch("Mail", `
tell application "Mail"
  set msgs to (messages of mailbox "${mbox}" of account "${acct}" whose message id is "${msgId}")
  if (count of msgs) is 0 then
    return "NOT_FOUND"
  end if
  set m to item 1 of msgs
  set fwdMsg to forward m with opening window
${recipientLines}
  ${bodyLine}
  ${sendLine}
  return subject of fwdMsg
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
