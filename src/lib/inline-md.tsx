import { Fragment } from "react";

import { tokenize } from "./inline-md-tokens";

/** Renders release-note text: `code`, **bold**, https links; nothing else. */
export function InlineMd({ text }: { text: string }) {
  return (
    <>
      {tokenize(text).map((token, i) => {
        switch (token.kind) {
          case "code":
            return <code key={i}>{token.text}</code>;
          case "bold":
            return <strong key={i}>{token.text}</strong>;
          case "link":
            return (
              <a key={i} href={token.href} target="_blank" rel="noopener noreferrer">
                {token.text}
              </a>
            );
          default:
            return <Fragment key={i}>{token.text}</Fragment>;
        }
      })}
    </>
  );
}
