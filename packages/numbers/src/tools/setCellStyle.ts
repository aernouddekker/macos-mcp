import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";
import { parseCellRef } from "./readRange.js";

function hexToAppleScriptRgb(hex: string): string {
  const h = hex.replace(/^#/, "");
  const r = Math.round((parseInt(h.slice(0, 2), 16) / 255) * 65535);
  const g = Math.round((parseInt(h.slice(2, 4), 16) / 255) * 65535);
  const b = Math.round((parseInt(h.slice(4, 6), 16) / 255) * 65535);
  return `{${r}, ${g}, ${b}}`;
}

const ALIGNMENT_MAP: Record<string, string> = {
  left: "left",
  center: "center",
  right: "right",
  justify: "justify",
  auto: "auto",
};

export async function setCellStyle(
  document: string,
  cell: string,
  sheet?: string,
  table?: string,
  fontName?: string,
  fontSize?: number,
  textColor?: string,
  backgroundColor?: string,
  bold?: boolean,
  italic?: boolean,
  alignment?: "left" | "center" | "right" | "justify" | "auto",
) {
  const docEsc = escapeForAppleScript(document);
  const tableRef = table ? `table "${escapeForAppleScript(table)}"` : "table 1";
  const sheetRef = sheet ? `sheet "${escapeForAppleScript(sheet)}"` : "sheet 1";
  const { row, col } = parseCellRef(cell);

  const styleLines: string[] = [];
  const appliedStyles: string[] = [];

  if (fontName !== undefined) {
    styleLines.push(`set font name of theCell to "${escapeForAppleScript(fontName)}"`);
    appliedStyles.push("fontName");
  }
  if (fontSize !== undefined) {
    styleLines.push(`set font size of theCell to ${fontSize}`);
    appliedStyles.push("fontSize");
  }
  if (textColor !== undefined) {
    styleLines.push(`set text color of theCell to ${hexToAppleScriptRgb(textColor)}`);
    appliedStyles.push("textColor");
  }
  if (backgroundColor !== undefined) {
    styleLines.push(`set background color of theCell to ${hexToAppleScriptRgb(backgroundColor)}`);
    appliedStyles.push("backgroundColor");
  }
  if (bold !== undefined) {
    styleLines.push(`set bold of theCell to ${bold}`);
    appliedStyles.push("bold");
  }
  if (italic !== undefined) {
    styleLines.push(`set italic of theCell to ${italic}`);
    appliedStyles.push("italic");
  }
  if (alignment !== undefined) {
    styleLines.push(`set alignment of theCell to ${ALIGNMENT_MAP[alignment]}`);
    appliedStyles.push("alignment");
  }

  if (styleLines.length === 0) {
    return { success: true, cell, appliedStyles: [] };
  }

  const script = `
tell application "Numbers"
  tell ${tableRef} of ${sheetRef} of document "${docEsc}"
    set theCell to cell ${col} of row ${row}
    ${styleLines.join("\n    ")}
  end tell
end tell`;

  await runAppleScript(script);
  return { success: true, cell, appliedStyles };
}
