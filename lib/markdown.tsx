import { Fragment } from "react";
import Link from "next/link";

/** Tiny, dependency-free Markdown subset for editorial bodies: ##, ###, >, -, 1., **bold**, [link](href), paragraphs. */
export function Markdown({ source, className }: { source: string; className?: string }) {
  const blocks = source.trim().split(/\n{2,}/);
  return (
    <div className={className}>
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (/^##\s/.test(b)) return <h2 key={i}>{inline(b.replace(/^##\s/, ""))}</h2>;
        if (/^###\s/.test(b)) return <h3 key={i}>{inline(b.replace(/^###\s/, ""))}</h3>;
        if (/^>\s?/.test(b)) {
          const quoteLines = lines.map((l) => l.replace(/^>\s?/, ""));
          // Letzte Zeile „– Name, Funktion“ = Quellenangabe
          const cite = /^[–—]\s/.test(quoteLines.at(-1) ?? "") ? quoteLines.pop()!.replace(/^[–—]\s/, "") : null;
          return (
            <blockquote key={i}>
              <p>{inline(quoteLines.join(" "))}</p>
              {cite && <footer>– {inline(cite)}</footer>}
            </blockquote>
          );
        }
        if (lines.every((l) => /^-\s/.test(l))) return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^-\s/, ""))}</li>)}</ul>;
        if (lines.every((l) => /^\d+\.\s/.test(l))) return <ol key={i} className="list-decimal">{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\d+\.\s/, ""))}</li>)}</ol>;
        return <p key={i}>{inline(lines.join(" "))}</p>;
      })}
    </div>
  );
}

/** Inline: **bold** and [label](href). Interne Links (führendes "/") über next/link, externe öffnen in neuem Tab. */
function inline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g);
  return parts.map((p, i) => {
    if (p.startsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(p);
    if (link) {
      const [, label, href] = link;
      return href.startsWith("/") ? <Link key={i} href={href}>{label}</Link> : <a key={i} href={href} target="_blank" rel="noopener">{label}</a>;
    }
    return <Fragment key={i}>{p}</Fragment>;
  });
}
