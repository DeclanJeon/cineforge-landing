import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import { useDict } from "../i18n";
import { GateIcon } from "./Icons";

export function Pipeline() {
  const d = useDict();
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const countRef = useRef<HTMLElement>(null);
  const fadeLRef = useRef<HTMLSpanElement>(null);
  const fadeRRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const pin = pinRef.current;
      const viewport = viewportRef.current;
      const track = trackRef.current;
      const bar = barRef.current;
      const count = countRef.current;
      if (!pin || !viewport || !track) return;

      const cards = gsap.utils.toArray<HTMLElement>(".stage", track);
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
        () => {
          // the viewport is already inset by the rail padding, so the track
          // travels exactly its own overflow distance
          const distance = () =>
            Math.max(0, track.scrollWidth - viewport.clientWidth);

          const tween = gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: pin,
              start: "top top",
              end: () => `+=${distance() + window.innerHeight * 0.15}`,
              pin: true,
              scrub: 0.55,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                if (bar) bar.style.setProperty("--p", String(self.progress));
                if (fadeLRef.current) {
                  fadeLRef.current.style.opacity = self.progress > 0.02 ? "1" : "0";
                }
                if (fadeRRef.current) {
                  fadeRRef.current.style.opacity = self.progress < 0.98 ? "1" : "0";
                }
                const index = Math.min(
                  cards.length - 1,
                  Math.round(self.progress * (cards.length - 1)),
                );
                if (count) count.textContent = String(index + 1).padStart(2, "0");
                cards.forEach((card, i) => {
                  card.dataset.active = String(i <= index);
                });
              },
            },
          });

          return () => {
            tween.scrollTrigger?.kill();
            tween.kill();
            gsap.set(track, { x: 0 });
            cards.forEach((card) => delete card.dataset.active);
            if (fadeLRef.current) fadeLRef.current.style.opacity = "0";
            if (fadeRRef.current) fadeRRef.current.style.opacity = "0";
          };
        },
      );

      mm.add(
        "(max-width: 899px), (prefers-reduced-motion: reduce)",
        () => {
          if (bar) bar.style.setProperty("--p", "1");
          if (count) count.textContent = "15";
          gsap.set(cards, { opacity: 0, y: 16 });
          cards.forEach((card) => (card.dataset.active = "true"));
          const tl = gsap.timeline({
            scrollTrigger: { trigger: track, start: "top 80%", once: true },
          });
          cards.forEach((card, i) => {
            tl.to(
              card,
              { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
              i * 0.05,
            );
          });
        },
      );

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section className="pipe" id="pipeline" ref={sectionRef}>
      <div className="pipe__pin" ref={pinRef}>
        <div className="wrap pipe__head">
          <h2 className="pipe__title">{d.pipeline.title}</h2>
          <div className="pipe__readout" aria-hidden="true">
            <span>
              {d.common.stageUnit} <b ref={countRef}>01</b> / 15
            </span>
            <span className="pipe__bar">
              <i ref={barRef} />
            </span>
          </div>
        </div>

        <div className="pipe__rail">
          <div className="pipe__viewport" ref={viewportRef}>
            <div className="pipe__track" ref={trackRef}>
              {d.pipeline.stages.map((stage) => (
                <article
                  className="stage"
                  key={stage.code}
                  data-code={stage.code}
                  data-gate={stage.gate ? "true" : "false"}
                >
                  <div>
                    <div className="stage__top">
                      <span className="stage__code">{stage.code}</span>
                      <span className="stage__kind">
                        {stage.gate ? "gate" : "stage"}
                      </span>
                    </div>
                    <h3 className="stage__title">{stage.title}</h3>
                  </div>
                  <p className="stage__body">{stage.body}</p>
                  {stage.gate ? (
                    <span className="stage__gate">
                      <GateIcon />
                      {stage.gate}
                    </span>
                  ) : (
                    <span className="stage__gate" style={{ color: "var(--faint)" }}>
                      {d.pipeline.cardDone}
                    </span>
                  )}
                </article>
              ))}
            </div>
        </div>

          <span className="pipe__fade pipe__fade--l" ref={fadeLRef} aria-hidden="true" />
          <span className="pipe__fade pipe__fade--r" ref={fadeRRef} aria-hidden="true" />
        </div>

        <div className="wrap pipe__hint">
          <span>{d.pipeline.hint}</span>
          <span>{d.pipeline.summary}</span>
        </div>
      </div>
    </section>
  );
}
