import { useDict } from "../i18n";
import { SectionHead } from "./SectionHead";

export function Workflow() {
  const d = useDict();
  return (
    <section className="flow" id="workflow" aria-labelledby="workflow-title">
      <div className="wrap">
        <SectionHead kicker={d.workflow.kicker} title={d.workflow.title} note={d.workflow.note} id="workflow-title" />
        <ol className="flow__steps">
          {d.workflow.steps.map((step, i) => (
            <li className="flow__step" key={step.name}>
              <span className="flow__num mono">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="flow__name">
                  {step.name}
                  {step.human ? <span className="flow__human mono">{d.workflow.human}</span> : null}
                </h3>
                <p className="flow__desc">{step.desc}</p>
                <code className="flow__cmd">{step.cmd}</code>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
