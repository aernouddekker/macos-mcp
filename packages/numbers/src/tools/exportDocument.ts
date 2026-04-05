import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";

const FORMAT_MAP: Record<string, string> = {
  pdf: "PDF",
  excel: "Microsoft Excel",
  csv: "CSV",
};

export async function exportDocument(
  document: string,
  path: string,
  format: "pdf" | "excel" | "csv",
) {
  const docEsc = escapeForAppleScript(document);
  const pathEsc = escapeForAppleScript(path);
  const asFormat = FORMAT_MAP[format];

  const script = `
tell application "Numbers"
  export document "${docEsc}" to POSIX file "${pathEsc}" as ${asFormat}
end tell`;

  await runAppleScript(script);
  return { success: true, document, path, format };
}
