import type { ReactNode } from "react";

/**
 * Sichtbare Lücke für Pflichtangaben, die der Betreiber noch liefern muss (docs/BETREIBER-CHECKLISTE.md).
 * Absichtlich auffällig: Die Seite darf so nicht live gehen.
 */
export function Missing({ children }: { children: ReactNode }) {
  return <mark className="rounded-md bg-yellow/70 px-1.5 py-0.5 font-semibold text-ink">[wird ergänzt: {children}]</mark>;
}

export function DraftNotice() {
  return (
    <p role="note" className="mx-auto mb-10 max-w-[68ch] rounded-2xl bg-yellow/30 p-5 text-[0.9375rem] text-ink ring-1 ring-yellow">
      <strong>Entwurf:</strong> Einige Pflichtangaben fehlen noch und werden vor der Veröffentlichung ergänzt.
    </p>
  );
}
