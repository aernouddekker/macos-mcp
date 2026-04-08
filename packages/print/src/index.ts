#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { listPrinters } from "./tools/listPrinters.js";
import { getPrinterOptions } from "./tools/getPrinterOptions.js";
import { printFile } from "./tools/printFile.js";
import { listJobs } from "./tools/listJobs.js";
import { cancelJob } from "./tools/cancelJob.js";

const server = new McpServer({
  name: "printmcp",
  version: "0.1.0",
});

server.tool(
  "list-printers",
  "List all CUPS printers known to macOS, including the system default and accepting state. Use this first to discover what printers are available on this machine / network.",
  {},
  async () => {
    const printers = await listPrinters();
    return { content: [{ type: "text", text: JSON.stringify(printers, null, 2) }] };
  },
);

server.tool(
  "get-printer-options",
  "Get the supported PPD options for a specific printer (e.g. sides, media size, color mode) along with the current default for each option. Useful before calling print-file with custom options.",
  {
    printer: z.string().describe("Printer name as returned by list-printers"),
  },
  async ({ printer }) => {
    const options = await getPrinterOptions(printer);
    return { content: [{ type: "text", text: JSON.stringify(options, null, 2) }] };
  },
);

server.tool(
  "print-file",
  "Print a local file (PDF, plain text, JPEG/PNG, PostScript) via CUPS. If no printer is given, the system default is used.",
  {
    filePath: z.string().describe("Absolute path to the file to print. ~ is expanded to $HOME."),
    printer: z.string().optional().describe("Printer name (defaults to system default)"),
    copies: z.number().int().positive().optional().describe("Number of copies"),
    duplex: z
      .enum(["one-sided", "long-edge", "short-edge"])
      .optional()
      .describe("Duplex mode. 'long-edge' is the typical book-style two-sided print."),
    media: z
      .string()
      .optional()
      .describe("Paper size, e.g. 'A4', 'Letter', 'Legal' (must match a value supported by the printer — see get-printer-options)"),
    pageRanges: z
      .string()
      .optional()
      .describe("Page ranges to print, CUPS syntax e.g. '1-4,7,9-12'"),
    jobTitle: z.string().optional().describe("Job title shown in the print queue"),
    fitToPage: z.boolean().optional().describe("Scale image/PDF to fit the page"),
    extraOptions: z
      .record(z.string())
      .optional()
      .describe("Additional `-o key=value` options passed straight to lp"),
  },
  async (args) => {
    const result = await printFile(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list-print-jobs",
  "List active CUPS print jobs. Optionally filter to a specific printer.",
  {
    printer: z.string().optional().describe("Printer name to filter by (omit for all printers)"),
  },
  async ({ printer }) => {
    const jobs = await listJobs(printer);
    return { content: [{ type: "text", text: JSON.stringify(jobs, null, 2) }] };
  },
);

server.tool(
  "cancel-print-job",
  "Cancel a CUPS print job by its job id (e.g. 'Brother_HL_L2350DW-42'). Get job ids from list-print-jobs.",
  {
    jobId: z.string().describe("Job id from list-print-jobs"),
  },
  async ({ jobId }) => {
    const result = await cancelJob(jobId);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
