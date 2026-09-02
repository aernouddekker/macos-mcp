import assert from "node:assert/strict";
import test from "node:test";
import { messageIdFilter } from "../dist/lib/applescript.js";

test("local IDs avoid header lookups; RFC IDs remain escaped strings", () => {
  assert.equal(messageIdFilter("12345"), "id is 12345");
  assert.equal(messageIdFilter("00123"), "id is 123");
  assert.equal(messageIdFilter("12345@example.com"), 'message id is "12345@example.com"');
  assert.equal(messageIdFilter('123" or id is 456 --'), 'message id is "123\\" or id is 456 --"');
  assert.equal(messageIdFilter('a\\b@example.com'), 'message id is "a\\\\b@example.com"');
  assert.throws(() => messageIdFilter("0"), /positive safe integer/);
  assert.throws(() => messageIdFilter("9007199254740992"), /positive safe integer/);
});
