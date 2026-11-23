import { useDict } from "../i18n";
import { SectionHead } from "./SectionHead";

export function Features() {
  const d = useDict();
  return (
    <section className="feat" id="features" aria-labelledby="features-title">
      <div className="wrap">
        <SectionHead kicker={d.features.kicker} title={d.features.title} note={d.features.note} id="features-title" />

        <h3 className="feat__sub mono">{d.features.cliTitle}</h3>
        <ul className="feat__grid">
          {d.features.cli.map((item) => (
            <li className="feat__card" key={item.name}>
              <code className="feat__cmd">{item.cmd}</code>
              <h4 className="feat__name">{item.name}</h4>
              <p className="feat__desc">{item.desc}</p>
            </li>
          ))}
        </ul>

        <h3 className="feat__sub mono">{d.features.packTitle}</h3>
        <ul className="feat__grid">
          {d.features.groups.map((group) => (
            <li className="feat__card" key={group.name}>
              <h4 className="feat__name">{group.name}</h4>
              <p className="feat__desc">{group.desc}</p>
              <p className="feat__skills mono">{group.skills.join(" · ")}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
