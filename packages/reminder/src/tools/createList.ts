import { runAppleScript, escapeForAppleScript } from "../lib/applescript.js";

export async function createList(name: string, accountName?: string) {
  const n = escapeForAppleScript(name);

  // Reminders.app: a new list is made at the application level and inherits
  // the default account, OR you can `tell` a specific account to scope it.
  const script = accountName
    ? `
tell application "Reminders"
  set acctResults to (every account whose name is "${escapeForAppleScript(accountName)}")
  if (count of acctResults) = 0 then
    return "NOT_FOUND"
  end if
  tell (item 1 of acctResults)
    set newList to make new list with properties {name:"${n}"}
  end tell
  return id of newList
end tell`
    : `
tell application "Reminders"
  set newList to make new list with properties {name:"${n}"}
  return id of newList
end tell`;

  const raw = await runAppleScript(script);
  const trimmed = raw.trim();
  if (trimmed === "NOT_FOUND") return null;
  return { id: trimmed, name, account: accountName, created: true };
}
