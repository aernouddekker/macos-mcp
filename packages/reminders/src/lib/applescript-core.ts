// DRIFT-SENSITIVE: this file must be byte-identical across all packages.
// CI check: scripts/check-shared-drift.sh (wired in commit (e)).
// Do not add package-local code here.
// Package-local helpers belong in ./applescript.ts (which re-exports from core).
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

export async function runJXA(script: string): Promise<string> {
  const { stdout } = await execFileAsync("osascript", ["-l", "JavaScript", "-e", script], {
    timeout: 30_000,
    maxBuffer: 10 * 1024 * 1024,
  });
  return stdout.trim();
}

/**
 * Convert a string into a JavaScript string literal safe for embedding into a
 * JXA script. Uses JSON.stringify which produces a valid JS string literal.
 */
export function jsLiteral(value: unknown): string {
  return JSON.stringify(value ?? null);
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
