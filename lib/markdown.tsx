import { Fragment } from "react";
import { Link } from "@/i18n/navigation";

/** Tiny, dependency-free Markdown subset for editorial bodies: ##, ###, >, -, 1., **bold**, [link](href), paragraphs. */
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
        if (lines.every((l) => /^\d+\.\s/.test(l))) return <ol key={i} className="list-decimal">{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\d+\.\s/, ""))}</li>)}</ol>;
        return <p key={i}>{inline(lines.join(" "))}</p>;
      })}
    </div>
  );
}

/** Inline: **bold** and [label](href). Internal hrefs (leading "/") go through the locale-aware Link; external ones open in a new tab. */
function inline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g);
  return parts.map((p, i) => {
    if (p.startsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(p);
    if (link) {
      const [, label, href] = link;
      return href.startsWith("/") ? <Link key={i} href={href}>{label}</Link> : <a key={i} href={href} target="_blank" rel="noopener noreferrer">{label}</a>;
    }
    return <Fragment key={i}>{p}</Fragment>;
  });
}
