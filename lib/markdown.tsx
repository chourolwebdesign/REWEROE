import { Fragment } from "react";

/** Tiny, dependency-free Markdown subset for editorial bodies: ##, >, -, **bold**, paragraphs. */
export function Markdown({ source, className }: { source: string; className?: string }) {
  const blocks = source.trim().split(/\n{2,}/);
  return (
    <div className={className}>
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (/^##\s/.test(b)) return <h2 key={i}>{inline(b.replace(/^##\s/, ""))}</h2>;
        if (/^###\s/.test(b)) return <h3 key={i}>{inline(b.replace(/^###\s/, ""))}</h3>;
        if (/^>\s?/.test(b)) return <blockquote key={i}>{inline(lines.map((l) => l.replace(/^>\s?/, "")).join(" "))}</blockquote>;
        if (lines.every((l) => /^-\s/.test(l))) return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^-\s/, ""))}</li>)}</ul>;
        return <p key={i}>{inline(lines.join(" "))}</p>;
      })}
    </div>
  );
}

function inline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => (p.startsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <Fragment key={i}>{p}</Fragment>));
}
