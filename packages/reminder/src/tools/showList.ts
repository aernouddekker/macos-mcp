import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";

export async function showList(name: string) {
  const n = escapeForAppleScript(name);
  const script = `
tell application "Reminders"
  set results to (every list whose name is "${n}")
  if (count of results) = 0 then
    return "NOT_FOUND"
  end if
  show (item 1 of results)
  activate
  return "ok"
end tell`;

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") return null;
  return { name, shown: true };
}
