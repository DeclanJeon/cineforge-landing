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

export type SummaryBlock = { kind: "p"; text: string } | { kind: "ul"; items: string[] };

/** Split a summary into prose paragraphs and `- ` bullet lists (legacy release bodies use both). */
export function summaryBlocks(text: string): SummaryBlock[] {
  const blocks: SummaryBlock[] = [];
  for (const para of text.split(/\n\s*\n/)) {
    let prose: string[] = [];
    let items: string[] = [];
    const flushProse = () => {
      if (prose.length) blocks.push({ kind: "p", text: prose.join(" ") });
      prose = [];
    };
    const flushItems = () => {
      if (items.length) blocks.push({ kind: "ul", items });
      items = [];
    };
    for (const raw of para.split("\n")) {
      const line = raw.trim();
      if (!line) continue;
      const bullet = /^[-*]\s+(.*)$/.exec(line);
      if (bullet) {
        flushProse();
        items.push(bullet[1]);
      } else {
        flushItems();
        prose.push(line);
      }
    }
    flushProse();
    flushItems();
  }
  return blocks;
}

/** True when dotted version `have` is at least `need` (missing counts as false). */
export function atLeast(have: string | undefined, need: string) {
  if (!have) return false;
  const a = have.split(".").map(Number);
  const b = need.split(".").map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    if (d) return d > 0;
  }
  return true;
}
