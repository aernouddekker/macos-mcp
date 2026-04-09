import { runAppleScript, escapeForAppleScript, withLaunch } from "../lib/applescript.js";

export async function checkForNewMail(account?: string) {
  let script: string;

  if (account) {
    const acct = escapeForAppleScript(account);
    script = withLaunch("Mail", `
tell application "Mail"
  check for new mail for account "${acct}"
end tell`);
  } else {
    script = withLaunch("Mail", `
tell application "Mail"
  check for new mail
end tell`);
  }

  await runAppleScript(script);

  return {
    status: "checked" as const,
    account: account ?? "all",
  };
}
