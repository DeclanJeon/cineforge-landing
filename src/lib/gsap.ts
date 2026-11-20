import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/** Fonts change line breaks, so refresh trigger positions once they land. */
if (typeof document !== "undefined" && "fonts" in document) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
