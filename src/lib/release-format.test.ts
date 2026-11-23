import assert from "node:assert/strict";
import { test } from "node:test";

import { summaryBlocks } from "./release-format.ts";

test("bullet paragraphs become lists, prose lines join", () => {
  const text = "New projects use IDs\ninstead of prefixes.\n\n- One `a`\n- Two\n\nTail.";
  assert.deepEqual(summaryBlocks(text), [
    { kind: "p", text: "New projects use IDs instead of prefixes." },
    { kind: "ul", items: ["One `a`", "Two"] },
    { kind: "p", text: "Tail." },
  ]);
});

test("prose followed by bullets in one paragraph splits", () => {
  assert.deepEqual(summaryBlocks("Intro\n- a\n- b"), [
    { kind: "p", text: "Intro" },
    { kind: "ul", items: ["a", "b"] },
  ]);
});

import { atLeast } from "./release-format.ts";

test("atLeast compares dotted versions numerically", () => {
  assert.equal(atLeast("0.1.6", "0.1.6"), true);
  assert.equal(atLeast("0.1.10", "0.1.6"), true);
  assert.equal(atLeast("0.1.5", "0.1.6"), false);
  assert.equal(atLeast(undefined, "0.1.6"), false);
});
