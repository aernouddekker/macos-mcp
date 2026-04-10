import { runAppleScript, escapeForAppleScript, parseRecords, withLaunch, FIELD_SEP, RECORD_SEP } from "../lib/applescript.js";

export async function listAttachments(
  account: string,
  mailbox: string,
  messageId: string,
) {
  const acct = escapeForAppleScript(account);
  const mbox = escapeForAppleScript(mailbox);
  const msgId = escapeForAppleScript(messageId);

  const script = withLaunch("Mail", `
tell application "Mail"
  set msgs to (messages of mailbox "${mbox}" of account "${acct}" whose message id is "${msgId}")
  if (count of msgs) is 0 then return "NOT_FOUND"
  set m to item 1 of msgs
  set output to ""
  repeat with att in mail attachments of m
    set aName to ""
    try
      set aName to name of att as string
    end try
    set aMime to ""
    try
      set aMime to MIME type of att as string
      if aMime is "missing value" then set aMime to ""
    end try
    set aSize to ""
    try
      set aSize to (file size of att) as string
      if aSize is "missing value" then set aSize to "0"
    end try
    set aDl to ""
    try
      set aDl to (downloaded of att) as string
    end try
    set output to output & aName & "${FIELD_SEP}" & aMime & "${FIELD_SEP}" & aSize & "${FIELD_SEP}" & aDl & "${RECORD_SEP}"
  end repeat
  return output
end tell`);

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
