/**
 * Refresh `src/data/releases.json` from the public GitHub releases of
 * CineForge and the Contents Production Skills pack.
 *
 * Only published, non-prerelease releases are shown. Any API failure, rate
 * limit or empty answer keeps the committed file, so a flaky run never ships
 * an empty changelog. A token (`GITHUB_TOKEN`/`STATS_TOKEN`) only lifts the
 * anonymous rate limit.
 */
import { readFile as fsRead, writeFile as fsWrite } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { byVersionDesc, checksumAssetName, toRelease } from "./release-notes.mjs";

export const REPOS = {
  cineforge: "DeclanJeon/cineforge",
  skills: "DeclanJeon/contents-production-skills",
};

class Keep extends Error {}

function headers() {
  const token = process.env.GITHUB_TOKEN || process.env.STATS_TOKEN || "";
  return {
    accept: "application/vnd.github+json",
    "user-agent": "cineforge-landing-releases",
    "x-github-api-version": "2022-11-28",
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  };
}

async function get(fetch, url, kind) {
  let res;
  try {
    res = await fetch(url, { headers: headers() });
  } catch (err) {
    throw new Keep(`network error for ${url}: ${err.message}`);
  }
  if (!res.ok) throw new Keep(`GitHub returned ${res.status} for ${url}`);
  return kind === "text" ? res.text() : res.json();
}

async function checksums(fetch, api) {
  const out = {};
  for (const asset of api.assets ?? []) {
    if (asset.name.endsWith(".sha256")) continue;
    const pair = (api.assets ?? []).find(
      (a) => a.name === checksumAssetName(asset.name) || a.name === `${asset.name}.sha256`,
    );
    if (!pair) continue;
    // A failed checksum download keeps the whole snapshot (Keep propagates), so a
    // transient error never removes a live download button. A malformed file
    // simply leaves that archive without a button.
    const text = await get(fetch, pair.browser_download_url, "text");
    const hex = String(text).trim().split(/\s+/)[0];
    if (/^[0-9a-f]{64}$/.test(hex)) out[asset.name] = hex;
  }
  return out;
}

async function collect(fetch, product) {
  const list = await get(fetch, `https://api.github.com/repos/${REPOS[product]}/releases?per_page=30`);
  if (!Array.isArray(list)) throw new Keep(`unexpected answer for ${product}`);
  const published = list.filter((r) => !r.draft && !r.prerelease);
  const releases = [];
  for (const api of published) {
    const sha = product === "skills" ? await checksums(fetch, api) : {};
    releases.push(toRelease(product, api, sha));
  }
  return releases.sort(byVersionDesc);
}

/**
 * @returns {Promise<"written"|"unchanged"|"kept">}
 */
export async function syncReleases({ fetch, readFile, writeFile, target }) {
  let cineforge;
  let skills;
  try {
    cineforge = await collect(fetch, "cineforge");
    skills = await collect(fetch, "skills");
  } catch (err) {
    if (err instanceof Keep) {
      console.warn(`${err.message} — keeping releases.json.`);
      return "kept";
    }
    throw err;
  }
  if (cineforge.length === 0 && skills.length === 0) {
    console.warn("no published releases returned — keeping releases.json.");
    return "kept";
  }
  let previous = null;
  try {
    previous = JSON.parse(await readFile(target, "utf8"));
  } catch {
    previous = null;
  }
  // A product that suddenly lists nothing is treated as a bad answer for that product.
  if (cineforge.length === 0 && previous?.cineforge?.length) cineforge = previous.cineforge;
  if (skills.length === 0 && previous?.skills?.length) skills = previous.skills;
  const body = { cineforge, skills };
  if (previous && JSON.stringify({ cineforge: previous.cineforge, skills: previous.skills }) === JSON.stringify(body)) {
    return "unchanged";
  }
  const data = { updatedAt: new Date().toISOString(), ...body };
  await writeFile(target, `${JSON.stringify(data, null, 2)}\n`);
  return "written";
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const target = new URL("../../src/data/releases.json", import.meta.url);
  const result = await syncReleases({ fetch: globalThis.fetch, readFile: fsRead, writeFile: fsWrite, target });
  console.log(`releases.json ${result}`);
}
