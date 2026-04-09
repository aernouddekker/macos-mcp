import { runAppleScript, escapeForAppleScript, parseRecords, FIELD_SEP, RECORD_SEP } from "@mailappmcp/shared";

export async function listReminders(
  listName: string,
  includeCompleted: boolean = false,
  limit: number = 100,
) {
  const n = escapeForAppleScript(listName);
  const filter = includeCompleted
    ? "every reminder of l"
    : "every reminder of l whose completed is false";

  const script = `
tell application "Reminders"
  set results to (every list whose name is "${n}")
  if (count of results) = 0 then
    return "NOT_FOUND"
  end if
  set l to item 1 of results
  set matched to (${filter})
  set output to ""
  set maxCount to ${limit}
  set i to 0
  repeat with r in matched
    if i >= maxCount then exit repeat
    set rId to ""
    try
      set rId to id of r as string
    end try
    set rName to ""
    try
      set rName to name of r as string
      if rName is "missing value" then set rName to ""
    end try
    set rBody to ""
    try
      set rBody to body of r as string
      if rBody is "missing value" then set rBody to ""
    end try
    set rCompleted to "false"
    try
      set rCompleted to (completed of r) as string
    end try
    set rDue to ""
    try
      set rDue to (due date of r) as string
      if rDue is "missing value" then set rDue to ""
    end try
    set rAllDayDue to ""
    try
      set rAllDayDue to (allday due date of r) as string
      if rAllDayDue is "missing value" then set rAllDayDue to ""
    end try
    set rRemind to ""
    try
      set rRemind to (remind me date of r) as string
      if rRemind is "missing value" then set rRemind to ""
    end try
    set rPriority to "0"
    try
      set rPriority to (priority of r) as string
    end try
    set rFlagged to "false"
    try
      set rFlagged to (flagged of r) as string
    end try
    set output to output & rId & "${FIELD_SEP}" & rName & "${FIELD_SEP}" & rBody & "${FIELD_SEP}" & rCompleted & "${FIELD_SEP}" & rDue & "${FIELD_SEP}" & rAllDayDue & "${FIELD_SEP}" & rRemind & "${FIELD_SEP}" & rPriority & "${FIELD_SEP}" & rFlagged & "${RECORD_SEP}"
    set i to i + 1
  end repeat
  return output
end tell`;

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") return null;
  const records = parseRecords(raw, [
    "id",
    "name",
    "body",
    "completed",
    "dueDate",
    "allDayDueDate",
    "remindMeDate",
    "priority",
    "flagged",
  ]);
  return records.map((r) => ({
    ...r,
    completed: r.completed === "true",
    flagged: r.flagged === "true",
    priority: parseInt(r.priority || "0", 10) || 0,
  }));
}
