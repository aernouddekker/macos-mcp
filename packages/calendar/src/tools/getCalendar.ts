import { runAppleScript, escapeForAppleScript, FIELD_SEP } from "../lib/applescript.js";

export async function getCalendar(name: string) {
  const n = escapeForAppleScript(name);
  const script = `
tell application "Calendar"
  set results to (every calendar whose name is "${n}")
  if (count of results) = 0 then
    return "NOT_FOUND"
  end if
  set c to item 1 of results
  set cName to name of c as string
  set cWritable to "true"
  try
    set cWritable to (writable of c) as string
  end try
  set cDesc to ""
  try
    set cDesc to description of c as string
    if cDesc is "missing value" then set cDesc to ""
  end try
  set cCount to 0
  try
    set cCount to count of events of c
  end try
  return cName & "${FIELD_SEP}" & cWritable & "${FIELD_SEP}" & cDesc & "${FIELD_SEP}" & cCount
end tell`;

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") return null;
  const parts = raw.split(FIELD_SEP);
  return {
    name: (parts[0] ?? "").trim(),
    writable: (parts[1] ?? "").trim() === "true",
    description: (parts[2] ?? "").trim(),
    eventCount: parseInt((parts[3] ?? "0").trim(), 10) || 0,
  };
}
