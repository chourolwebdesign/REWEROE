/**
 * `sizes` für ein Bild, das `object-cover` in eine Kachel schneidet: Ist das Bild breiter als die Kachel (Querformat in 4:5),
 * wird es auf die Kachelhöhe gezogen und braucht mehr Breite als die Kachel selbst. Alle Breitenangaben werden um diesen Faktor
 * vergrößert, die Medienbedingungen bleiben. Seitenverhältnisse als Breite / Höhe. Skaliert werden px, vw und rem; Rechenausdrücke
 * (calc, min, max) bleiben unverändert.
 */
export function coverSizes(sizes: string, imageAspect: number, tileAspect: number): string {
  const factor = Math.max(1, imageAspect / tileAspect);
  if (factor === 1) return sizes;
  return sizes
    .split(",")
    .map((entry) => {
      if (/\b(?:calc|min|max|clamp)\(/.test(entry)) return entry;
      const cut = entry.lastIndexOf(")") + 1;
      return entry.slice(0, cut) + entry.slice(cut).replace(/(\d+(?:\.\d+)?)(px|vw|rem)/g, (_, n: string, unit: string) => `${Math.round(Number(n) * factor)}${unit}`);
    })
    .join(",");
}
