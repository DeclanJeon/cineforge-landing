/**
 * Minimal inline markdown for release notes: `code`, **bold** and
 * [text](https://…) links. Everything else, including unclosed markers and
 * non-https links, stays literal text.
 */
export type Token =
  | { kind: "text"; text: string }
  | { kind: "code"; text: string }
  | { kind: "bold"; text: string }
  | { kind: "link"; text: string; href: string };

const PATTERN = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g;

export function tokenize(input: string): Token[] {
  const out: Token[] = [];
  const push = (text: string) => {
    if (!text) return;
    const last = out[out.length - 1];
    if (last?.kind === "text") last.text += text;
    else out.push({ kind: "text", text });
  };
  let cursor = 0;
  for (const match of input.matchAll(PATTERN)) {
    push(input.slice(cursor, match.index));
    if (match[1] !== undefined) out.push({ kind: "code", text: match[1] });
    else if (match[2] !== undefined) out.push({ kind: "bold", text: match[2] });
    else out.push({ kind: "link", text: match[3], href: match[4] });
    cursor = (match.index ?? 0) + match[0].length;
  }
  push(input.slice(cursor));
  return out;
}
