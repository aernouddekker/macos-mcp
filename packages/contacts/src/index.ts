#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { searchContacts } from "./tools/searchContacts.js";
import { readContact } from "./tools/readContact.js";
import { createContact } from "./tools/createContact.js";
import { updateContact } from "./tools/updateContact.js";
import { listGroups } from "./tools/listGroups.js";
import { addToGroup } from "./tools/addToGroup.js";

const server = new McpServer({
  name: "contactsmcp",
  version: "0.1.0",
});

server.tool(
  "search-contacts",
  "Search contacts in macOS Contacts.app by name, email, or phone number",
  {
    query: z.string().describe("Search query — matches against name, email, and phone"),
    limit: z.number().optional().default(25).describe("Max results to return"),
  },
  async ({ query, limit }) => {
    const contacts = await searchContacts(query, limit);
    return { content: [{ type: "text", text: JSON.stringify(contacts, null, 2) }] };
  },
);

server.tool(
  "read-contact",
  "Get full details of a contact by their Contacts.app ID",
  {
    contactId: z.string().describe("Contact ID from Contacts.app (from search results)"),
  },
  async ({ contactId }) => {
    const contact = await readContact(contactId);
    if (!contact) {
      return { content: [{ type: "text", text: "Contact not found." }] };
    }
    return { content: [{ type: "text", text: JSON.stringify(contact, null, 2) }] };
  },
);

server.tool(
  "create-contact",
  "Create a new contact in macOS Contacts.app",
  {
    firstName: z.string().describe("First name"),
    lastName: z.string().describe("Last name"),
    email: z.string().optional().describe("Email address"),
    phone: z.string().optional().describe("Phone number"),
    organization: z.string().optional().describe("Organization / company name"),
  },
  async ({ firstName, lastName, email, phone, organization }) => {
    const result = await createContact(firstName, lastName, email, phone, organization);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "update-contact",
  "Update fields on an existing contact in macOS Contacts.app",
  {
    contactId: z.string().describe("Contact ID from Contacts.app"),
    firstName: z.string().optional().describe("New first name"),
    lastName: z.string().optional().describe("New last name"),
    email: z.string().optional().describe("New primary email address"),
    phone: z.string().optional().describe("New primary phone number"),
    organization: z.string().optional().describe("New organization / company name"),
  },
  async ({ contactId, firstName, lastName, email, phone, organization }) => {
    const result = await updateContact(contactId, firstName, lastName, email, phone, organization);
    if (!result) {
      return { content: [{ type: "text", text: "Contact not found." }] };
    }
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list-groups",
  "List all contact groups in macOS Contacts.app with member counts",
  {},
  async () => {
    const groups = await listGroups();
    return { content: [{ type: "text", text: JSON.stringify(groups, null, 2) }] };
  },
);

server.tool(
  "add-to-group",
  "Add a contact to a group in macOS Contacts.app",
  {
    contactId: z.string().describe("Contact ID from Contacts.app"),
    groupName: z.string().describe("Name of the group to add the contact to"),
  },
  async ({ contactId, groupName }) => {
    const result = await addToGroup(contactId, groupName);
    if (!result) {
      return { content: [{ type: "text", text: "Contact not found." }] };
    }
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
