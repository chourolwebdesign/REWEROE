import { describe, expect, it } from "vitest";
import { hasHero, metaDescription } from "./site";

describe("hasHero", () => {
  it("rote Köpfe: Startseite, Angebote, Markt, Kontakt, Karriere, Aktuelles und Beiträge", () => {
    for (const p of ["/", "/angebote", "/markt", "/kontakt", "/karriere", "/aktuelles", "/aktuelles/resilienzwoche-2026"]) expect(hasHero(p)).toBe(true);
  });
  it("Startseite auch unter /index – so meldet usePathname() sie beim Vorrendern auf Vercel (sonst Hydrierungsfehler #418)", () => {
    expect(hasHero("/index")).toBe(true);
  });
  it("schlichte Seiten bleiben weiß", () => {
    for (const p of ["/impressum", "/datenschutz", "/karriere/bewerben", "/feedback", "/aushang", "/cockpit", "/gibts-nicht", "/aktuelles/a/b"]) expect(hasHero(p)).toBe(false);
  });
});

describe("metaDescription", () => {
  it("lässt kurze Texte unverändert", () => {
    expect(metaDescription("Kurz und gut.")).toBe("Kurz und gut.");
  });
  it("kürzt an einer Satzgrenze, wenn der Text länger als 160 Zeichen ist", () => {
    const text = "Innenminister Roman Poseck war bei uns im Markt und hat seinen Notfallbeutel gepackt. Gemeinsam mit Land Hessen, Handelsverband und Feuerwehr haben wir gezeigt, wie ein Vorrat für zehn Tage aussieht.";
    expect(metaDescription(text)).toBe("Innenminister Roman Poseck war bei uns im Markt und hat seinen Notfallbeutel gepackt.");
  });
  it("kürzt sonst an einer Wortgrenze mit Auslassungszeichen", () => {
    const text = "Wort ".repeat(60).trim();
    const out = metaDescription(text);
    expect(out.length).toBeLessThanOrEqual(160);
    expect(out.endsWith("…")).toBe(true);
    expect(out).not.toMatch(/Wor…$/);
  });
});
