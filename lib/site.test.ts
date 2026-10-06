import { describe, expect, it } from "vitest";
import { hasHero } from "./site";

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
