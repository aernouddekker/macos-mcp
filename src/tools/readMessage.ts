import { runAppleScript, escapeForAppleScript, FIELD_SEP } from "../applescript.js";

export async function readMessage(
  account: string,
  mailbox: string,
  messageId: string,
) {
  const acct = escapeForAppleScript(account);
  const mbox = escapeForAppleScript(mailbox);
  const msgId = escapeForAppleScript(messageId);

  const script = `
tell application "Mail"
  set msgs to (messages of mailbox "${mbox}" of account "${acct}" whose message id is "${msgId}")
  if (count of msgs) is 0 then
    return "NOT_FOUND"
  end if
  set m to item 1 of msgs
  set toRecips to ""
  repeat with r in to recipients of m
    set toRecips to toRecips & address of r & ","
  end repeat
  set ccRecips to ""
  repeat with r in cc recipients of m
    set ccRecips to ccRecips & address of r & ","
  end repeat
  return (subject of m) & "${FIELD_SEP}" & (sender of m) & "${FIELD_SEP}" & toRecips & "${FIELD_SEP}" & ccRecips & "${FIELD_SEP}" & (date received of m as string) & "${FIELD_SEP}" & (content of m)
end tell`;

  const raw = await runAppleScript(script);
  if (raw === "NOT_FOUND") {
    return null;
  }

  const parts = raw.split(FIELD_SEP);
  return {
    subject: (parts[0] ?? "").trim(),
    sender: (parts[1] ?? "").trim(),
    to: (parts[2] ?? "").trim().split(",").filter(Boolean),
    cc: (parts[3] ?? "").trim().split(",").filter(Boolean),
    dateReceived: (parts[4] ?? "").trim(),
    body: (parts[5] ?? "").trim(),
  };
}
