/**
 * Welche Videodatei automatisch laufen darf: auf Handys die kleine, bei aktivem Datensparmodus keine
 * (dann bleibt das Standbild). Nur im Browser aufrufen (Effekte, Event-Handler).
 */
export function autoplaySource(clip: { src: string; srcSmall: string }): string | null {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData || window.matchMedia("(prefers-reduced-data: reduce)").matches) return null;
  return window.matchMedia("(max-width: 40rem)").matches ? clip.srcSmall : clip.src;
}
