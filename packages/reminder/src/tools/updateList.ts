import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";

export async function updateList(name: string, newName: string) {
  const n = escapeForAppleScript(name);
  const nn = escapeForAppleScript(newName);
  const script = `
tell application "Reminders"
  set results to (every list whose name is "${n}")
  if (count of results) = 0 then
    return "NOT_FOUND"
  end if
  set l to item 1 of results
  set name of l to "${nn}"
  return "ok"
end tell`;

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") return null;
  return { name: newName, previousName: name, updated: true };
}
