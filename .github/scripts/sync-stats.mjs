/**
 * Refresh `src/data/stats.json` from the private CineForge repository.
 *
 * Needs a PAT with `repo` read access in `STATS_TOKEN`; without it the script
 * exits 0 and leaves the committed numbers alone, so forks and local runs of
 * the workflow never fail.
 */
import { writeFile } from "node:fs/promises";

const token = process.env.STATS_TOKEN;
const repo = process.env.STATS_REPO ?? "DeclanJeon/cineforge";
const target = new URL("../../src/data/stats.json", import.meta.url);

if (!token) {
  console.log("STATS_TOKEN is not set — keeping the committed stats.json.");
  process.exit(0);
}

const headers = {
  authorization: `Bearer ${token}`,
  accept: "application/vnd.github+json",
  "user-agent": "cineforge-landing-stats",
  "x-github-api-version": "2022-11-28",
};

const repoRes = await fetch(`https://api.github.com/repos/${repo}`, { headers });
if (!repoRes.ok) {
  console.error(`GitHub API returned ${repoRes.status} for ${repo}`);
  process.exit(1);
}
const data = await repoRes.json();

async function traffic(path) {
  const res = await fetch(`https://api.github.com/repos/${repo}/traffic/${path}`, {
    headers,
  });
  return res.ok ? ((await res.json()).count ?? 0) : 0;
}

const next = {
  repo,
  stars: data.stargazers_count ?? 0,
  forks: data.forks_count ?? 0,
  watchers: data.subscribers_count ?? 0,
  openIssues: data.open_issues_count ?? 0,
  views14d: await traffic("views"),
  clones14d: await traffic("clones"),
  updatedAt: new Date().toISOString(),
};

await writeFile(target, `${JSON.stringify(next, null, 2)}\n`);
console.log(next);
