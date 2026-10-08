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
  it("hält Ordnungszahlen und Abkürzungen nicht für Satzenden", () => {
    const date = "Innenminister Roman Poseck besuchte den Markt in Rödelheim am 26. September 2026 und packte dort gemeinsam mit dem ganzen Team vom Markt seinen Notfallbeutel für zehn Tage, wie es das Bundesamt empfiehlt.";
    expect(metaDescription(date)).not.toMatch(/\d\.$/);
    expect(metaDescription(date).endsWith("…")).toBe(true);
    const abbr = "Am Aktionstag gab es ein buntes Programm für Kinder, z. B. Kinderschminken, eine Rallye durch den ganzen Markt und Bastelstationen mit Material aus dem Sortiment des Marktes, dazu Musik.";
    expect(metaDescription(abbr)).not.toMatch(/z\. B\.$/);
    expect(metaDescription(abbr).endsWith("…")).toBe(true);
    expect(metaDescription("Dr. Müller kam. Er brachte den Beutel mit und erklärte den Gästen im Markt sehr ausführlich, was in einen Vorrat für zehn Tage gehört und was nicht hineingehört, danke.")).not.toMatch(/^Dr\.$/);
  });
  it("kürzt sonst an einer Wortgrenze mit Auslassungszeichen", () => {
    const text = "Wort ".repeat(60).trim();
    const out = metaDescription(text);
    expect(out.length).toBeLessThanOrEqual(160);
    expect(out.endsWith("…")).toBe(true);
    expect(out).not.toMatch(/Wor…$/);
  });
});
