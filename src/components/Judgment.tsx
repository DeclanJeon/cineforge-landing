import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import { useDict } from "../i18n";
import { SectionHead } from "./SectionHead";

export function Judgment() {
  const d = useDict();
  const rootRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const grid = gridRef.current;
      const sweep = sweepRef.current;
      if (!grid || !sweep) return;

      const items = gsap.utils.toArray<HTMLElement>(".judge__item", grid);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(items, { opacity: 0.28 });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: grid, start: "top 78%", once: true },
        });

        tl.fromTo(
          sweep,
          { y: 0, opacity: 0.9 },
          { y: () => grid.offsetHeight, duration: 1.5, ease: "none" },
          0,
        );

        items.forEach((item, i) => {
          const at = 0.06 + i * 0.15;
          tl.to(item, { opacity: 1, duration: 0.28, ease: "power1.out" }, at);
          tl.call(() => (item.dataset.detected = "true"), undefined, at + 0.02);
        });

        tl.to(sweep, { opacity: 0, duration: 0.3 }, 1.5);
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        items.forEach((item) => (item.dataset.detected = "true"));
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section className="section--edge" id="judgment" ref={rootRef}>
      <div className="wrap">
        <SectionHead
          kicker={d.judgment.kicker}
          title={d.judgment.title}
          note={d.judgment.note}
        />

        <div className="judge__wrap">
          <span className="judge__sweep" ref={sweepRef} aria-hidden="true" />
          <div className="judge__grid" ref={gridRef}>
            {d.judgment.items.map((item) => (
              <article className="judge__item" key={item.name}>
                <span className="judge__mark" aria-hidden="true" />
                <h3 className="judge__name">{item.name}</h3>
                <p className="judge__hint">{item.hint}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="judge__foot">
          <span>
            <b className="mono">?</b> {d.judgment.footHint} ·{" "}
            <b className="mono">!</b> {d.judgment.footDelegate}
          </span>
          <span>
            <b className="mono">--non-interactive</b> {d.judgment.footFlag}
          </span>
        </div>
      </div>
    </section>
  );
}
