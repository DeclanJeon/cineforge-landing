import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "../lib/gsap";
import { useDict } from "../i18n";
import { CheckIcon } from "./Icons";

export function Gate() {
  const d = useDict();
  const rootRef = useRef<HTMLElement>(null);
  const statementRef = useRef<HTMLHeadingElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const statement = statementRef.current;
      const flow = flowRef.current;
      const type = typeRef.current;
      if (!statement || !flow || !type) return;

      const split = SplitText.create(statement, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.09,
            scrollTrigger: { trigger: statement, start: "top 82%", once: true },
          }),
      });

      const typed = type.querySelector<HTMLElement>(".gate__typing");
      const steps = gsap.utils.toArray<HTMLElement>(".gate__step", flow);
      const checks = gsap.utils.toArray<HTMLElement>(".gate__checks li", flow);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: flow, start: "top 74%", once: true },
        });

        gsap.set(checks, { opacity: 0 });

        steps.forEach((step, i) => {
          tl.fromTo(
            step,
            { opacity: 0, y: 14 },
            {
              opacity: 1,
              y: 0,
              duration: 0.55,
              ease: "power2.out",
              clearProps: "opacity,transform",
            },
            i * 0.09,
          );
        });

        if (typed) {
          const chars = SplitText.create(typed, { type: "chars" });
          tl.fromTo(
            chars.chars,
            { opacity: 0 },
            { opacity: 1, duration: 0.01, stagger: 0.09, ease: "none" },
            0.5,
          );
          tl.call(
            () => {
              type.dataset.state = "approved";
              const last = steps[steps.length - 1];
              if (last) last.dataset.locked = "false";
            },
            undefined,
            0.5 + chars.chars.length * 0.09 + 0.1,
          );
        }

        tl.to(checks, { opacity: 1, duration: 0.3, stagger: 0.08 }, ">-0.1");
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        type.dataset.state = "approved";
        if (steps[steps.length - 1]) steps[steps.length - 1].dataset.locked = "false";
      });

      return () => {
        split.revert();
        mm.revert();
      };
    },
    { scope: rootRef },
  );

  return (
    <section className="gate" id="gate" ref={rootRef}>
      <div className="wrap">
        <p className="sechead__kicker mono">{d.gate.kicker}</p>
        <h2 className="gate__statement" ref={statementRef}>
          {d.gate.statement.before}
          <em>{d.gate.statement.em}</em>
          {d.gate.statement.after}
        </h2>

        <div className="gate__flow" ref={flowRef}>
          {d.gate.steps.map((step, i) => (
            <div
              className="gate__step"
              key={step.label}
              {...(i === 2 ? { "data-locked": "true" } : {})}
            >
              <span className="gate__label">{step.label}</span>
              <span className="gate__val">{step.value}</span>
              <p className="gate__note">{step.note}</p>
            </div>
          ))}
        </div>

        <div className="gate__type" ref={typeRef} data-state="idle">
          <span className="gate__input mono">
            <span className="gate__typing">{d.gate.typing}</span>
            <span className="gate__caret" aria-hidden="true" />
          </span>
          <ul className="gate__checks">
            {d.gate.checks.map((check) => (
              <li key={check.label}>
                {check.label} <b>{check.value}</b>
              </li>
            ))}
          </ul>
        </div>

        <p className="gate__footnote">
          <CheckIcon />
          {d.gate.footnote.before}
          <span className="mono">{d.gate.footnote.mono}</span>
          {d.gate.footnote.after}
        </p>
      </div>
    </section>
  );
}
