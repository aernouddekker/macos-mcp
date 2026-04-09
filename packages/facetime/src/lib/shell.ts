import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface RunCommandResult {
  stdout: string;
  stderr: string;
}

/**
 * Run a non-AppleScript shell command via execFile (no shell interpolation).
 * Used by packages that wrap CLI tools like `lp`, `lpstat`, `open`, etc.
 */
export async function runCommand(
  command: string,
  args: string[] = [],
  options: { timeout?: number; maxBuffer?: number } = {},
): Promise<RunCommandResult> {
  const { stdout, stderr } = await execFileAsync(command, args, {
    timeout: options.timeout ?? 30_000,
    maxBuffer: options.maxBuffer ?? 10 * 1024 * 1024,
  });
  return { stdout: stdout.toString(), stderr: stderr.toString() };
}
