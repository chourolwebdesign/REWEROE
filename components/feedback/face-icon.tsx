/** Gesicht der Bewertung 1–5 (aus der QR-Vorlage) – sprachunabhängig, Farbe über currentColor. */
const MOUTH = ["M30,68 Q50,50 70,68", "M31,66 Q50,56 69,66", "M32,63 L68,63", "M31,60 Q50,71 69,60", "M30,57 Q50,77 70,57"];

/**
 * Rot bis Grün wie in der Vorlage, aber dunkler: jede Farbe hat auf Weiß und auf dem hellen Seitengrund mindestens 3:1
 * (WCAG 1.4.11) – die Farben der Vorlage lagen bei 1,8–2,1:1.
 */
export const FACE_COLORS = ["#DC2626", "#EA580C", "#A16207", "#4D7C0F", "#15803D"] as const;

export function FaceIcon({ n, className }: { n: number; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" aria-hidden="true" focusable="false" className={className}>
      <circle cx="50" cy="50" r="43" />
      <circle cx="36" cy="41" r="2.6" fill="currentColor" stroke="none" />
      <circle cx="64" cy="41" r="2.6" fill="currentColor" stroke="none" />
      <path d={MOUTH[n - 1]} />
    </svg>
  );
}
