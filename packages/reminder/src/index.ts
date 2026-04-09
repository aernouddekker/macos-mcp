#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { listAccounts } from "./tools/listAccounts.js";
import { listLists } from "./tools/listLists.js";
import { getList } from "./tools/getList.js";
import { createList } from "./tools/createList.js";
import { updateList } from "./tools/updateList.js";
import { deleteList } from "./tools/deleteList.js";
import { showList } from "./tools/showList.js";
import { listReminders } from "./tools/listReminders.js";
import { searchReminders } from "./tools/searchReminders.js";
import { getReminder } from "./tools/getReminder.js";
import { todayReminders } from "./tools/todayReminders.js";
import { upcomingReminders } from "./tools/upcomingReminders.js";
import { overdueReminders } from "./tools/overdueReminders.js";
import { createReminder } from "./tools/createReminder.js";
import { updateReminder } from "./tools/updateReminder.js";
import { deleteReminder } from "./tools/deleteReminder.js";
import { completeReminder } from "./tools/completeReminder.js";
import { uncompleteReminder } from "./tools/uncompleteReminder.js";
import { moveReminder } from "./tools/moveReminder.js";
import { flagReminder } from "./tools/flagReminder.js";
import { setPriority } from "./tools/setPriority.js";
import { showReminder } from "./tools/showReminder.js";

const server = new McpServer({
  name: "remindermcp",
  version: "0.1.0",
});

server.tool(
  "list-accounts",
  "List all accounts configured in macOS Reminders.app (e.g. iCloud, On My Mac)",
  {},
  async () => {
    const accounts = await listAccounts();
    return { content: [{ type: "text", text: JSON.stringify(accounts, null, 2) }] };
  },
);

