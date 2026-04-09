import { runAppleScript, escapeForAppleScript, FIELD_SEP } from "../lib/applescript.js";

export async function getReminder(id: string) {
  const i = escapeForAppleScript(id);
  const script = `
tell application "Reminders"
  set foundReminder to missing value
  set foundList to ""
  repeat with l in every list
    try
      set results to (every reminder of l whose id is "${i}")
      if (count of results) > 0 then
        set foundReminder to item 1 of results
        set foundList to name of l as string
        exit repeat
      end if
    end try
  end repeat
  if foundReminder is missing value then
    return "NOT_FOUND"
  end if
  set r to foundReminder
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
  set rCompletionDate to ""
  try
    set rCompletionDate to (completion date of r) as string
    if rCompletionDate is "missing value" then set rCompletionDate to ""
  end try
  set rCreation to ""
  try
    set rCreation to (creation date of r) as string
  end try
  set rModification to ""
  try
    set rModification to (modification date of r) as string
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
  return "${i}" & "${FIELD_SEP}" & foundList & "${FIELD_SEP}" & rName & "${FIELD_SEP}" & rBody & "${FIELD_SEP}" & rCompleted & "${FIELD_SEP}" & rCompletionDate & "${FIELD_SEP}" & rCreation & "${FIELD_SEP}" & rModification & "${FIELD_SEP}" & rDue & "${FIELD_SEP}" & rAllDayDue & "${FIELD_SEP}" & rRemind & "${FIELD_SEP}" & rPriority & "${FIELD_SEP}" & rFlagged
end tell`;

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") return null;
  const parts = raw.split(FIELD_SEP);
  return {
    id: (parts[0] ?? "").trim(),
    list: (parts[1] ?? "").trim(),
    name: (parts[2] ?? "").trim(),
    body: (parts[3] ?? "").trim(),
    completed: (parts[4] ?? "").trim() === "true",
    completionDate: (parts[5] ?? "").trim(),
    creationDate: (parts[6] ?? "").trim(),
    modificationDate: (parts[7] ?? "").trim(),
    dueDate: (parts[8] ?? "").trim(),
    allDayDueDate: (parts[9] ?? "").trim(),
    remindMeDate: (parts[10] ?? "").trim(),
    priority: parseInt((parts[11] ?? "0").trim(), 10) || 0,
    flagged: (parts[12] ?? "").trim() === "true",
  };
}
