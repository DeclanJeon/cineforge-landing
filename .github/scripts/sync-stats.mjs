/**
 * Refresh `src/data/stats.json` from the CineForge repository.
 *
 * The repository is public, so stars/forks/watchers/issues come from the
 * unauthenticated API and the workflow works with no secret at all. A token
 * (`STATS_TOKEN`, `repo` scope) is only needed for the traffic endpoints, which
 * GitHub refuses to serve anonymously — without it those two numbers stay 0.
 */
import { writeFile } from "node:fs/promises";

const token = process.env.STATS_TOKEN ?? "";
const repo = process.env.STATS_REPO ?? "DeclanJeon/cineforge";
const target = new URL("../../src/data/stats.json", import.meta.url);

const headers = {
  accept: "application/vnd.github+json",
  "user-agent": "cineforge-landing-stats",
  "x-github-api-version": "2022-11-28",
  ...(token ? { authorization: `Bearer ${token}` } : {}),
};

const repoRes = await fetch(`https://api.github.com/repos/${repo}`, { headers });
if (repoRes.status === 403 || repoRes.status === 429) {
  // Shared-runner IPs burn the anonymous limit fast. Keep the committed numbers
  // instead of failing: the live value on the page comes from the browser.
  console.warn(`GitHub rate-limited the request (${repoRes.status}) — keeping stats.json.`);
  process.exit(0);
}
if (!repoRes.ok) {
  console.error(`GitHub API returned ${repoRes.status} for ${repo}`);
  process.exit(1);
}
const data = await repoRes.json();

async function traffic(path) {
  if (!token) return 0;
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
console.log(next, token ? "(with traffic)" : "(no STATS_TOKEN — traffic skipped)");
