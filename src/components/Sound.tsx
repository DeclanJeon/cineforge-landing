import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import { useDict } from "../i18n";
import { SectionHead } from "./SectionHead";

export function Sound() {
  const d = useDict();
  const rootRef = useRef<HTMLElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const table = tableRef.current;
      if (!table) return;

      const rows = gsap.utils.toArray<HTMLElement>(".sound__row:not(.sound__row--head)", table);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(rows, { opacity: 0, x: -18 });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: table, start: "top 80%", once: true },
        });
        tl.to(rows, {
          opacity: 1,
          x: 0,
          duration: 0.5,
          ease: "expo.out",
          stagger: 0.075,
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section className="sound" id="sound" ref={rootRef}>
      <div className="wrap">
        <SectionHead
          kicker={d.sound.kicker}
          title={d.sound.title}
          note={d.sound.note}
        />

        <div ref={tableRef}>
          <div className="sound__table">
            <div className="sound__row sound__row--head">
              {d.sound.columns.map((column) => (
                <span key={column}>{column}</span>
              ))}
            </div>
            {d.sound.layers.map((layer) => (
              <div className="sound__row" key={layer.what}>
                <span className="sound__when">{layer.when}</span>
                <span className="sound__what">{layer.what}</span>
                <span className="sound__who">{layer.who}</span>
                <span className="sound__rule">{layer.rule}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
