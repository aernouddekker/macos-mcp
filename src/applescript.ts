import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function runAppleScript(script: string): Promise<string> {
  const { stdout } = await execFileAsync("osascript", ["-e", script], {
    timeout: 30_000,
    maxBuffer: 10 * 1024 * 1024,
  });
  return stdout.trim();
}

export function escapeForAppleScript(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export const FIELD_SEP = "|||";
export const RECORD_SEP = "~~~";

export function parseRecords(raw: string, fields: string[]): Record<string, string>[] {
  if (!raw) return [];
  return raw
    .split(RECORD_SEP)
    .filter((r) => r.trim())
    .map((record) => {
      const values = record.split(FIELD_SEP);
      const obj: Record<string, string> = {};
      fields.forEach((f, i) => {
        obj[f] = (values[i] ?? "").trim();
      });
      return obj;
    });
}
