import { runAppleScript, parseRecords, FIELD_SEP, RECORD_SEP } from "../lib/applescript.js";

export async function listMailboxes() {
  const script = `
tell application "Mail"
  set output to ""
  repeat with acct in every account
    set acctName to name of acct
    repeat with mbox in every mailbox of acct
      set output to output & acctName & "${FIELD_SEP}" & name of mbox & "${FIELD_SEP}" & (count of (messages of mbox whose read status is false)) & "${RECORD_SEP}"
    end repeat
  end repeat
  return output
end tell`;

  const raw = await runAppleScript(script);
  return parseRecords(raw, ["account", "mailbox", "unreadCount"]);
}
