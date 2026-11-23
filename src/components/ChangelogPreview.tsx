import { CHANGELOG_PATH, lang, useDict } from "../i18n";
import { notesFor, releases, type Release } from "../data/releases";
import { InlineMd } from "../lib/inline-md";
import { firstParagraph, formatDate, releaseId } from "../lib/release-format";
import { ArrowRight } from "./Icons";
import { SectionHead } from "./SectionHead";

function Column({ title, items }: { title: string; items: Release[] }) {
  const d = useDict();
  return (
    <div className="clp__col">
      <h3 className="clp__product">{title}</h3>
      {items.length === 0 ? (
        <p className="dim">{d.changelog.empty}</p>
      ) : (
        <ol className="clp__list">
          {items.slice(0, 3).map((release) => (
            <li key={release.version}>
              <a className="clp__item" href={`${CHANGELOG_PATH[lang]}#${releaseId(release)}`}>
                <span className="clp__meta mono">
                  v{release.version} · {formatDate(release.date, lang)}
                </span>
                <span className="clp__text">
                  <InlineMd text={firstParagraph(notesFor(release, lang).notes.summary)} />
                </span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function ChangelogPreview() {
  const d = useDict();
  return (
    <section className="section clp" id="changelog" aria-labelledby="changelog-title">
      <div className="wrap">
        <SectionHead kicker={d.changelog.previewKicker} title={d.changelog.previewTitle} note={d.changelog.previewNote} id="changelog-title" />
        <div className="clp__cols">
          <Column title={d.changelog.tabs.cineforge} items={releases.cineforge} />
          <Column title={d.changelog.tabs.skills} items={releases.skills} />
        </div>
        <a className="btn btn--ghost clp__all" href={CHANGELOG_PATH[lang]}>
          {d.changelog.all}
          <ArrowRight />
        </a>
      </div>
    </section>
  );
}
