import { runCommand } from "@mailappmcp/shared";

export interface PrintJob {
  jobId: string;
  user: string;
  size: string;
  submittedAt: string;
}

/**
 * List active CUPS print jobs via `lpstat -o`. If `printer` is provided
 * the listing is filtered to that destination. Output lines look like:
 *
 *   Brother_HL_L2350DW-42  aernoud      40960   Tue Apr  7 10:15:22 2026
 */
export async function listJobs(printer?: string): Promise<PrintJob[]> {
  const args = ["-o"];
  if (printer) args.push(printer);
  const { stdout } = await runCommand("lpstat", args);
  const jobs: PrintJob[] = [];
  for (const rawLine of stdout.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    // jobId user size date...
    const m = line.match(/^(\S+)\s+(\S+)\s+(\d+)\s+(.*)$/);
    if (!m) continue;
    jobs.push({ jobId: m[1], user: m[2], size: m[3], submittedAt: m[4].trim() });
  }
  return jobs;
}
