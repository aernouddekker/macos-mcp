#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { listSpreadsheets } from "./tools/listSpreadsheets.js";
import { listSheets } from "./tools/listSheets.js";
import { readRange } from "./tools/readRange.js";
import { writeCell } from "./tools/writeCell.js";
import { writeRange } from "./tools/writeRange.js";
import { addRow } from "./tools/addRow.js";
import { readTable } from "./tools/readTable.js";
import { getFormula } from "./tools/getFormula.js";
import { setFormula } from "./tools/setFormula.js";

const server = new McpServer({
  name: "numbersmcp",
  version: "0.1.0",
});

server.tool(
  "list-spreadsheets",
  "List all open Numbers documents",
  {},
  async () => {
    const docs = await listSpreadsheets();
    return { content: [{ type: "text", text: JSON.stringify(docs, null, 2) }] };
  },
);

server.tool(
  "list-sheets",
  "List all sheets and tables in an open Numbers document",
  {
    document: z.string().describe("Name of the open Numbers document"),
  },
  async ({ document }) => {
    const sheets = await listSheets(document);
    return { content: [{ type: "text", text: JSON.stringify(sheets, null, 2) }] };
  },
);

server.tool(
  "read-range",
  "Read cell values from a range in a Numbers table (e.g. 'A1:C10')",
  {
    document: z.string().describe("Name of the open Numbers document"),
    range: z.string().describe("Cell range in A1 notation, e.g. 'A1:C10'"),
    sheet: z.string().optional().describe("Sheet name (defaults to first sheet)"),
    table: z.string().optional().describe("Table name (defaults to first table)"),
  },
  async ({ document, range, sheet, table }) => {
    const rows = await readRange(document, range, sheet, table);
    return { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] };
  },
);

server.tool(
  "write-cell",
  "Write a value to a specific cell in a Numbers table",
  {
    document: z.string().describe("Name of the open Numbers document"),
    cell: z.string().describe("Cell reference in A1 notation, e.g. 'B3'"),
    value: z.string().describe("Value to write to the cell"),
    sheet: z.string().optional().describe("Sheet name (defaults to first sheet)"),
    table: z.string().optional().describe("Table name (defaults to first table)"),
  },
  async ({ document, cell, value, sheet, table }) => {
    const result = await writeCell(document, cell, value, sheet, table);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "write-range",
  "Write multiple values to a range starting at a cell in a Numbers table",
  {
    document: z.string().describe("Name of the open Numbers document"),
    startCell: z.string().describe("Top-left cell reference in A1 notation, e.g. 'A1'"),
    values: z.array(z.array(z.string())).describe("2D array of string values to write (rows × columns)"),
    sheet: z.string().optional().describe("Sheet name (defaults to first sheet)"),
    table: z.string().optional().describe("Table name (defaults to first table)"),
  },
  async ({ document, startCell, values, sheet, table }) => {
    const result = await writeRange(document, startCell, values, sheet, table);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "add-row",
  "Add a new row at the bottom of a Numbers table",
  {
    document: z.string().describe("Name of the open Numbers document"),
    values: z.array(z.string()).describe("Array of string values for each cell in the new row"),
    sheet: z.string().optional().describe("Sheet name (defaults to first sheet)"),
    table: z.string().optional().describe("Table name (defaults to first table)"),
  },
  async ({ document, values, sheet, table }) => {
    const result = await addRow(document, values, sheet, table);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "read-table",
  "Read an entire Numbers table as structured data",
  {
    document: z.string().describe("Name of the open Numbers document"),
    sheet: z.string().optional().describe("Sheet name (defaults to first sheet)"),
    table: z.string().optional().describe("Table name (defaults to first table)"),
    headerRow: z.boolean().optional().default(true).describe("If true, first row is used as keys and rows are returned as objects"),
  },
  async ({ document, sheet, table, headerRow }) => {
    const data = await readTable(document, sheet, table, headerRow);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  },
);

server.tool(
  "get-formula",
  "Get the formula from a specific cell in a Numbers table",
  {
    document: z.string().describe("Name of the open Numbers document"),
    cell: z.string().describe("Cell reference in A1 notation, e.g. 'A1'"),
    sheet: z.string().optional().describe("Sheet name (defaults to first sheet)"),
    table: z.string().optional().describe("Table name (defaults to first table)"),
  },
  async ({ document, cell, sheet, table }) => {
    const result = await getFormula(document, cell, sheet, table);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "set-formula",
  "Set a formula on a specific cell in a Numbers table (prefix with '=' e.g. '=SUM(B1:B10)')",
  {
    document: z.string().describe("Name of the open Numbers document"),
    cell: z.string().describe("Cell reference in A1 notation, e.g. 'A1'"),
    formula: z.string().describe("Formula string starting with '=', e.g. '=SUM(B1:B10)'"),
    sheet: z.string().optional().describe("Sheet name (defaults to first sheet)"),
    table: z.string().optional().describe("Table name (defaults to first table)"),
  },
  async ({ document, cell, formula, sheet, table }) => {
    const result = await setFormula(document, cell, formula, sheet, table);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
