import { runAppleScript, escapeForAppleScript, FIELD_SEP } from "@mailappmcp/shared";

export async function getList(name: string) {
  const n = escapeForAppleScript(name);
  const script = `
tell application "Reminders"
  set results to (every list whose name is "${n}")
  if (count of results) = 0 then
    return "NOT_FOUND"
  end if
  set l to item 1 of results
  set lId to ""
  try
    set lId to id of l as string
  end try
  set lContainer to ""
  try
    set lContainer to name of (container of l) as string
  end try
  set lColor to ""
  try
    set lColor to color of l as string
    if lColor is "missing value" then set lColor to ""
  end try
  set lEmblem to ""
  try
    set lEmblem to emblem of l as string
    if lEmblem is "missing value" then set lEmblem to ""
  end try
  set openCount to "0"
  try
    set openCount to (count of (every reminder of l whose completed is false)) as string
  end try
  set doneCount to "0"
  try
    set doneCount to (count of (every reminder of l whose completed is true)) as string
  end try
  return lId & "${FIELD_SEP}" & lContainer & "${FIELD_SEP}" & lColor & "${FIELD_SEP}" & lEmblem & "${FIELD_SEP}" & openCount & "${FIELD_SEP}" & doneCount
end tell`;

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") return null;
  const parts = raw.split(FIELD_SEP);
  return {
    name,
    id: (parts[0] ?? "").trim(),
    account: (parts[1] ?? "").trim(),
    color: (parts[2] ?? "").trim(),
    emblem: (parts[3] ?? "").trim(),
    openCount: parseInt((parts[4] ?? "0").trim(), 10) || 0,
    completedCount: parseInt((parts[5] ?? "0").trim(), 10) || 0,
  };
}
