import { runAppleScript, escapeForAppleScript } from "../lib/applescript.js";

export async function redirectMessage(
  account: string,
  mailbox: string,
  messageId: string,
  to: string[],
  sendImmediately: boolean = false,
) {
  const acct = escapeForAppleScript(account);
  const mbox = escapeForAppleScript(mailbox);
  const msgId = escapeForAppleScript(messageId);

  const recipientLines = to
    .map((addr) => {
      const escaped = escapeForAppleScript(addr);
      return `    make new to recipient at end of to recipients of redirMsg with properties {address:"${escaped}"}`;
    })
    .join("\n");

  const sendLine = sendImmediately ? "send redirMsg" : "";

  const script = `
tell application "Mail"
  set msgs to (messages of mailbox "${mbox}" of account "${acct}" whose message id is "${msgId}")
  if (count of msgs) is 0 then
    return "NOT_FOUND"
  end if
  set m to item 1 of msgs
  set redirMsg to redirect m with opening window
${recipientLines}
  ${sendLine}
  return subject of redirMsg
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
