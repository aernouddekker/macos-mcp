import { runAppleScript, escapeForAppleScript, parseRecords, FIELD_SEP, RECORD_SEP } from "@mailappmcp/shared";

// Substring match against reminder name. Optionally scoped to a single list
// (recommended — `whose` filters are O(n) on Reminders.app stores too).
export async function searchReminders(
  query: string,
  listName?: string,
  includeCompleted: boolean = false,
  limit: number = 25,
) {
  const q = escapeForAppleScript(query);
  const filterCompleted = includeCompleted ? "" : " and completed is false";

  const targetBlock = listName
    ? `set found to (every list whose name is "${escapeForAppleScript(listName)}")
  if (count of found) = 0 then
    return "NOT_FOUND"
  end if
  set targetLists to found`
    : `set targetLists to every list`;

  const script = `
tell application "Reminders"
  ${targetBlock}
  set output to ""
  set total to 0
  set maxCount to ${limit}
  repeat with l in targetLists
    if total >= maxCount then exit repeat
    set lName to ""
    try
      set lName to name of l as string
    end try
    try
      set matched to (every reminder of l whose name contains "${q}"${filterCompleted})
      repeat with r in matched
        if total >= maxCount then exit repeat
        set rId to ""
        try
          set rId to id of r as string
        end try
        set rName to ""
        try
          set rName to name of r as string
          if rName is "missing value" then set rName to ""
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
        set output to output & rId & "${FIELD_SEP}" & rName & "${FIELD_SEP}" & lName & "${FIELD_SEP}" & rCompleted & "${FIELD_SEP}" & rDue & "${RECORD_SEP}"
        set total to total + 1
      end repeat
    end try
  end repeat
  return output
end tell`;

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") return null;
  const records = parseRecords(raw, ["id", "name", "list", "completed", "dueDate"]);
  return records.map((r) => ({ ...r, completed: r.completed === "true" }));
}
