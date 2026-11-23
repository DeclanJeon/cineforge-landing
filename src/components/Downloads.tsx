import { CHANGELOG_PATH, lang, useDict } from "../i18n";
import { hasSkillUpdateCommand, notesFor, releases } from "../data/releases";
import { InlineMd } from "../lib/inline-md";
import { firstParagraph, formatDate, formatSize, releaseId } from "../lib/release-format";
import { ArrowDown, ArrowRight } from "./Icons";
import { CopyBlock } from "./CopyBlock";
import { SectionHead } from "./SectionHead";

/** Manual install for CineForge releases without `skills update`. */
function manualInstall(file: string, version: string) {
  const dir = `$HOME/.local/share/cineforge/skill-packs`;
  return [
    `mkdir -p "${dir}" && tar -xzf ${file} -C "${dir}"`,
    `export CINEFORGE_SKILL_PACK="${dir}/contents-production-skills-${version}"`,
    "cineforge skills",
  ].join("\n");
}

export function Downloads() {
  const d = useDict();
  const latest = releases.skills[0];
  const archive = latest?.assets.find((a) => a.sha256);
  const notes = latest ? notesFor(latest, lang).notes : null;
  const compat = notes?.compat[0];

  return (
    <section className="dl" id="downloads" aria-labelledby="downloads-title">
      <div className="wrap">
        <SectionHead kicker={d.downloads.kicker} title={d.downloads.title} note={d.downloads.note} id="downloads-title" />
        {!latest ? (
          <p className="dim">{d.changelog.empty}</p>
        ) : (
          <div className="dl__card">
            <div className="dl__head">
              <h3 className="dl__version">
                {d.downloads.pack} <span className="mono">v{latest.version}</span>
              </h3>
              <time className="mono dim" dateTime={latest.date}>
                {formatDate(latest.date, lang)}
              </time>
            </div>
            <p className="dl__summary">
              <InlineMd text={firstParagraph(notes?.summary ?? "")} />
            </p>
            {compat ? (
              <p className="dl__compat">
                <span className="mono">{d.changelog.compat}</span> <InlineMd text={compat} />
              </p>
            ) : null}

            {archive ? (
              <>
                <div className="dl__actions">
                  <a className="btn btn--solid" href={archive.url}>
                    <ArrowDown />
                    {d.downloads.download} · {formatSize(archive.size)}
                  </a>
                  <a className="btn btn--ghost" href={`${CHANGELOG_PATH[lang]}#${releaseId(latest)}`}>
                    {d.downloads.notes}
                    <ArrowRight />
                  </a>
                </div>
                <p className="dl__sha mono">
                  SHA-256 <span className="dl__hash">{archive.sha256}</span>
                </p>
                <p className="dim dl__hint">{d.downloads.verifyHint}</p>
                <CopyBlock
                  label={d.downloads.verifyLabel}
                  code={`echo "${archive.sha256}  ${archive.name}" | sha256sum -c -`}
                />
                {hasSkillUpdateCommand ? (
                  <>
                    <p className="dim dl__hint">{d.downloads.cliHint}</p>
                    <CopyBlock label={d.downloads.cliLabel} code="cineforge skills update --yes" />
                  </>
                ) : (
                  <>
                    <p className="dim dl__hint">{d.downloads.manualHint}</p>
                    <CopyBlock label={d.downloads.manualLabel} code={manualInstall(archive.name, latest.version)} />
                  </>
                )}
              </>
            ) : (
              <a className="btn btn--ghost" href={latest.url} target="_blank" rel="noopener noreferrer">
                {d.downloads.github}
                <ArrowRight />
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
