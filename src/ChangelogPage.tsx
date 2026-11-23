import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { Chrome, Grain } from "./components/Chrome";
import { Footer } from "./components/Closing";
import { ReleaseCard } from "./components/ReleaseCard";
import { SectionHead } from "./components/SectionHead";
import { releases } from "./data/releases";
import { lang, useDict } from "./i18n";

type Product = "cineforge" | "skills";
const PRODUCTS: Product[] = ["cineforge", "skills"];

function productFromHash(): Product {
  const hash = decodeURIComponent(window.location.hash.slice(1));
  return hash.startsWith("skills") ? "skills" : "cineforge";
}

export default function ChangelogPage() {
  const d = useDict();
  const [active, setActive] = useState<Product>(productFromHash);
  const tabRefs = useRef<Record<Product, HTMLButtonElement | null>>({ cineforge: null, skills: null });

  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const timer = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start" }), 120);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onHash = () => setActive(productFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next = PRODUCTS[(PRODUCTS.indexOf(active) + 1) % PRODUCTS.length];
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <>
      <a className="skip" href="#releases">
        {d.common.skip}
      </a>
      <Grain />
      <Chrome page="changelog" />
      <main className="clpage" id="top">
        <section className="section" id="releases">
          <div className="wrap">
            <SectionHead kicker={d.changelog.kicker} title={d.changelog.title} note={d.changelog.note} />

            <div className="cltabs" role="tablist" aria-label={d.changelog.tablistLabel} onKeyDown={onKey}>
              {PRODUCTS.map((product) => (
                <button
                  key={product}
                  ref={(el) => {
                    tabRefs.current[product] = el;
                  }}
                  role="tab"
                  id={`tab-${product}`}
                  aria-selected={active === product}
                  aria-controls={`panel-${product}`}
                  tabIndex={active === product ? 0 : -1}
                  className="cltabs__tab"
                  onClick={() => setActive(product)}
                >
                  {d.changelog.tabs[product]}
                  <span className="mono dim"> {releases[product].length}</span>
                </button>
              ))}
            </div>

            {PRODUCTS.map((product) => (
              <div
                key={product}
                role="tabpanel"
                id={`panel-${product}`}
                aria-labelledby={`tab-${product}`}
                hidden={active !== product}
                className="clpanel"
              >
                {releases[product].length === 0 ? (
                  <p className="dim">{d.changelog.empty}</p>
                ) : (
                  releases[product].map((release) => (
                    <ReleaseCard key={release.version} release={release} lang={lang} />
                  ))
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer page="changelog" />
    </>
  );
}
