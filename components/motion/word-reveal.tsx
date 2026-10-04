/**
 * Hero-only word stagger (50 ms/word) — pure CSS (`.word-mask` > `.word-in` in globals.css), so the headline
 * paints before JavaScript arrives (LCP-safe) and prefers-reduced-motion disables it. Each word rises out of its
 * own overflow mask (translateY 110 % → 0, 650 ms); no blur, no opacity. Screen readers get the plain text.
 */
export function WordReveal({ text, className, delay = 0.1 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text} role="text">
      {words.map((w, i) => (
        <span key={i} className="word-mask" aria-hidden>
          <span className="word-in" style={{ animationDelay: `${delay + i * 0.05}s` }}>{w}</span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
