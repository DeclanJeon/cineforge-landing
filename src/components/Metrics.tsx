import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import { useDict } from "../i18n";
import { SectionHead } from "./SectionHead";

export function Metrics() {
  const d = useDict();
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const nums = gsap.utils.toArray<HTMLElement>("[data-count]", rootRef.current);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        nums.forEach((el) => {
          const end = Number(el.dataset.count);
          const state = { v: 0 };
          gsap.to(state, {
            v: end,
            duration: 1.5,
            ease: "power2.out",
            snap: { v: 1 },
            onUpdate: () => {
              el.textContent = String(Math.round(state.v));
            },
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section className="section--edge" id="library" ref={rootRef}>
      <div className="wrap">
        <SectionHead
          kicker={d.metrics.kicker}
          title={d.metrics.title}
          note={d.metrics.note}
        />
      </div>

      <div className="metrics">
        <div className="wrap metrics__grid">
          {d.metrics.items.map((metric) => (
            <div className="metric" key={metric.label}>
              <p className="metric__val">
                <span data-count={metric.value}>{metric.value}</span>
                <small>{metric.suffix}</small>
              </p>
              <p className="metric__label">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
