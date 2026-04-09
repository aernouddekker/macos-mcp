import { runAppleScript, escapeForAppleScript } from "../lib/applescript.js";
import { appleScriptDateHelper, isoToAppleScriptDate } from "../helpers/dates.js";

export interface CreateReminderOptions {
  body?: string;
  dueDate?: string;
  allDayDueDate?: string;
  remindMeDate?: string;
  priority?: number;
  flagged?: boolean;
}

export async function createReminder(
  listName: string,
  name: string,
  opts: CreateReminderOptions = {},
) {
  const ln = escapeForAppleScript(listName);
  const nm = escapeForAppleScript(name);

  const props: string[] = [`name:"${nm}"`];
  const preLines: string[] = [];

  if (opts.body !== undefined) {
    props.push(`body:"${escapeForAppleScript(opts.body)}"`);
  }
  if (opts.dueDate !== undefined) {
    preLines.push(`set dueD to ${isoToAppleScriptDate(opts.dueDate)}`);
    props.push(`due date:dueD`);
  }
  if (opts.allDayDueDate !== undefined) {
    preLines.push(`set allDayDueD to ${isoToAppleScriptDate(opts.allDayDueDate)}`);
    props.push(`allday due date:allDayDueD`);
  }
  if (opts.remindMeDate !== undefined) {
    preLines.push(`set remindD to ${isoToAppleScriptDate(opts.remindMeDate)}`);
    props.push(`remind me date:remindD`);
  }
  if (opts.priority !== undefined) {
    props.push(`priority:${opts.priority}`);
  }
  if (opts.flagged !== undefined) {
    props.push(`flagged:${opts.flagged}`);
  }

  const script = `
${appleScriptDateHelper()}
tell application "Reminders"
  set results to (every list whose name is "${ln}")
  if (count of results) = 0 then
    return "NOT_FOUND"
  end if
  set l to item 1 of results
  ${preLines.join("\n  ")}
  tell l
    set newReminder to make new reminder with properties {${props.join(", ")}}
  end tell
  return id of newReminder
end tell`;

  const raw = await runAppleScript(script);
  const trimmed = raw.trim();
  if (trimmed === "NOT_FOUND") return null;
  return { id: trimmed, list: listName, name, ...opts };
}
