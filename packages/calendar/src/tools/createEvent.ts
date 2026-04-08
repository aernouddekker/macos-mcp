import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";
import { appleScriptDateHelper, isoToAppleScriptDate } from "../helpers/dates.js";

export async function createEvent(
  calendarName: string,
  summary: string,
  startDate: string,
  endDate: string,
  allDay?: boolean,
  location?: string,
  description?: string,
  url?: string,
) {
  const cName = escapeForAppleScript(calendarName);
  const sum = escapeForAppleScript(summary);
  const startExpr = isoToAppleScriptDate(startDate);
  const endExpr = isoToAppleScriptDate(endDate);

  const props: string[] = [
    `summary:"${sum}"`,
    `start date:startD`,
    `end date:endD`,
  ];
  if (allDay !== undefined) props.push(`allday event:${allDay}`);
  if (location !== undefined) props.push(`location:"${escapeForAppleScript(location)}"`);
  if (description !== undefined) props.push(`description:"${escapeForAppleScript(description)}"`);
  if (url !== undefined) props.push(`url:"${escapeForAppleScript(url)}"`);

  const script = `
${appleScriptDateHelper()}
tell application "Calendar"
  set results to (every calendar whose name is "${cName}")
  if (count of results) = 0 then
    return "NOT_FOUND"
  end if
  set c to item 1 of results
  set startD to ${startExpr}
  set endD to ${endExpr}
  tell c
    set newEvent to make new event with properties {${props.join(", ")}}
  end tell
  return uid of newEvent
end tell`;

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") return null;
  return { uid: raw.trim(), calendar: calendarName, summary, startDate, endDate, allDay, location, description, url };
}
