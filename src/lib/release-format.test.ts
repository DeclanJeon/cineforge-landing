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
