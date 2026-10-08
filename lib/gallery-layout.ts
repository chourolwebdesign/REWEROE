/**
 * Breite der ersten Galeriekachel in Spalten: die übliche (erste Angabe), sonst die erste, mit der alle Zeilen voll werden – z. B.
 * sechs Fotos bei vier Spalten: die erste Kachel über drei Spalten (3 + 1, dann 4). Geht keine Breite auf, bleibt die übliche, und
 * die Galerie blendet die angefangene letzte Zeile aus.
 */
export function featuredSpan(n: number, cols: number, spans: readonly number[]): number {
  return spans.find((f) => (n - 1 + f) % cols === 0) ?? spans[0];
}
