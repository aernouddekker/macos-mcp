import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";

export async function getFormula(
  document: string,
  cell: string,
  sheet?: string,
  table?: string,
) {
  const docEsc = escapeForAppleScript(document);
  const cellEsc = escapeForAppleScript(cell);

  const tableRef = table
    ? `table "${escapeForAppleScript(table)}"`
    : "table 1";
  const sheetRef = sheet
    ? `sheet "${escapeForAppleScript(sheet)}"`
    : "sheet 1";

  const script = `
tell application "Numbers"
  tell ${tableRef} of ${sheetRef} of document "${docEsc}"
    set theCell to cell "${cellEsc}"
    set theFormula to ""
    try
      set theFormula to formula of theCell
      if theFormula is missing value then set theFormula to ""
    end try
    return theFormula
  end tell
end tell`;

  const raw = await runAppleScript(script);
  return { document, sheet: sheet ?? "sheet 1", table: table ?? "table 1", cell, formula: raw };
}
