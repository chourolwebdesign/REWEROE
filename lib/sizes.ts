/**
 * `sizes` für ein Bild, das `object-cover` in eine Kachel schneidet: Ist das Bild breiter als die Kachel (Querformat in 4:5),
 * wird es auf die Kachelhöhe gezogen und braucht mehr Breite als die Kachel selbst. Alle Breitenangaben werden um diesen Faktor
 * vergrößert, die Medienbedingungen bleiben. Seitenverhältnisse als Breite / Höhe.
 */
export function coverSizes(sizes: string, imageAspect: number, tileAspect: number): string {
  const factor = Math.max(1, imageAspect / tileAspect);
  if (factor === 1) return sizes;
  return sizes
    .split(",")
    .map((entry) => {
      const cut = entry.lastIndexOf(")") + 1;
      const value = entry.slice(cut).replace(/(\d+(?:\.\d+)?)(px|vw)/g, (_, n: string, unit: string) => `${Math.round(Number(n) * factor)}${unit}`);
      return entry.slice(0, cut) + value;
    })
    .join(",");
}
