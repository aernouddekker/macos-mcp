import { runCommand } from "../lib/shell.js";

/**
 * Cancel a CUPS print job by id (e.g. "Brother_HL_L2350DW-42") via `cancel`.
 * Returns whatever `cancel` printed (usually nothing on success).
 */
export async function cancelJob(jobId: string): Promise<{ jobId: string; message: string }> {
  const { stdout, stderr } = await runCommand("cancel", [jobId]);
  return { jobId, message: (stdout + stderr).trim() || "cancelled" };
}
