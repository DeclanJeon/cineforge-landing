import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "../lib/gsap";
import { useDict } from "../i18n";
import { SectionHead } from "./SectionHead";

type Line = { kind: "cmd" | "out" | "ok" | "gate" | "dim"; text: string };

export function Terminal() {
  const d = useDict();
  const transcript = d.terminal.lines as Line[];
  const rootRef = useRef<HTMLElement>(null);
  const winRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const win = winRef.current;
      if (!win) return;

      const lines = gsap.utils.toArray<HTMLElement>(".term__line", win);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: win, start: "top 72%", once: true },
        });

        gsap.set(lines, { opacity: 0 });
        let t = 0.15;

        lines.forEach((line) => {
          const cmdText = line.querySelector<HTMLElement>(".term__cmdtext");
          if (cmdText) {
            const split = SplitText.create(cmdText, { type: "chars" });
            tl.set(line, { opacity: 1 }, t);
            tl.from(
              split.chars,
              { opacity: 0, duration: 0.01, stagger: 0.016, ease: "none" },
              t,
            );
            t += Math.min(1.5, split.chars.length * 0.016 + 0.3);
          } else {
            tl.fromTo(
              line,
              { opacity: 0, y: 7 },
              { opacity: 1, y: 0, duration: 0.32, ease: "power2.out" },
              t,
            );
            t += 0.26;
          }
        });

        tl.set(".term__caret", { opacity: 1 }, t);
        return () => tl.kill();
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} id="terminal">
      <div className="wrap term">
        <div className="term__copy">
          <SectionHead
            kicker={d.terminal.kicker}
            title={d.terminal.title}
            note={d.terminal.note}
          />
          <a className="btn btn--ghost" href="#gate" style={{ justifySelf: "start" }}>
            {d.terminal.cta}
          </a>
        </div>

        <div className="term__window" ref={winRef}>
          <div className="term__bar">
            <span>{d.terminal.barTitle}</span>
            <span className="term__state">
              <i />
              {d.terminal.state}
            </span>
          </div>
          <div className="term__body">
            {transcript.map((line, i) => (
              <span className={`term__line term__line--${line.kind}`} key={i}>
                {line.kind === "cmd" ? (
                  <>
                    <span className="term__prompt">$ </span>
                    <span className="term__cmdtext">{line.text}</span>
                  </>
                ) : (
                  line.text
                )}
              </span>
            ))}
            <span className="term__caret" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
