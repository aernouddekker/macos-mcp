import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";

export async function setFormula(
  document: string,
  cell: string,
  formula: string,
  sheet?: string,
  table?: string,
) {
  const docEsc = escapeForAppleScript(document);
  const cellEsc = escapeForAppleScript(cell);
  const formulaEsc = escapeForAppleScript(formula);

  const tableRef = table
    ? `table "${escapeForAppleScript(table)}"`
    : "table 1";
  const sheetRef = sheet
    ? `sheet "${escapeForAppleScript(sheet)}"`
    : "sheet 1";

  const script = `
tell application "Numbers"
  tell ${tableRef} of ${sheetRef} of document "${docEsc}"
    set value of cell "${cellEsc}" to "${formulaEsc}"
  end tell
end tell`;

  await runAppleScript(script);
  return { success: true, document, sheet: sheet ?? "sheet 1", table: table ?? "table 1", cell, formula };
}
