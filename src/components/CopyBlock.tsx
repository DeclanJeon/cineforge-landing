import { useState } from "react";

import { useDict } from "../i18n";
import { copyText } from "../lib/clipboard";
import { CheckIcon, CopyIcon } from "./Icons";

/** A command block with a copy button; the status is announced politely. */
export function CopyBlock({ code, label }: { code: string; label: string }) {
  const d = useDict();
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  const copy = async () => {
    const ok = await copyText(code);
    setState(ok ? "copied" : "failed");
    window.setTimeout(() => setState("idle"), 2200);
  };

  return (
    <div className="cmdbox copyblock">
      <pre aria-label={label} role="region" tabIndex={0}>
        <code>{code}</code>
      </pre>
      <button className="cmdbox__copy" onClick={copy} aria-label={`${d.common.copyLabel}: ${label}`}>
        {state === "copied" ? <CheckIcon /> : <CopyIcon />}
        {state === "copied" ? d.common.copied : d.common.copy}
      </button>
      <span className="sr-only" aria-live="polite">
        {state === "copied" ? d.common.copied : state === "failed" ? d.guide.copyFailed : ""}
      </span>
    </div>
  );
}
