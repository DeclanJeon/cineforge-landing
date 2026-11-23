import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { parseNotes, stripHtml, toRelease } from "./release-notes.mjs";
import { syncReleases } from "./sync-releases.mjs";

const fixture = (name) =>
  JSON.parse(readFileSync(new URL(`./fixtures/${name}-releases.json`, import.meta.url), "utf8"));
const cineforge = fixture("cineforge");
const skills = fixture("skills");
const byTag = (list, tag) => list.find((r) => r.tag_name === tag);
const SHA = "6106d0b660a4869bf266f39f686a608145b9dc2399778b93f6c25d6778007217";

test("parses sectioned body", () => {
  const notes = parseNotes(byTag(cineforge, "v9.0.0").body);
  assert.equal(notes.source, "ko");
  assert.ok(notes.ko.added.length > 0);
  assert.equal(notes.ko.added[0], "`skills update` 추가");
  assert.deepEqual(notes.ko.fixed, ["버그 수정"]);
  assert.ok(notes.en.summary.length > 0);
  assert.equal(notes.ko.summary.includes("<script>"), false);
  assert.equal(notes.compat, "스킬팩 2.65 이상");
});

test("parses legacy body", () => {
  const body = byTag(cineforge, "v0.1.4").body;
  const notes = parseNotes(body);
  assert.equal(notes.source, "en");
  assert.equal(notes.ko, undefined);
  assert.equal(notes.en.summary, stripHtml(body).trim());
  assert.deepEqual([notes.en.added, notes.en.improved, notes.en.fixed], [[], [], []]);
});

test("strips html", () => {
  assert.equal(stripHtml("a<script>x</script><b>b</b>"), "ab");
});

test("skills sha256 attached", () => {
  const rel = toRelease("skills", byTag(skills, "v2.64"), {
    "contents-production-skills-2.64.tar.gz": SHA,
  });
  assert.equal(rel.version, "2.64");
  assert.equal(rel.assets.length, 1);
  assert.equal(rel.assets[0].name, "contents-production-skills-2.64.tar.gz");
  assert.equal(rel.assets[0].sha256, SHA);
});

test("drops download without sha", () => {
  const rel = toRelease("skills", byTag(skills, "v2.64"), {});
  assert.deepEqual(rel.assets, []);
});

function fakeFetch(handler) {
  return async (url) => handler(String(url));
}
const json = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => (typeof data === "string" ? data : JSON.stringify(data)),
});
function io(initial) {
  const state = { file: initial, writes: 0 };
  return {
    state,
    readFile: async () => {
      if (state.file === undefined) throw Object.assign(new Error("ENOENT"), { code: "ENOENT" });
      return state.file;
    },
    writeFile: async (_target, text) => {
      state.writes += 1;
      state.file = text;
    },
  };
}
const goodFetch = fakeFetch((url) => {
  if (url.includes("/repos/DeclanJeon/cineforge/")) return json(cineforge);
  if (url.includes("/repos/DeclanJeon/contents-production-skills/")) return json(skills);
  if (url.endsWith(".sha256")) return json(`${SHA}  contents-production-skills-2.64.tar.gz\n`);
  return json({}, 404);
});

test("writes a snapshot without prereleases, newest first", async () => {
  const files = io(undefined);
  const result = await syncReleases({ fetch: goodFetch, ...files, target: "x" });
  assert.equal(result, "written");
  const data = JSON.parse(files.state.file);
  assert.deepEqual(
    data.cineforge.map((r) => r.version),
    ["9.0.0", "0.1.4", "0.1.1"],
  );
  assert.equal(data.skills[0].assets[0].sha256, SHA);
});

test("keeps file on rate limit", async () => {
  const files = io('{"old":true}');
  const result = await syncReleases({ fetch: fakeFetch(() => json({}, 403)), ...files, target: "x" });
  assert.equal(result, "kept");
  assert.equal(files.state.writes, 0);
});

test("keeps file on network error", async () => {
  const files = io('{"old":true}');
  const boom = async () => {
    throw new TypeError("fetch failed");
  };
  assert.equal(await syncReleases({ fetch: boom, ...files, target: "x" }), "kept");
  assert.equal(files.state.writes, 0);
});

test("keeps file on empty", async () => {
  const files = io('{"old":true}');
  const result = await syncReleases({ fetch: fakeFetch(() => json([])), ...files, target: "x" });
  assert.equal(result, "kept");
  assert.equal(files.state.writes, 0);
});

test("unchanged when equal", async () => {
  const files = io(undefined);
  await syncReleases({ fetch: goodFetch, ...files, target: "x" });
  const result = await syncReleases({ fetch: goodFetch, ...files, target: "x" });
  assert.equal(result, "unchanged");
  assert.equal(files.state.writes, 1);
});

test("keeps placeholders and code while stripping tags", () => {
  assert.equal(
    stripHtml("run `cineforge skills use <version>` <b>now</b> for <project>"),
    "run `cineforge skills use <version>` now for <project>",
  );
});

test("keeps file when a checksum download fails", async () => {
  const files = io('{"old":true}');
  const flaky = fakeFetch((url) => {
    if (url.endsWith(".sha256")) return json({}, 503);
    return goodFetch(url);
  });
  assert.equal(await syncReleases({ fetch: flaky, ...files, target: "x" }), "kept");
  assert.equal(files.state.writes, 0);
});

test("keeps a product list that comes back empty", async () => {
  const files = io(undefined);
  await syncReleases({ fetch: goodFetch, ...files, target: "x" });
  const skillsEmpty = fakeFetch((url) =>
    url.includes("/repos/DeclanJeon/contents-production-skills/") ? json([]) : goodFetch(url),
  );
  assert.equal(await syncReleases({ fetch: skillsEmpty, ...files, target: "x" }), "unchanged");
  assert.equal(JSON.parse(files.state.file).skills[0].version, "2.64");
});
