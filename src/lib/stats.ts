import { useEffect, useState } from "react";
import fallback from "../data/stats.json";

export type Stats = {
  repo: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  views14d: number;
  clones14d: number;
  updatedAt: string | null;
};

const REPO = "DeclanJeon/cineforge";
const API = `https://api.github.com/repos/${REPO}`;
const CACHE_KEY = "cineforge:stats";
const REFRESH_MS = 60_000;

export const repoUrl = `https://github.com/${REPO}`;

/**
 * Numbers baked into the deploy from `src/data/stats.json`, refreshed by
 * `.github/workflows/sync-stats.yml`. They are what a crawler or a visitor
 * without JavaScript sees, so the page never ships an empty star count.
 */
export const stats: Stats = fallback as Stats;

type Live = { stars: number; forks: number };
type Cached = Live & { at: number };

function readCache(): Cached | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Cached) : null;
  } catch {
    return null;
  }
}

function writeCache(live: Live) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ...live, at: Date.now() }));
  } catch {
    /* storage disabled — the live value still applies for this page view */
  }
}

/**
 * Baked numbers first, then the public GitHub API replaces them.
 *
 * The repository is public, so the unauthenticated endpoint is enough (60
 * requests/hour per IP) and a star shows up on the visitor's next visit — no
 * rebuild, no token, no server. A cached answer younger than a minute is
 * reused so returning to the tab does not spend the rate limit.
 */
export function useRepoStats(): Stats {
  const [live, setLive] = useState<Live | null>(() => {
    const cached = readCache();
    return cached ? { stars: cached.stars, forks: cached.forks } : null;
  });

  useEffect(() => {
    let cancelled = false;

    const load = async (force = false) => {
      const cached = readCache();
      if (!force && cached && Date.now() - cached.at < REFRESH_MS) return;
      try {
        const res = await fetch(API, {
          headers: { accept: "application/vnd.github+json" },
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          stargazers_count?: number;
          forks_count?: number;
        };
        if (cancelled || typeof data.stargazers_count !== "number") return;
        const next: Live = {
          stars: data.stargazers_count,
          forks: data.forks_count ?? 0,
        };
        writeCache(next);
        setLive(next);
      } catch {
        /* offline or rate limited — keep the baked numbers */
      }
    };

    void load(true);

    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return live ? { ...stats, ...live } : stats;
}
