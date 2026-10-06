/** „Seite 3 von 34“ bzw. „Seite 4–5 von 34“ für die gerade sichtbaren Seiten der Blätter-Leiste */
export function pageLabel(visible: readonly number[], total: number): string {
  const v = [...visible].sort((a, b) => a - b);
  if (!v.length) return `Seite 1 von ${total}`;
  const first = v[0];
  const last = v[v.length - 1];
  return first === last ? `Seite ${first} von ${total}` : `Seite ${first}–${last} von ${total}`;
}

/** Seiten, deren Bild geladen wird: die sichtbaren und `radius` Seiten davor und danach */
export function nearPages(visible: readonly number[], total: number, radius = 2): number[] {
  const out = new Set<number>();
  for (const p of visible) for (let q = p - radius; q <= p + radius; q++) if (q >= 1 && q <= total) out.add(q);
  return [...out].sort((a, b) => a - b);
}

/**
 * Seite, an deren Anfang die Leiste springt. Mit Doppelseiten (ab 1024 px) steht die Titelseite allein, danach beginnen
 * die Paare bei geraden Seiten – eine ungerade Seite > 1 liegt rechts in der Doppelseite davor.
 */
export function pagerTarget(page: number, total: number, spreads: boolean): number {
  const p = Math.min(Math.max(1, Math.round(page)), Math.max(1, total));
  return spreads && p > 1 && p % 2 === 1 ? p - 1 : p;
}
