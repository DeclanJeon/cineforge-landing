import { useRef, useState } from "react";
import { gsap, SplitText, useGSAP } from "../lib/gsap";
import { homeHref, useDict, type Page } from "../i18n";
import { ArrowRight, CheckIcon, CopyIcon, GitHubIcon } from "./Icons";
import { copyText } from "../lib/clipboard";

const REPO = "https://github.com/DeclanJeon/cineforge";
const INSTALL = 'pip install -e ".[dev]"';

export function Closing() {
  const d = useDict();
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const copyRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);

  useGSAP(
    () => {
      const title = titleRef.current;
      if (!title) return;

      const split = SplitText.create(title, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 112,
            duration: 1.15,
            ease: "expo.out",
            stagger: 0.09,
            scrollTrigger: { trigger: title, start: "top 88%", once: true },
          }),
      });

      return () => split.revert();
    },
    { scope: rootRef },
  );

  const copy = async () => {
    const ok = await copyText(INSTALL);
    setCopied(ok);
    if (ok && copyRef.current) {
      gsap.fromTo(
        copyRef.current,
        { scale: 0.94 },
        { scale: 1, duration: 0.5, ease: "back.out(3)" },
      );
    }
    if (ok) window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <>
      <section className="closing" id="start" ref={rootRef}>
        <div className="wrap">
          <h2 className="closing__title" ref={titleRef}>
            <span>{d.closing.line1}</span>
            <span>{d.closing.line2}</span>
          </h2>

          <div className="closing__cols">
            <div className="closing__cmd">
              <p className="mono dim">{d.closing.install}</p>
              <div className="cmdbox">
                <code>{INSTALL}</code>
                <button
                  className="cmdbox__copy"
                  ref={copyRef}
                  onClick={copy}
                  aria-label={d.common.copyLabel}
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                  {copied ? d.common.copied : d.common.copy}
                </button>
              </div>
              <p className="dim closing__note">
                {d.closing.noteBefore}
                <strong>{d.closing.noteStrong}</strong>
                {d.closing.noteAfter}
              </p>
            </div>

            <div className="closing__actions">
              <a
                className="btn btn--solid"
                href={REPO}
                target="_blank"
                rel="noreferrer"
              >
                <GitHubIcon />
                {d.closing.ctaPrimary}
              </a>
              <a className="btn btn--ghost" href="#pipeline">
                {d.closing.ctaSecondary}
                <ArrowRight />
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export function Footer({ page = "home" }: { page?: Page }) {
  const d = useDict();
  return (
    <footer className="wrap foot">
      <span>{d.footer.copyright}</span>
      <nav className="foot__links" aria-label={d.footer.navLabel}>
        {d.footer.links.map((link) => (
          <a href={homeHref(link.href, page)} key={link.href}>
            {link.label}
          </a>
        ))}
        <a href={REPO} target="_blank" rel="noreferrer">
          {d.footer.access}
        </a>
      </nav>
    </footer>
  );
}
