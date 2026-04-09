import { runAppleScript, escapeForAppleScript } from "../lib/applescript.js";

export async function checkForNewMail(account?: string) {
  let script: string;

  if (account) {
    const acct = escapeForAppleScript(account);
    script = `
tell application "Mail"
  check for new mail for account "${acct}"
end tell`;
  } else {
    script = `
tell application "Mail"
  check for new mail
end tell`;
  }

  await runAppleScript(script);

  return {
    status: "checked" as const,
    account: account ?? "all",
  };
}
