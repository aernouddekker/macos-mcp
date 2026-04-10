import { runAppleScript, escapeForAppleScript } from "../lib/applescript.js";

function colLetterToNum(col: string): number {
  let n = 0;
  for (const ch of col.toUpperCase()) {
    n = n * 26 + (ch.charCodeAt(0) - 64);
  }
  return n;
}

export function parseCellRef(ref: string): { row: number; col: number } {
  const match = ref.toUpperCase().match(/^([A-Z]+)(\d+)$/);
  if (!match) throw new Error(`Invalid cell reference: ${ref}`);
  return { col: colLetterToNum(match[1]), row: parseInt(match[2], 10) };
}

export function parseRange(range: string): { startRow: number; startCol: number; endRow: number; endCol: number } {
  const parts = range.split(":");
  if (parts.length !== 2) throw new Error(`Invalid range: ${range}`);
  const start = parseCellRef(parts[0]);
  const end = parseCellRef(parts[1]);
  return { startRow: start.row, startCol: start.col, endRow: end.row, endCol: end.col };
}

export async function readRange(
  document: string,
  range: string,
  sheet?: string,
  table?: string,
) {
  const { startRow, startCol, endRow, endCol } = parseRange(range);
  const docEsc = escapeForAppleScript(document);

  const tableRef = table
    ? `table "${escapeForAppleScript(table)}"`
    : "table 1";
  const sheetRef = sheet
    ? `sheet "${escapeForAppleScript(sheet)}"`
    : "sheet 1";

  const script = `
tell application "Numbers"
  tell ${tableRef} of ${sheetRef} of document "${docEsc}"
    set output to ""
    repeat with r from ${startRow} to ${endRow}
      repeat with c from ${startCol} to ${endCol}
        set cellVal to ""
        try
          set cellVal to value of cell c of row r
          if cellVal is missing value then
            set cellVal to ""
          end if
          set cellVal to cellVal as text
        on error
          set cellVal to ""
        end try
        set output to output & cellVal & "|||"
      end repeat
      set output to output & "~~~"
    end repeat
  end tell
  return output
end tell`;

  const raw = await runAppleScript(script);
  if (!raw) return [];

  const rows = raw
    .split("~~~")
    .filter((r) => r.trim())
    .map((row) =>
      row
        .split("|||")
        .slice(0, endCol - startCol + 1)
        .map((v) => v.trim()),
    );

  return rows;
}
