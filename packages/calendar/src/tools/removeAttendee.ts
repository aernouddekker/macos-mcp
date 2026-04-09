import { runAppleScript, escapeForAppleScript } from "../lib/applescript.js";

export async function removeAttendee(uid: string, email: string) {
  const u = escapeForAppleScript(uid);
  const em = escapeForAppleScript(email);

  const script = `
tell application "Calendar"
  set foundEvent to missing value
  repeat with c in every calendar
    try
      set results to (every event of c whose uid is "${u}")
      if (count of results) > 0 then
        set foundEvent to item 1 of results
        exit repeat
      end if
    end try
  end repeat
  if foundEvent is missing value then
    return "NOT_FOUND"
  end if
  set removed to 0
  try
    set matches to (every attendee of foundEvent whose email is "${em}")
    repeat with a in matches
      delete a
      set removed to removed + 1
    end repeat
  end try
  return removed as string
end tell`;

  const result = await runAppleScript(script);
  if (result.trim() === "NOT_FOUND") return null;
  return { uid, email, removed: parseInt(result.trim(), 10) || 0 };
}
