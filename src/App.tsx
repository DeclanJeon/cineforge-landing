import { useEffect } from "react";

import { Chrome, Grain } from "./components/Chrome";
import { Hero } from "./components/Hero";
import { Judgment } from "./components/Judgment";
import { Pipeline } from "./components/Pipeline";
import { Metrics } from "./components/Metrics";
import { Terminal } from "./components/Terminal";
import { Gate } from "./components/Gate";
import { Sound } from "./components/Sound";
import { Closing } from "./components/Closing";
import { ChangelogPreview } from "./components/ChangelogPreview";
import { Downloads } from "./components/Downloads";
import { Features } from "./components/Features";
import { Guide } from "./components/Guide";
import { Workflow } from "./components/Workflow";
import { useDict } from "./i18n";
import { ScrollTrigger } from "./lib/gsap";

/**
 * React mounts after the browser's own anchor jump, so deep links
 * (e.g. a shared /#pipeline URL) would otherwise land at the top.
 */
function useHashLanding() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const timer = window.setTimeout(() => {
      ScrollTrigger.refresh();
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    }, 260);
    return () => window.clearTimeout(timer);
  }, []);
}

export default function App() {
  const d = useDict();
  useHashLanding();

  return (
    <>
      <a className="skip" href="#judgment">
        {d.common.skip}
      </a>
      <Grain />
      <Chrome />
      <main>
        <Hero />
        <Judgment />
        <Pipeline />
        <Metrics />
        <Terminal />
        <Gate />
        <Sound />
        <Features />
        <Workflow />
        <Guide />
        <Downloads />
        <ChangelogPreview />
        <Closing />
      </main>
    </>
  );
}
