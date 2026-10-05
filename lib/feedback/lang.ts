import { LANGS, type Lang } from "./rules";

/** „tr-TR,tr;q=0.9,de;q=0.5“ → ["tr-TR", "tr", "de"], nach q absteigend; q=0 fällt weg. */
export function parseAcceptLanguage(header: string | null): string[] {
  if (!header) return [];
  return header
    .split(",")
    .map((part, i) => {
      const [tag, ...params] = part.trim().split(";");
      const q = Number(params.find((p) => p.trim().startsWith("q="))?.split("=")[1] ?? 1);
      return { tag: tag.trim(), q: Number.isFinite(q) ? q : 0, i };
    })
    .filter((x) => x.tag && x.q > 0)
    .sort((a, b) => b.q - a.q || a.i - b.i)
    .map((x) => x.tag);
}

/** Erste unterstützte Sprache, sonst Deutsch. */
export function pickLang(preferred: readonly string[]): Lang {
  for (const p of preferred) {
    const code = p.trim().slice(0, 2).toLowerCase();
    if ((LANGS as readonly string[]).includes(code)) return code as Lang;
  }
  return "de";
}
