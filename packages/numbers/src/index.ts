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
import { addColumn } from "./tools/addColumn.js";
import { deleteColumn } from "./tools/deleteColumn.js";
import { deleteRow } from "./tools/deleteRow.js";
import { addSheet } from "./tools/addSheet.js";
import { deleteSheet } from "./tools/deleteSheet.js";
import { renameSheet } from "./tools/renameSheet.js";
import { addTable } from "./tools/addTable.js";
import { deleteTable } from "./tools/deleteTable.js";
import { setCellFormat } from "./tools/setCellFormat.js";
import { sortTable } from "./tools/sortTable.js";
import { exportDocument } from "./tools/exportDocument.js";
import { mergeCells } from "./tools/mergeCells.js";
import { unmergeCells } from "./tools/unmergeCells.js";
import { renameTable } from "./tools/renameTable.js";
import { setCellStyle } from "./tools/setCellStyle.js";

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

server.tool(
  "add-column",
  "Add a new column to a Numbers table",
  {
    document: z.string().describe("Name of the open Numbers document"),
    afterColumn: z.string().optional().describe("Column letter after which to insert (e.g. 'C'). Defaults to last column."),
    sheet: z.string().optional().describe("Sheet name (defaults to first sheet)"),
    table: z.string().optional().describe("Table name (defaults to first table)"),
  },
  async ({ document, afterColumn, sheet, table }) => {
    const result = await addColumn(document, afterColumn, sheet, table);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "delete-column",
  "Delete a column from a Numbers table",
  {
    document: z.string().describe("Name of the open Numbers document"),
    column: z.string().describe("Column letter to delete (e.g. 'C')"),
    sheet: z.string().optional().describe("Sheet name (defaults to first sheet)"),
    table: z.string().optional().describe("Table name (defaults to first table)"),
  },
  async ({ document, column, sheet, table }) => {
    const result = await deleteColumn(document, column, sheet, table);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "delete-row",
  "Delete a row from a Numbers table",
  {
    document: z.string().describe("Name of the open Numbers document"),
    row: z.number().int().positive().describe("Row number to delete"),
    sheet: z.string().optional().describe("Sheet name (defaults to first sheet)"),
    table: z.string().optional().describe("Table name (defaults to first table)"),
  },
  async ({ document, row, sheet, table }) => {
    const result = await deleteRow(document, row, sheet, table);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "add-sheet",
  "Add a new sheet to a Numbers document",
  {
    document: z.string().describe("Name of the open Numbers document"),
    name: z.string().optional().describe("Name for the new sheet"),
  },
  async ({ document, name }) => {
    const result = await addSheet(document, name);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "delete-sheet",
  "Delete a sheet from a Numbers document",
  {
    document: z.string().describe("Name of the open Numbers document"),
    sheet: z.string().describe("Name of the sheet to delete"),
  },
  async ({ document, sheet }) => {
    const result = await deleteSheet(document, sheet);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "rename-sheet",
  "Rename a sheet in a Numbers document",
  {
    document: z.string().describe("Name of the open Numbers document"),
    sheet: z.string().describe("Current name of the sheet"),
    newName: z.string().describe("New name for the sheet"),
  },
  async ({ document, sheet, newName }) => {
    const result = await renameSheet(document, sheet, newName);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "add-table",
  "Add a new table to a sheet in a Numbers document",
  {
    document: z.string().describe("Name of the open Numbers document"),
    sheet: z.string().optional().describe("Sheet name (defaults to first sheet)"),
    name: z.string().optional().describe("Name for the new table"),
  },
  async ({ document, sheet, name }) => {
    const result = await addTable(document, sheet, name);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "delete-table",
  "Delete a table from a sheet in a Numbers document",
  {
    document: z.string().describe("Name of the open Numbers document"),
    table: z.string().describe("Name of the table to delete"),
    sheet: z.string().optional().describe("Sheet name (defaults to first sheet)"),
  },
  async ({ document, table, sheet }) => {
    const result = await deleteTable(document, table, sheet);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "set-cell-format",
  "Set the format of a cell (number, currency, percentage, date, text, etc.)",
  {
    document: z.string().describe("Name of the open Numbers document"),
    cell: z.string().describe("Cell reference in A1 notation, e.g. 'B3'"),
    format: z.enum(["automatic", "number", "currency", "percentage", "date", "date-and-time", "duration", "checkbox", "star-rating", "text", "fraction", "scientific", "numeral-system"]).describe("Cell format type"),
    sheet: z.string().optional().describe("Sheet name (defaults to first sheet)"),
    table: z.string().optional().describe("Table name (defaults to first table)"),
  },
  async ({ document, cell, format, sheet, table }) => {
    const result = await setCellFormat(document, cell, format, sheet, table);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "sort-table",
  "Sort a Numbers table by a column",
  {
    document: z.string().describe("Name of the open Numbers document"),
    column: z.string().describe("Column letter to sort by, e.g. 'B'"),
    direction: z.enum(["ascending", "descending"]).describe("Sort direction"),
    sheet: z.string().optional().describe("Sheet name (defaults to first sheet)"),
    table: z.string().optional().describe("Table name (defaults to first table)"),
  },
  async ({ document, column, direction, sheet, table }) => {
    const result = await sortTable(document, column, direction, sheet, table);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "export-document",
  "Export a Numbers document to PDF, Excel, or CSV format",
  {
    document: z.string().describe("Name of the open Numbers document"),
    path: z.string().describe("Full output file path, e.g. '/Users/me/output.xlsx'"),
    format: z.enum(["pdf", "excel", "csv"]).describe("Export format"),
  },
  async ({ document, path, format }) => {
    const result = await exportDocument(document, path, format);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "merge-cells",
  "Merge a range of cells in a Numbers table",
  {
    document: z.string().describe("Name of the open Numbers document"),
    range: z.string().describe("Cell range to merge, e.g. 'A1:C1'"),
    sheet: z.string().optional().describe("Sheet name (defaults to first sheet)"),
    table: z.string().optional().describe("Table name (defaults to first table)"),
  },
  async ({ document, range, sheet, table }) => {
    const result = await mergeCells(document, range, sheet, table);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "unmerge-cells",
  "Unmerge a range of cells in a Numbers table",
  {
    document: z.string().describe("Name of the open Numbers document"),
    range: z.string().describe("Cell range to unmerge, e.g. 'A1:C1'"),
    sheet: z.string().optional().describe("Sheet name (defaults to first sheet)"),
    table: z.string().optional().describe("Table name (defaults to first table)"),
  },
  async ({ document, range, sheet, table }) => {
    const result = await unmergeCells(document, range, sheet, table);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "rename-table",
  "Rename a table in a Numbers document",
  {
    document: z.string().describe("Name of the open Numbers document"),
    table: z.string().describe("Current name of the table"),
    newName: z.string().describe("New name for the table"),
    sheet: z.string().optional().describe("Sheet name (defaults to first sheet)"),
  },
  async ({ document, table, newName, sheet }) => {
    const result = await renameTable(document, table, newName, sheet);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "set-cell-style",
  "Set visual styling properties on a cell (font, color, bold, italic, alignment, background)",
  {
    document: z.string().describe("Name of the open Numbers document"),
    cell: z.string().describe("Cell reference in A1 notation, e.g. 'B3'"),
    sheet: z.string().optional().describe("Sheet name (defaults to first sheet)"),
    table: z.string().optional().describe("Table name (defaults to first table)"),
    fontName: z.string().optional().describe("Font name, e.g. 'Helvetica'"),
    fontSize: z.number().optional().describe("Font size in points"),
    textColor: z.string().optional().describe("Text color as RGB hex, e.g. '#FF0000'"),
    backgroundColor: z.string().optional().describe("Background color as RGB hex, e.g. '#0000FF'"),
    bold: z.boolean().optional().describe("Set bold"),
    italic: z.boolean().optional().describe("Set italic"),
    alignment: z.enum(["left", "center", "right", "justify", "auto"]).optional().describe("Horizontal text alignment"),
  },
  async ({ document, cell, sheet, table, fontName, fontSize, textColor, backgroundColor, bold, italic, alignment }) => {
    const result = await setCellStyle(document, cell, sheet, table, fontName, fontSize, textColor, backgroundColor, bold, italic, alignment);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
