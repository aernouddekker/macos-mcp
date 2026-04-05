import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";

function colLetterToNum(col: string): number {
  let n = 0;
  for (const ch of col.toUpperCase()) {
    n = n * 26 + (ch.charCodeAt(0) - 64);
  }
  return n;
}

export async function addColumn(
  document: string,
  afterColumn?: string,
  sheet?: string,
  table?: string,
) {
  const docEsc = escapeForAppleScript(document);

  const tableRef = table
    ? `table "${escapeForAppleScript(table)}"`
    : "table 1";
  const sheetRef = sheet
    ? `sheet "${escapeForAppleScript(sheet)}"`
    : "sheet 1";

  let script: string;
  if (afterColumn) {
    const colNum = colLetterToNum(afterColumn);
    script = `
tell application "Numbers"
  tell ${tableRef} of ${sheetRef} of document "${docEsc}"
    add column after column ${colNum}
  end tell
end tell`;
  } else {
    script = `
tell application "Numbers"
  tell ${tableRef} of ${sheetRef} of document "${docEsc}"
    set colCount to column count
    add column after column colCount
  end tell
end tell`;
  }

  await runAppleScript(script);
  return {
    success: true,
    document,
    sheet: sheet ?? "sheet 1",
    table: table ?? "table 1",
    afterColumn: afterColumn ?? "last",
  };
}
