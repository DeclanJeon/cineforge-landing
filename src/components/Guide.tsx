import { useDict } from "../i18n";
import { hasSkillUpdateCommand, releases } from "../data/releases";
import { CopyBlock } from "./CopyBlock";
import { SectionHead } from "./SectionHead";

/** Install command from the latest published wheel, or from source when none is attached. */
function installCommand() {
  const wheel = releases.cineforge[0]?.assets.find((a) => a.name.endsWith(".whl"));
  if (wheel) return `python -m pip install ${wheel.url}\ncineforge --version`;
  return "git clone https://github.com/DeclanJeon/cineforge && cd cineforge\npython -m pip install -e .\ncineforge --version";
}

export function Guide() {
  const d = useDict();
  const steps = hasSkillUpdateCommand ? d.guide.steps : d.guide.manualSteps;
  const commands = [installCommand(), ...steps.slice(1).map((s) => s.cmd)];
  return (
    <section className="guide" id="guide" aria-labelledby="guide-title">
      <div className="wrap">
        <SectionHead kicker={d.guide.kicker} title={d.guide.title} note={d.guide.note} id="guide-title" />
        <ol className="guide__steps">
          {steps.map((step, i) => (
            <li className="guide__step" key={step.name}>
              <h3 className="guide__name">
                <span className="mono guide__num">{i + 1}</span>
                {step.name}
              </h3>
              <p className="guide__desc">{step.desc}</p>
              <CopyBlock code={commands[i]} label={step.name} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
