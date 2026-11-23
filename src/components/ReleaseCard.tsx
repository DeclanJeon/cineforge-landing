import type { Lang } from "../i18n";
import { useDict } from "../i18n";
import { notesFor, type Release } from "../data/releases";
import { InlineMd } from "../lib/inline-md";
import { formatDate, formatSize, releaseId, summaryBlocks } from "../lib/release-format";
import { ArrowRight } from "./Icons";

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="rel__group">
      <h4 className="rel__label mono">{title}</h4>
      <ul className="rel__list">
        {items.map((item, i) => (
          <li key={i}>
            <InlineMd text={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReleaseCard({ release, lang }: { release: Release; lang: Lang }) {
  const d = useDict();
  const { notes, translated } = notesFor(release, lang);

  return (
    <article className="rel" id={releaseId(release)} aria-labelledby={`${releaseId(release)}-h`}>
      <header className="rel__head">
        <h3 className="rel__version" id={`${releaseId(release)}-h`}>
          v{release.version}
        </h3>
        <time className="rel__date mono" dateTime={release.date}>
          {formatDate(release.date, lang)}
        </time>
        {translated ? <span className="rel__badge mono">{d.changelog.translated}</span> : null}
        <a className="rel__gh" href={release.url} target="_blank" rel="noopener noreferrer">
          {d.changelog.viewOnGitHub}
          <ArrowRight />
        </a>
      </header>

      {summaryBlocks(notes.summary).map((block, i) =>
        block.kind === "p" ? (
          <p className="rel__summary" key={i}>
            <InlineMd text={block.text} />
          </p>
        ) : (
          <ul className="rel__list rel__summary" key={i}>
            {block.items.map((item, j) => (
              <li key={j}>
                <InlineMd text={item} />
              </li>
            ))}
          </ul>
        ),
      )}

      <List title={d.changelog.added} items={notes.added} />
      <List title={d.changelog.improved} items={notes.improved} />
      <List title={d.changelog.fixed} items={notes.fixed} />
      <List title={d.changelog.compat} items={notes.compat} />

      {release.product === "skills" && release.assets.length > 0 ? (
        <ul className="rel__assets">
          {release.assets.map((asset) => (
            <li key={asset.name}>
              <a href={asset.url}>{asset.name}</a>
              <span className="mono dim"> · {formatSize(asset.size)} · sha256 {asset.sha256?.slice(0, 12)}…</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
