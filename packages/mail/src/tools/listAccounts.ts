import { runAppleScript, parseRecords, withLaunch, FIELD_SEP, RECORD_SEP } from "../lib/applescript.js";

export async function listAccounts() {
  const script = withLaunch("Mail", `
tell application "Mail"
  set output to ""
  repeat with acct in every account
    set acctName to name of acct
    set acctType to account type of acct as string
    set acctEnabled to enabled of acct
    set acctEmails to ""
    repeat with addr in email addresses of acct
      set acctEmails to acctEmails & (contents of addr) & ","
    end repeat
    set acctFullName to full name of acct
    set output to output & acctName & "${FIELD_SEP}" & acctFullName & "${FIELD_SEP}" & acctType & "${FIELD_SEP}" & acctEnabled & "${FIELD_SEP}" & acctEmails & "${RECORD_SEP}"
  end repeat
  return output
end tell`);

  const raw = await runAppleScript(script);
  const records = parseRecords(raw, ["name", "fullName", "accountType", "enabled", "emails"]);

  return records.map((r) => ({
    name: r.name,
    fullName: r.fullName,
    accountType: r.accountType,
    enabled: r.enabled === "true",
    emailAddresses: r.emails
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.length > 0),
  }));
}
