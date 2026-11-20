import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "../lib/gsap";
import { LANG_PATH, lang, useDict } from "../i18n";
import { Aperture, ArrowRight, GitHubIcon } from "./Icons";

const CONTACT = "https://github.com/DeclanJeon";

function timecode(progress: number) {
  const fps = 24;
  const frames = Math.round(progress * fps * 120);
  const f = frames % fps;
  const s = Math.floor(frames / fps) % 60;
  const m = Math.floor(frames / (fps * 60)) % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `00:${pad(m)}:${pad(s)}:${pad(f)}`;
}

export function Grain() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ repeat: -1 });
      tl.to(el, {
        xPercent: -4,
        yPercent: 3,
        duration: 0.4,
        ease: "steps(4)",
        repeatRefresh: true,
      })
        .to(el, {
          xPercent: 3,
          yPercent: -3,
          duration: 0.4,
          ease: "steps(4)",
          repeatRefresh: true,
        })
        .to(el, { xPercent: 0, yPercent: 0, duration: 0.4, ease: "steps(4)" });
      return () => tl.kill();
    });
    return () => mm.revert();
  });

  return <div className="grain" ref={ref} aria-hidden="true" />;
}

export function Chrome() {
  const d = useDict();
  const navRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLSpanElement>(null);
  const tcRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const nav = navRef.current;
    const line = lineRef.current;
    const code = codeRef.current;
    const tc = tcRef.current;

    const stuck = ScrollTrigger.create({
      start: "top -32",
      end: "max",
      onToggle: (self) => {
        if (nav) nav.dataset.stuck = String(self.isActive);
      },
    });

    const prog = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        if (line) line.style.transform = `scaleX(${self.progress})`;
        if (code) code.textContent = timecode(self.progress);
        if (tc) {
          const nearEnd = self.progress > 0.985;
          tc.dataset.visible = String(window.scrollY > 160 && !nearEnd);
        }
      },
    });

    return () => {
      stuck.kill();
      prog.kill();
    };
  });

  return (
    <>
      <div className="topbar" aria-hidden="true">
        <div className="topbar__line" ref={lineRef} />
      </div>

      <header className="nav" ref={navRef}>
        <div className="wrap nav__bar">
          <a className="brand" href="#top" aria-label="CineForge 홈">
            <Aperture />
            CineForge
            <span className="brand__sub">{d.nav.brandSub}</span>
          </a>

          <nav className="nav__links" aria-label="sections">
            {d.nav.links.map((link) => (
              <a href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="nav__right">
            <div className="lang" role="group" aria-label={d.common.langLabel}>
              {(Object.keys(LANG_PATH) as Array<keyof typeof LANG_PATH>).map(
                (code) => (
                  <a
                    key={code}
                    className="lang__opt"
                    href={LANG_PATH[code]}
                    aria-current={lang === code ? "true" : undefined}
                    hrefLang={code}
                  >
                    {code.toUpperCase()}
                  </a>
                ),
              )}
            </div>
            <a
              className="btn btn--ghost btn--sm nav__access"
              href={CONTACT}
              target="_blank"
              rel="noreferrer"
              aria-label={d.nav.accessLabel}
            >
              <GitHubIcon />
              {d.nav.access}
            </a>
            <a className="btn btn--solid btn--sm" href="#start">
              {d.nav.start}
              <ArrowRight />
            </a>
          </div>
        </div>
      </header>

      <div className="timecode" aria-hidden="true" ref={tcRef}>
        <span className="timecode__dot" />
        <span className="mono">TC</span>
        <span className="mono timecode__val" ref={codeRef}>
          00:00:00:00
        </span>
      </div>
    </>
  );
}
