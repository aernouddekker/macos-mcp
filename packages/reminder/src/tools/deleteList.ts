import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";

// Reminders.app supports `delete list` via AppleScript on modern macOS
// (unlike Calendar.app, where the equivalent verb raises -10000). If a future
// macOS version regresses this, we surface the AppleScript error verbatim.
export async function deleteList(name: string) {
  const n = escapeForAppleScript(name);
  const script = `
tell application "Reminders"
  set results to (every list whose name is "${n}")
  if (count of results) = 0 then
    return "NOT_FOUND"
  end if
  delete (item 1 of results)
  return "ok"
end tell`;

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") return null;
  return { name, deleted: true };
}
