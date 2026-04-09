import { runAppleScript, withLaunch } from "../lib/applescript.js";
import { appleScriptDateHelper, isoToAppleScriptDate } from "../helpers/dates.js";

export type ViewType = "day" | "week" | "month";

export async function switchView(view: ViewType, date?: string) {
  const dateLine = date
    ? `view calendar at ${isoToAppleScriptDate(date)}`
    : "";
  const script = withLaunch("Calendar", `
${appleScriptDateHelper()}
tell application "Calendar"
  ${dateLine}
  switch view to ${view} view
  return "ok"
end tell`);

  await runAppleScript(script);
  return { view, date: date ?? null };
}
