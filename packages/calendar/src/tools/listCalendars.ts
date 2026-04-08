import { runAppleScript, parseRecords, FIELD_SEP, RECORD_SEP } from "@mailappmcp/shared";

// Note: Calendar.app's `calendar` class does not expose a usable id/uid via
// AppleScript (raises -10000). Calendars are identified by name everywhere
// in this server.
export async function listCalendars() {
  const script = `
tell application "Calendar"
  set output to ""
  repeat with c in every calendar
    set cName to ""
    try
      set cName to name of c as string
    end try
    set cWritable to "true"
    try
      set cWritable to (writable of c) as string
    end try
    set cDesc to ""
    try
      set cDesc to description of c as string
      if cDesc is "missing value" then set cDesc to ""
    end try
    set output to output & cName & "${FIELD_SEP}" & cWritable & "${FIELD_SEP}" & cDesc & "${RECORD_SEP}"
  end repeat
  return output
end tell`;

  const raw = await runAppleScript(script);
  const records = parseRecords(raw, ["name", "writable", "description"]);
  return records.map((r) => ({
    name: r.name,
    writable: r.writable === "true",
    description: r.description,
  }));
}
