import { promises as fs } from "node:fs";
import path from "node:path";
import { runCommand } from "../lib/shell.js";

export interface PrintFileOptions {
  filePath: string;
  printer?: string;
  copies?: number;
  duplex?: "one-sided" | "long-edge" | "short-edge";
  media?: string;
  pageRanges?: string;
  jobTitle?: string;
  fitToPage?: boolean;
  extraOptions?: Record<string, string>;
}

export interface PrintFileResult {
  jobId: string;
  printer: string;
  message: string;
}

/**
 * Submit a file to a CUPS printer via `lp`. CUPS handles common formats
 * (PDF, plain text, JPEG/PNG, PostScript) directly via its filter chain.
 *
 * Returns the job id parsed from `lp`'s "request id is <printer>-<id> (1 file(s))" output.
 */
export async function printFile(opts: PrintFileOptions): Promise<PrintFileResult> {
  const abs = path.resolve(opts.filePath.replace(/^~/, process.env.HOME ?? ""));
  // Validate the file actually exists so we get a clean error rather than
  // CUPS' less-friendly stderr.
  await fs.access(abs);

  const args: string[] = [];
  if (opts.printer) args.push("-d", opts.printer);
  if (opts.copies && opts.copies > 1) args.push("-n", String(opts.copies));
  if (opts.jobTitle) args.push("-t", opts.jobTitle);
  if (opts.pageRanges) args.push("-P", opts.pageRanges);

  if (opts.duplex) {
    const sides =
      opts.duplex === "long-edge"
        ? "two-sided-long-edge"
        : opts.duplex === "short-edge"
        ? "two-sided-short-edge"
        : "one-sided";
    args.push("-o", `sides=${sides}`);
  }
  if (opts.media) args.push("-o", `media=${opts.media}`);
  if (opts.fitToPage) args.push("-o", "fit-to-page");
  if (opts.extraOptions) {
    for (const [k, v] of Object.entries(opts.extraOptions)) {
      args.push("-o", `${k}=${v}`);
    }
  }

  args.push("--", abs);

  const { stdout, stderr } = await runCommand("lp", args);
  const out = (stdout + "\n" + stderr).trim();
  // "request id is Brother_HL_L2350DW-42 (1 file(s))"
  const m = out.match(/request id is\s+(\S+)/i);
  if (!m) {
    throw new Error(`lp did not return a job id. Output: ${out || "(empty)"}`);
  }
  const jobId = m[1];
  const dashIdx = jobId.lastIndexOf("-");
  const printer = dashIdx > 0 ? jobId.slice(0, dashIdx) : opts.printer ?? "";
  return { jobId, printer, message: out };
}
