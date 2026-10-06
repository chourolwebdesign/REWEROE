/** Eine Videofassung mit MIME-Typ und Codec, z. B. `video/mp4; codecs="av01.0.08M.08"` */
export interface VideoSource {
  src: string;
  type: string;
}

/** Erste Fassung, die der Browser abspielen kann (Reihenfolge = Vorzug), sonst null */
export function pickSource(sources: readonly VideoSource[], canPlay: (type: string) => string): string | null {
  return sources.find((s) => canPlay(s.type) !== "")?.src ?? null;
}

/**
 * Welche Videodatei automatisch laufen darf: die erste, die der Browser abspielen kann (AV1, HEVC, H.264) – bei aktivem
 * Datensparmodus keine (dann bleibt das Standbild). Nur im Browser aufrufen (Effekte, Event-Handler).
 */
export function autoplaySource(sources: readonly VideoSource[]): string | null {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData || window.matchMedia("(prefers-reduced-data: reduce)").matches) return null;
  const probe = document.createElement("video");
  return pickSource(sources, (type) => probe.canPlayType(type));
}