server.tool(
  "list-lists",
  "List every reminder list, optionally scoped to a single account by name. Returns id, name, container account, color, and emblem for each list.",
  {
    accountName: z.string().optional().describe("Optional account to scope the listing"),
  },
  async ({ accountName }) => {
    const lists = await listLists(accountName);
    if (!lists) return { content: [{ type: "text", text: "Account not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(lists, null, 2) }] };
  },
);

server.tool(
  "get-list",
  "Get properties of a single list by name (id, account, color, emblem, open + completed reminder counts)",
  {
    name: z.string().describe("List name"),
  },
  async ({ name }) => {
    const list = await getList(name);
    if (!list) return { content: [{ type: "text", text: "List not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(list, null, 2) }] };
  },
);

server.tool(
  "create-list",
  "Create a new reminder list. If accountName is omitted, the list is created in the default account.",
  {
    name: z.string().describe("Name for the new list"),
    accountName: z.string().optional().describe("Account to create the list in"),
  },
  async ({ name, accountName }) => {
    const result = await createList(name, accountName);
    if (!result) return { content: [{ type: "text", text: "Account not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "update-list",
  "Rename a reminder list",
  {
    name: z.string().describe("Current list name"),
    newName: z.string().describe("New list name"),
  },
  async ({ name, newName }) => {
    const result = await updateList(name, newName);
    if (!result) return { content: [{ type: "text", text: "List not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "delete-list",
  "Delete a reminder list by name. Reminders.app supports this directly via AppleScript (unlike Calendar.app).",
  {
    name: z.string().describe("Name of the list to delete"),
  },
  async ({ name }) => {
    try {
      const result = await deleteList(name);
      if (!result) return { content: [{ type: "text", text: "List not found." }] };
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (e) {
      return {
        content: [{ type: "text", text: (e as Error).message }],
        isError: true,
      };
    }
  },
);

server.tool(
  "show-list",
  "Bring a list to the front in Reminders.app",
  {
    name: z.string().describe("List name"),
  },
  async ({ name }) => {
    const result = await showList(name);
    if (!result) return { content: [{ type: "text", text: "List not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list-reminders",
  "List reminders in a named list. Excludes completed by default.",
  {
    listName: z.string().describe("List name"),
    includeCompleted: z.boolean().optional().default(false).describe("Include completed reminders"),
    limit: z.number().optional().default(100).describe("Max reminders to return"),
  },
  async ({ listName, includeCompleted, limit }) => {
    const reminders = await listReminders(listName, includeCompleted, limit);
    if (!reminders) return { content: [{ type: "text", text: "List not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(reminders, null, 2) }] };
  },
);

server.tool(
  "search-reminders",
  "Search reminders by name substring. Optionally scope to one list (recommended — `whose` filters scan every reminder).",
  {
    query: z.string().describe("Substring to match against reminder names"),
    listName: z.string().optional().describe("Optional list to scope the search"),
    includeCompleted: z.boolean().optional().default(false).describe("Include completed reminders"),
    limit: z.number().optional().default(25).describe("Max results to return"),
  },
  async ({ query, listName, includeCompleted, limit }) => {
    const reminders = await searchReminders(query, listName, includeCompleted, limit);
    if (!reminders) return { content: [{ type: "text", text: "List not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(reminders, null, 2) }] };
  },
);

server.tool(
  "get-reminder",
  "Get full details of a reminder by id (searches all lists). Returns name, body, completed, completion/creation/modification dates, due date, allday due date, remind me date, priority, flagged.",
  {
    id: z.string().describe("Reminder id (e.g. x-apple-reminderkit://...)"),
  },
  async ({ id }) => {
    const reminder = await getReminder(id);
    if (!reminder) return { content: [{ type: "text", text: "Reminder not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(reminder, null, 2) }] };
  },
);

server.tool(
  "today-reminders",
  "List reminders due today, scoped to one list or all lists.",
  {
    listName: z.string().optional().describe("Optional list to scope to"),
    includeCompleted: z.boolean().optional().default(false),
    limit: z.number().optional().default(100),
  },
  async ({ listName, includeCompleted, limit }) => {
    const reminders = await todayReminders(listName, includeCompleted, limit);
    if (!reminders) return { content: [{ type: "text", text: "List not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(reminders, null, 2) }] };
  },
);

server.tool(
  "upcoming-reminders",
  "List reminders due in the next N days, scoped to one list or all lists.",
  {
    days: z.number().optional().default(7).describe("Number of days ahead"),
    listName: z.string().optional().describe("Optional list to scope to"),
    includeCompleted: z.boolean().optional().default(false),
    limit: z.number().optional().default(100),
  },
  async ({ days, listName, includeCompleted, limit }) => {
    const reminders = await upcomingReminders(days, listName, includeCompleted, limit);
    if (!reminders) return { content: [{ type: "text", text: "List not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(reminders, null, 2) }] };
  },
);

server.tool(
  "overdue-reminders",
  "List reminders whose due date is in the past and that are not yet completed.",
  {
    listName: z.string().optional().describe("Optional list to scope to"),
    limit: z.number().optional().default(100),
  },
  async ({ listName, limit }) => {
    const reminders = await overdueReminders(listName, limit);
    if (!reminders) return { content: [{ type: "text", text: "List not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(reminders, null, 2) }] };
  },
);

server.tool(
  "create-reminder",
  "Create a new reminder in a named list. Pass `dueDate` for a timed due date, OR `allDayDueDate` for a date-only due date — never both.",
  {
    listName: z.string().describe("List to create the reminder in"),
    name: z.string().describe("Reminder title"),
    body: z.string().optional().describe("Notes / body text"),
    dueDate: z.string().optional().describe("Due date with time, ISO 8601"),
    allDayDueDate: z.string().optional().describe("All-day due date (date only), ISO 8601"),
    remindMeDate: z.string().optional().describe("Time to fire the reminder, ISO 8601"),
    priority: z.number().optional().describe("Priority integer: 0=none, 1=high, 5=medium, 9=low"),
    flagged: z.boolean().optional().describe("Flagged state"),
  },
  async ({ listName, name, body, dueDate, allDayDueDate, remindMeDate, priority, flagged }) => {
    const result = await createReminder(listName, name, {
      body,
      dueDate,
      allDayDueDate,
      remindMeDate,
      priority,
      flagged,
    });
    if (!result) return { content: [{ type: "text", text: "List not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "update-reminder",
  "Patch fields on an existing reminder by id",
  {
    id: z.string().describe("Reminder id"),
    name: z.string().optional(),
    body: z.string().optional(),
    dueDate: z.string().optional().describe("New due date with time, ISO 8601"),
    allDayDueDate: z.string().optional().describe("New all-day due date, ISO 8601"),
    remindMeDate: z.string().optional().describe("New remind-me date, ISO 8601"),
    priority: z.number().optional().describe("Priority integer: 0=none, 1=high, 5=medium, 9=low"),
    flagged: z.boolean().optional(),
  },
  async ({ id, ...fields }) => {
    const result = await updateReminder(id, fields);
    if (!result) return { content: [{ type: "text", text: "Reminder not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "delete-reminder",
  "Delete a reminder by id",
  {
    id: z.string().describe("Reminder id"),
  },
  async ({ id }) => {
    const result = await deleteReminder(id);
    if (!result) return { content: [{ type: "text", text: "Reminder not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "complete-reminder",
  "Mark a reminder as completed (Reminders.app stamps completion date automatically)",
  {
    id: z.string().describe("Reminder id"),
  },
  async ({ id }) => {
    const result = await completeReminder(id);
    if (!result) return { content: [{ type: "text", text: "Reminder not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "uncomplete-reminder",
  "Mark a previously completed reminder as not completed",
  {
    id: z.string().describe("Reminder id"),
  },
  async ({ id }) => {
    const result = await uncompleteReminder(id);
    if (!result) return { content: [{ type: "text", text: "Reminder not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "move-reminder",
  "Move a reminder to a different list (uses Reminders.app's native `move` verb — id is preserved)",
  {
    id: z.string().describe("Reminder id"),
    targetList: z.string().describe("Name of the destination list"),
  },
  async ({ id, targetList }) => {
    const result = await moveReminder(id, targetList);
    if (!result) return { content: [{ type: "text", text: "Reminder or target list not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "flag-reminder",
  "Set or clear the flagged state on a reminder",
  {
    id: z.string().describe("Reminder id"),
    flagged: z.boolean().describe("New flagged state"),
  },
  async ({ id, flagged }) => {
    const result = await flagReminder(id, flagged);
    if (!result) return { content: [{ type: "text", text: "Reminder not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "set-priority",
  "Set the priority of a reminder. Maps to Reminders.app's integer enum: none=0, high=1, medium=5, low=9.",
  {
    id: z.string().describe("Reminder id"),
    priority: z.enum(["none", "high", "medium", "low"]).describe("Priority level"),
  },
  async ({ id, priority }) => {
    const result = await setPriority(id, priority);
    if (!result) return { content: [{ type: "text", text: "Reminder not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "show-reminder",
  "Bring Reminders.app to the front and focus a specific reminder",
  {
    id: z.string().describe("Reminder id"),
  },
  async ({ id }) => {
    const result = await showReminder(id);
    if (!result) return { content: [{ type: "text", text: "Reminder not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
