import { runAppleScript, parseRecords, withLaunch, FIELD_SEP, RECORD_SEP } from "../lib/applescript.js";

export async function listMailboxes() {
  const script = withLaunch("Mail", `
tell application "Mail"
  set output to ""
  repeat with acct in every account
    set acctName to ""
    try
      set acctName to name of acct as string
    end try
    try
      repeat with mbox in every mailbox of acct
        set mboxName to ""
        try
          set mboxName to name of mbox as string
        end try
        set unreadCount to "0"
        try
          set unreadCount to (count of (messages of mbox whose read status is false)) as string
        end try
        set output to output & acctName & "${FIELD_SEP}" & mboxName & "${FIELD_SEP}" & unreadCount & "${RECORD_SEP}"
      end repeat
    end try
  end repeat
  return output
end tell`);

  const raw = await runAppleScript(script);
  return parseRecords(raw, ["account", "mailbox", "unreadCount"]);
}
