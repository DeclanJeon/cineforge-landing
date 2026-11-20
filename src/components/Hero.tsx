import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "../lib/gsap";
import { ArrowDown, ArrowRight } from "./Icons";
import { useDict } from "../i18n";
import { repoUrl, useRepoStats } from "../lib/stats";

export function Hero() {
  const d = useDict();
  const stats = useRepoStats();
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const title = titleRef.current;
      const strip = stripRef.current;
      if (!title || !strip) return;

      const split = SplitText.create(title, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 112,
            duration: 1.25,
            ease: "expo.out",
            stagger: 0.085,
            delay: 0.12,
          }),
      });

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from(".hero__light", { opacity: 0, scale: 0.86, duration: 2.1 }, 0)
        .from(".hero__cols > *", { opacity: 0, y: 18, duration: 0.9, stagger: 0.1 }, 0.55)
        .from(
          ".strip__cell",
          { opacity: 0, y: 14, duration: 0.6, stagger: 0.028 },
          0.5,
        );

      const cells = gsap.utils.toArray<HTMLElement>(".strip__cell", strip);
      const activate = (index: number) => {
        cells.forEach((cell, i) => {
          if (i === index) cell.dataset.active = "true";
          else delete cell.dataset.active;
        });
      };
      activate(0);

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const loop = gsap.timeline({ repeat: -1, delay: 1.9 });
        cells.forEach((_, i) => {
          loop.call(() => activate(i), undefined, i * 0.62);
        });

        const pause = () => loop.pause();
        const resume = () => loop.play();
        strip.addEventListener("mouseenter", pause);
        strip.addEventListener("mouseleave", resume);
        strip.addEventListener("focusin", pause);
        strip.addEventListener("focusout", resume);

        return () => {
          strip.removeEventListener("mouseenter", pause);
          strip.removeEventListener("mouseleave", resume);
          strip.removeEventListener("focusin", pause);
          strip.removeEventListener("focusout", resume);
          loop.kill();
        };
      });

      return () => {
        split.revert();
        mm.revert();
      };
    },
    { scope: rootRef },
  );

  return (
    <section className="hero" id="top" ref={rootRef}>
      <div className="hero__light" aria-hidden="true" />
      <p className="hero__edge" aria-hidden="true">
        CineForge · AI video orchestrator · v0.1.0
      </p>

      <div className="wrap hero__inner">
        <h1 className="hero__title" ref={titleRef}>
          <span className="line">{d.hero.line1}</span>
          <span className="line">{d.hero.line2}</span>
          <span className="line line--last">
            {d.hero.line3}
            <span className="accent">{d.hero.accent}</span>
          </span>
        </h1>

        <div className="hero__cols">
          <p className="lede">{d.hero.lede}</p>

          <div className="hero__aside">
            <p className="mono hero__facts">
              {d.hero.facts.map((fact) => (
                <span key={fact}>{fact}</span>
              ))}
              <span className="hero__stars">
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  title={d.hero.starsLabel}
                  aria-label={`${d.hero.starsLabel} — ${stats.stars}`}
                >
                  ★ {stats.stars}
                </a>
              </span>
            </p>
            <div className="hero__cta">
              <a className="btn btn--solid" href="#start">
                {d.hero.ctaPrimary}
                <ArrowRight />
              </a>
              <a className="btn btn--ghost" href="#pipeline">
                {d.hero.ctaSecondary}
                <ArrowDown />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="strip" ref={stripRef}>
        <span className="strip__hint" aria-hidden="true">
          swipe →
        </span>
        <div className="strip__perf" aria-hidden="true" />
        <div className="strip__rail" role="list" aria-label={d.hero.stripLabel}>
          {d.pipeline.stages.map((stage) => (
            <div
              className="strip__cell"
              key={stage.code}
              role="listitem"
              data-gate={stage.gate ? "true" : "false"}
            >
              <span className="strip__tick" aria-hidden="true" />
              <span className="strip__code">{stage.code}</span>
              <span className="strip__name">{stage.title}</span>
            </div>
          ))}
        </div>
        <div className="strip__perf" aria-hidden="true" />
      </div>
    </section>
  );
}
