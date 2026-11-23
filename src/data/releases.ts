import data from "./releases.json";

/** One language's release notes, parsed from the fixed release-body headings. */
export type Notes = {
  summary: string;
  added: string[];
  improved: string[];
  fixed: string[];
  compat: string[];
};

export type ReleaseAsset = { name: string; url: string; size: number; sha256?: string };

export type Release = {
  product: "cineforge" | "skills";
  version: string;
  date: string;
  url: string;
  notes: { ko?: Notes; en?: Notes; source: "ko" | "en" };
  assets: ReleaseAsset[];
  compat?: string;
};

export type ReleasesFile = { updatedAt: string; cineforge: Release[]; skills: Release[] };

/** Snapshot written by `.github/scripts/sync-releases.mjs`; newest first. */
export const releases = data as ReleasesFile;

/** Notes in the page language, falling back to the language the release was written in. */
export function notesFor(release: Release, lang: "ko" | "en"): { notes: Notes; translated: boolean } {
  const own = release.notes[lang];
  if (own) return { notes: own, translated: false };
  return { notes: release.notes[release.notes.source] as Notes, translated: true };
}
