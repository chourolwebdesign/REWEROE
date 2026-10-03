/**
 * Hero-only letter stagger (60 ms) — pure CSS so the headline paints before JavaScript arrives (LCP),
 * and prefers-reduced-motion disables it in globals.css. Screen readers get the plain text.
 */
export function CharReveal({ text, className, delay = 0.2 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  let i = 0;
  return (
    <span className={className} aria-label={text} role="text">
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {Array.from(word).map((ch) => {
            const idx = i++;
            return (
              <span key={idx} aria-hidden className="char-in inline-block" style={{ animationDelay: `${delay + idx * 0.06}s` }}>
                {ch}
              </span>
            );
          })}
          {wi < words.length - 1 && <span aria-hidden>&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}
