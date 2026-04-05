import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";

const FORMAT_MAP: Record<string, string> = {
  "automatic": "automatic",
  "number": "number",
  "currency": "currency",
  "percentage": "percentage",
  "date": "date and time",
  "date-and-time": "date and time",
  "duration": "duration",
  "checkbox": "checkbox",
  "star-rating": "star rating",
  "text": "text",
  "fraction": "fraction",
  "scientific": "scientific",
  "numeral-system": "numeral system",
};

function parseCellRef(ref: string): { row: number; col: number } {
  const match = ref.match(/^([A-Z]+)(\d+)$/i);
  if (!match) throw new Error(`Invalid cell reference: ${ref}`);
  const letters = match[1].toUpperCase();
  let col = 0;
  for (let i = 0; i < letters.length; i++) {
    col = col * 26 + (letters.charCodeAt(i) - 64);
  }
  return { row: parseInt(match[2], 10), col };
}

export async function setCellFormat(
  document: string,
  cell: string,
  format: string,
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

  const { row, col } = parseCellRef(cell);

  const resolved = FORMAT_MAP[format.toLowerCase()] ?? format;

  const script = `
tell application "Numbers"
  tell ${tableRef} of ${sheetRef} of document "${docEsc}"
    set format of cell ${col} of row ${row} to ${resolved}
  end tell
end tell`;

  await runAppleScript(script);
  return {
    success: true,
    document,
    cell,
    format: resolved,
    sheet: sheet ?? "sheet 1",
    table: table ?? "table 1",
  };
}
