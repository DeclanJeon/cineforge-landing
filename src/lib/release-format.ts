import type { Lang } from "../i18n";

export function formatDate(iso: string, lang: Lang) {
  return new Date(iso).toLocaleDateString(lang === "ko" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** First paragraph of a summary, for compact previews. */
export function firstParagraph(text: string) {
  return text.split(/\n\s*\n/)[0].replace(/\s*\n\s*/g, " ").trim();
}

/** Anchor id for a release, e.g. `cineforge-0.1.5`. */
export function releaseId(release: { product: string; version: string }) {
  return `${release.product}-${release.version}`;
}
