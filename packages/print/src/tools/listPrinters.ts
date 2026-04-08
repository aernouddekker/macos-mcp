import { runCommand } from "@mailappmcp/shared";

export interface PrinterInfo {
  name: string;
  isDefault: boolean;
  status: string;
  accepting: boolean;
  location?: string;
  description?: string;
  deviceUri?: string;
}

/**
 * List all CUPS printers known to the system, marking the default one.
 *
 * Uses `lpstat -l -p` (long printer info), `lpstat -d` (default destination)
 * and `lpstat -a` (accepting state). Output of `lpstat -l -p` looks like:
 *
 *   printer Brother_HL_L2350DW is idle.  enabled since ...
 *           Description: Brother HL-L2350DW
 *           Location: Office
 *           Connection: direct
 *           Interface: ...
 */
export async function listPrinters(): Promise<PrinterInfo[]> {
  let defaultName: string | undefined;
  try {
    const { stdout } = await runCommand("lpstat", ["-d"]);
    // "system default destination: <name>" or "no system default destination"
    const m = stdout.match(/system default destination:\s*(\S+)/i);
    if (m) defaultName = m[1];
  } catch {
    // no default — fine
  }

  const accepting = new Map<string, boolean>();
  try {
    const { stdout } = await runCommand("lpstat", ["-a"]);
    for (const line of stdout.split("\n")) {
      // "<name> accepting requests since ..." or "<name> not accepting requests since ..."
      const m = line.match(/^(\S+)\s+(not\s+)?accepting/i);
      if (m) accepting.set(m[1], !m[2]);
    }
  } catch {
    // ignore
  }

  let printersOut = "";
  try {
    const { stdout } = await runCommand("lpstat", ["-l", "-p"]);
    printersOut = stdout;
  } catch {
    return [];
  }

  const printers: PrinterInfo[] = [];
  let current: PrinterInfo | undefined;
  for (const rawLine of printersOut.split("\n")) {
    const line = rawLine.replace(/\s+$/, "");
    if (!line) continue;
    const header = line.match(/^printer\s+(\S+)\s+(.*)$/i);
    if (header) {
      if (current) printers.push(current);
      const name = header[1];
      current = {
        name,
        isDefault: name === defaultName,
        status: header[2].trim(),
        accepting: accepting.get(name) ?? true,
      };
      continue;
    }
    if (!current) continue;
    const desc = line.match(/^\s+Description:\s*(.*)$/i);
    if (desc) {
      current.description = desc[1].trim();
      continue;
    }
    const loc = line.match(/^\s+Location:\s*(.*)$/i);
    if (loc) {
      current.location = loc[1].trim();
      continue;
    }
    const iface = line.match(/^\s+Interface:\s*(.*)$/i);
    if (iface) {
      current.deviceUri = iface[1].trim();
      continue;
    }
  }
  if (current) printers.push(current);

  return printers;
}
