import { runAppleScript, escapeForAppleScript, parseRecords, FIELD_SEP, RECORD_SEP } from "../lib/applescript.js";

export async function listAttachments(
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
  if (count of msgs) is 0 then return "NOT_FOUND"
  set m to item 1 of msgs
  set output to ""
  repeat with att in mail attachments of m
    set output to output & (name of att) & "${FIELD_SEP}" & (MIME type of att) & "${FIELD_SEP}" & (file size of att) & "${FIELD_SEP}" & (downloaded of att) & "${RECORD_SEP}"
  end repeat
  return output
end tell`;

  const raw = await runAppleScript(script);
  if (raw === "NOT_FOUND") {
    return null;
  }

  const records = parseRecords(raw, ["name", "mimeType", "fileSize", "downloaded"]);
  return records.map((r) => ({
    name: r.name,
    mimeType: r.mimeType,
    fileSize: parseInt(r.fileSize, 10),
    downloaded: r.downloaded === "true",
  }));
}
