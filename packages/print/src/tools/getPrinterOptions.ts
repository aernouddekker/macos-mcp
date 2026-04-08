import { runCommand } from "@mailappmcp/shared";

export interface PrinterOption {
  key: string;
  defaultValue: string;
  values: string[];
}

/**
 * Return the supported PPD options for a printer (sides, media, ColorModel, etc.)
 * via `lpoptions -p <printer> -l`. Each line looks like:
 *
 *   sides/2-Sided Printing: one-sided *two-sided-long-edge two-sided-short-edge
 *
 * The starred token is the current default value.
 */
export async function getPrinterOptions(printer: string): Promise<PrinterOption[]> {
  const { stdout } = await runCommand("lpoptions", ["-p", printer, "-l"]);
  const options: PrinterOption[] = [];
  for (const rawLine of stdout.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    // "key/Pretty Label: val1 *val2 val3"
    const m = line.match(/^([^/:]+)(?:\/[^:]+)?:\s*(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    const tokens = m[2].split(/\s+/).filter(Boolean);
    let defaultValue = "";
    const values: string[] = [];
    for (const t of tokens) {
      if (t.startsWith("*")) {
        const v = t.slice(1);
        defaultValue = v;
        values.push(v);
      } else {
        values.push(t);
      }
    }
    options.push({ key, defaultValue, values });
  }
  return options;
}
