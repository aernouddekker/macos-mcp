#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { placeCall } from "./tools/placeCall.js";

const server = new McpServer({
  name: "facetimemcp",
  version: "0.1.0",
});

server.tool(
  "call-phone",
  "Initiate a cellular phone call to a phone number. Requires a paired iPhone with 'Calls from iPhone' (Continuity) enabled — macOS will route the call through FaceTime to the iPhone. macOS may show a confirmation prompt before dialing.",
  {
    phoneNumber: z
      .string()
      .describe("Phone number in E.164 format, e.g. '+15551234567'. Spaces, dashes, parens are tolerated."),
  },
  async ({ phoneNumber }) => {
    const result = await placeCall(phoneNumber, "phone");
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "call-facetime-audio",
  "Start a FaceTime audio call. Accepts either a phone number or an Apple ID email address.",
  {
    target: z
      .string()
      .describe("Phone number (E.164) or Apple ID email of the person to call"),
  },
  async ({ target }) => {
    const result = await placeCall(target, "audio");
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "call-facetime-video",
  "Start a FaceTime video call. Accepts either a phone number or an Apple ID email address.",
  {
    target: z
      .string()
      .describe("Phone number (E.164) or Apple ID email of the person to call"),
  },
  async ({ target }) => {
    const result = await placeCall(target, "video");
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
