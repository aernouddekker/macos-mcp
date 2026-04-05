import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";

function colLetterToNum(col: string): number {
  let n = 0;
  for (const ch of col.toUpperCase()) {
    n = n * 26 + (ch.charCodeAt(0) - 64);
  }
  return n;
}

export async function resizeRowColumn(
  document: string,
  sheet?: string,
  table?: string,
  row?: number,
  column?: string,
  height?: number,
  width?: number,
) {
  const docEsc = escapeForAppleScript(document);
  const tableRef = table ? `table "${escapeForAppleScript(table)}"` : "table 1";
  const sheetRef = sheet ? `sheet "${escapeForAppleScript(sheet)}"` : "sheet 1";

  const changes: Array<{ type: string; index: number | string; size: number }> = [];
  const lines: string[] = [];

  if (row !== undefined && height !== undefined) {
    lines.push(`    set height of row ${row} to ${height}`);
    changes.push({ type: "row", index: row, size: height });
  }

  if (column !== undefined && width !== undefined) {
    const colNum = colLetterToNum(column);
    lines.push(`    set width of column ${colNum} to ${width}`);
    changes.push({ type: "column", index: column, size: width });
  }

  const script = `
tell application "Numbers"
  tell ${tableRef} of ${sheetRef} of document "${docEsc}"
${lines.join("\n")}
  end tell
end tell`;

  await runAppleScript(script);
  return { success: true, changes };
}
