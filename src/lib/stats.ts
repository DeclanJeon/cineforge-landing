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

/**
 * Repository numbers come from `src/data/stats.json`, refreshed by
 * `.github/workflows/sync-stats.yml`. Baked in at build time, so the copy
 * visitors get is always the one the deploy was built from.
 */
export const stats: Stats = fallback as Stats;
