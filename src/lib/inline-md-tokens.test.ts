import assert from "node:assert/strict";
import { test } from "node:test";

import { tokenize } from "./inline-md-tokens.ts";

test("tokenizes code, bold and https links", () => {
  const tokens = tokenize("a `b` **c** [d](https://e)");
  assert.deepEqual(
    tokens.map((t) => t.kind),
    ["text", "code", "text", "bold", "text", "link"],
  );
  assert.deepEqual(tokens[1], { kind: "code", text: "b" });
  assert.deepEqual(tokens[5], { kind: "link", text: "d", href: "https://e" });
});

test("non-https links stay text", () => {
  assert.deepEqual(tokenize("[x](javascript:alert(1))"), [
    { kind: "text", text: "[x](javascript:alert(1))" },
  ]);
});

test("unclosed markers stay text", () => {
  assert.deepEqual(tokenize("a `b **c"), [{ kind: "text", text: "a `b **c" }]);
});
