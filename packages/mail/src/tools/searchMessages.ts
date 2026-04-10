import { runAppleScript, escapeForAppleScript, parseRecords, withLaunch, FIELD_SEP, RECORD_SEP } from "../lib/applescript.js";

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

  const script = withLaunch("Mail", `
tell application "Mail"
  set msgs to (messages of mailbox "${mbox}" of account "${acct}"${filter})
  set output to ""
  set maxCount to ${limit}
  set i to 0
  repeat with m in msgs
    if i >= maxCount then exit repeat
    set mId to ""
    try
      set mId to (id of m) as string
    end try
    set mSubject to ""
    try
      set mSubject to subject of m as string
      if mSubject is "missing value" then set mSubject to ""
    end try
    set mSender to ""
    try
      set mSender to sender of m as string
      if mSender is "missing value" then set mSender to ""
    end try
    set mDate to ""
    try
      set mDate to (date received of m) as string
    end try
    set mRead to ""
    try
      set mRead to (read status of m) as string
    end try
    set mMsgId to ""
    try
      set mMsgId to message id of m as string
      if mMsgId is "missing value" then set mMsgId to ""
    end try
    set output to output & mId & "${FIELD_SEP}" & mSubject & "${FIELD_SEP}" & mSender & "${FIELD_SEP}" & mDate & "${FIELD_SEP}" & mRead & "${FIELD_SEP}" & mMsgId & "${RECORD_SEP}"
    set i to i + 1
  end repeat
  return output
end tell`);

  const raw = await runAppleScript(script);
  return parseRecords(raw, ["id", "subject", "sender", "dateReceived", "isRead", "messageId"]);
}
