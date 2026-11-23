/**
 * Turn a GitHub release into the landing page's `Release` record.
 *
 * Release bodies follow the fixed headings in each product repository's
 * `docs/release-notes.md`. Bodies written before that format (no known
 * heading) become one summary in the language they were written in.
 */

const SECTIONS = {
  ko: { 요약: "summary", "새 기능": "added", 개선: "improved", 수정: "fixed", 호환성: "compat" },
  en: { Summary: "summary", New: "added", Improved: "improved", Fixed: "fixed", Compatibility: "compat" },
};

/** Remove HTML; script/style blocks go with their content. */
export function stripHtml(text) {
  return String(text)
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?[a-zA-Z][^>]*>/g, "");
}

const emptyNotes = () => ({ summary: "", added: [], improved: [], fixed: [], compat: [] });

function headingTarget(line) {
  const match = /^##\s+(.+?)\s*$/.exec(line);
  if (!match) return null;
  for (const lang of ["ko", "en"]) {
    const key = SECTIONS[lang][match[1]];
    if (key) return { lang, key };
  }
  return null;
}

function finish(notes) {
  notes.summary = notes.summary.trim();
  return notes;
}

/** @returns {{ ko?: Notes, en?: Notes, source: "ko"|"en", compat?: string }} */
export function parseNotes(body) {
  const clean = stripHtml(body ?? "").replace(/\r\n/g, "\n");
  const out = {};
  let current = null;
  for (const line of clean.split("\n")) {
    const target = headingTarget(line);
    if (target) {
      out[target.lang] ??= emptyNotes();
      current = target;
      continue;
    }
    if (!current) continue;
    const notes = out[current.lang];
    const item = /^\s*[-*]\s+(.*\S)\s*$/.exec(line);
    if (current.key === "summary") {
      notes.summary += `${line}\n`;
    } else if (item) {
      notes[current.key].push(item[1]);
    }
  }
  if (!out.ko && !out.en) {
    const lang = /[\uac00-\ud7a3]/.test(clean) ? "ko" : "en";
    return { [lang]: { ...emptyNotes(), summary: clean.trim() }, source: lang };
  }
  for (const lang of ["ko", "en"]) if (out[lang]) finish(out[lang]);
  const source = out.ko ? "ko" : "en";
  const compat = out[source].compat.join("\n");
  return { ...out, source, ...(compat ? { compat } : {}) };
}

/** Asset `X.tar.gz` pairs with checksum file `X.sha256` (or `X.tar.gz.sha256`). */
export function checksumAssetName(archiveName) {
  return archiveName.replace(/\.(tar\.gz|tgz|zip)$/, "") + ".sha256";
}

/**
 * @param {"cineforge"|"skills"} product
 * @param {object} api GitHub release JSON
 * @param {Record<string,string>} sha256ByAsset archive name -> hex digest
 */
export function toRelease(product, api, sha256ByAsset) {
  const parsed = parseNotes(api.body);
  const { compat, ...notes } = parsed;
  const files = (api.assets ?? []).filter((a) => !a.name.endsWith(".sha256"));
  const assets =
    product === "skills"
      ? files
          .filter((a) => sha256ByAsset[a.name])
          .map((a) => ({ name: a.name, url: a.browser_download_url, size: a.size, sha256: sha256ByAsset[a.name] }))
      : files.map((a) => ({ name: a.name, url: a.browser_download_url, size: a.size }));
  return {
    product,
    version: api.tag_name.replace(/^v/, ""),
    date: api.published_at,
    url: api.html_url,
    notes,
    assets,
    ...(compat ? { compat } : {}),
  };
}

/** Numeric dotted-version comparison, newest first. */
export function byVersionDesc(a, b) {
  const pa = a.version.split(".").map(Number);
  const pb = b.version.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const d = (pb[i] ?? 0) - (pa[i] ?? 0);
    if (d) return d;
  }
  return 0;
}
