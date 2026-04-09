import { runAppleScript, escapeForAppleScript, withLaunch } from "../lib/applescript.js";

export async function updateCalendar(name: string, newName?: string, description?: string) {
  const n = escapeForAppleScript(name);
  const nameBlock = newName !== undefined
    ? `set name of c to "${escapeForAppleScript(newName)}"`
    : "";
  const descBlock = description !== undefined
    ? `set description of c to "${escapeForAppleScript(description)}"`
    : "";
  const script = withLaunch("Calendar", `
tell application "Calendar"
  set results to (every calendar whose name is "${n}")
  if (count of results) = 0 then
    return "NOT_FOUND"
  end if
  set c to item 1 of results
  ${nameBlock}
  ${descBlock}
  return "ok"
end tell`);

  const result = await runAppleScript(script);
  if (result.trim() === "NOT_FOUND") return null;
  return { name, updated: { newName, description } };
}
