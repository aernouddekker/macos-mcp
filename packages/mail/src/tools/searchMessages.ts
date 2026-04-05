import { runAppleScript, escapeForAppleScript, parseRecords, FIELD_SEP, RECORD_SEP } from "@mailappmcp/shared";

export async function searchMessages(
  account: string,
  mailbox: string,
  query: string,
  limit: number = 25,
) {
  const q = escapeForAppleScript(query);
  const acct = escapeForAppleScript(account);
  const mbox = escapeForAppleScript(mailbox);

  const filter = q
    ? ` whose subject contains "${q}" or sender contains "${q}"`
    : "";

  const script = `
tell application "Mail"
  set msgs to (messages of mailbox "${mbox}" of account "${acct}"${filter})
  set output to ""
  set maxCount to ${limit}
  set i to 0
  repeat with m in msgs
    if i >= maxCount then exit repeat
    set output to output & (id of m) & "${FIELD_SEP}" & (subject of m) & "${FIELD_SEP}" & (sender of m) & "${FIELD_SEP}" & (date received of m as string) & "${FIELD_SEP}" & (read status of m) & "${FIELD_SEP}" & (message id of m) & "${RECORD_SEP}"
    set i to i + 1
  end repeat
  return output
end tell`;

  const raw = await runAppleScript(script);
  return parseRecords(raw, ["id", "subject", "sender", "dateReceived", "isRead", "messageId"]);
}
