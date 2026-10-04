import { describe, expect, it } from "vitest";
import { checkFile, formatApplicationText, isLikelyBot, parseApplication } from "./application";

const NOW = new Date("2026-10-05T10:00:00Z"); // Mo 12:00 Berlin

function form(over: Record<string, string | string[]> = {}) {
  const base: Record<string, string | string[]> = {
    bereich: ["kasse"],
    art: "teilzeit",
    start: "sofort",
    startDatum: "",
    verfuegbarkeit: ["mo-vm", "sa-nm"],
    vorname: " Lena ",
    nachname: "Schmidt",
    telefon: "0151 2345678",
    email: "",
    nachricht: "",
    datenschutz: "on",
  };
  const fd = new FormData();
  for (const [k, v] of Object.entries({ ...base, ...over })) {
    for (const x of Array.isArray(v) ? v : [v]) fd.append(k, x);
  }
  return fd;
}

describe("parseApplication", () => {
  it("akzeptiert eine gültige Kurzbewerbung", () => {
    const r = parseApplication(form(), NOW);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data).toMatchObject({ vorname: "Lena", nachname: "Schmidt", art: "teilzeit", bereich: ["kasse"], start: "sofort", telefon: "0151 2345678", email: null, talentpool: false });
    expect(r.data.verfuegbarkeit).toEqual(["mo-vm", "sa-nm"]);
  });

  it("verlangt Bereich, Art, Namen und Datenschutzhinweis", () => {
    const r = parseApplication(form({ bereich: [], art: "", vorname: "", nachname: " ", datenschutz: "" }), NOW);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(Object.keys(r.errors).sort()).toEqual(["art", "bereich", "datenschutz", "nachname", "vorname"]);
  });

  it("braucht Telefon oder E-Mail", () => {
    const r = parseApplication(form({ telefon: "", email: "" }), NOW);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.telefon).toMatch(/Telefonnummer oder E-Mail/);
    expect(parseApplication(form({ telefon: "", email: "lena@example.de" }), NOW).ok).toBe(true);
  });

  it("prüft Telefon- und E-Mail-Format", () => {
    const r = parseApplication(form({ telefon: "abc", email: "lena@" }), NOW);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.telefon).toBeDefined();
    expect(r.errors.email).toBeDefined();
  });

  it("ignoriert unbekannte Auswahlwerte", () => {
    const r = parseApplication(form({ bereich: ["kasse", "chef"], verfuegbarkeit: ["mo-vm", "so-vm", "x"] }), NOW);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.bereich).toEqual(["kasse"]);
    expect(r.data.verfuegbarkeit).toEqual(["mo-vm"]);
  });

  it("prüft das Startdatum", () => {
    expect(parseApplication(form({ start: "datum", startDatum: "2026-11-01" }), NOW).ok).toBe(true);
    const past = parseApplication(form({ start: "datum", startDatum: "2026-10-01" }), NOW);
    expect(past.ok).toBe(false);
    const missing = parseApplication(form({ start: "datum", startDatum: "" }), NOW);
    expect(missing.ok).toBe(false);
  });

  it("begrenzt die Nachricht", () => {
    expect(parseApplication(form({ nachricht: "x".repeat(1501) }), NOW).ok).toBe(false);
  });

  it("übernimmt die Talentpool-Einwilligung", () => {
    const r = parseApplication(form({ talentpool: "on" }), NOW);
    expect(r.ok && r.data.talentpool).toBe(true);
  });
});

describe("isLikelyBot", () => {
  it("erkennt Honeypot und zu schnelles Absenden", () => {
    expect(isLikelyBot({ honeypot: "http://spam", startedAt: NOW.getTime() - 60_000 }, NOW)).toBe(true);
    expect(isLikelyBot({ honeypot: "", startedAt: NOW.getTime() - 1_000 }, NOW)).toBe(true);
    expect(isLikelyBot({ honeypot: "", startedAt: NaN }, NOW)).toBe(true);
    expect(isLikelyBot({ honeypot: "", startedAt: NOW.getTime() - 30_000 }, NOW)).toBe(false);
  });
});

describe("checkFile", () => {
  const pdf = new TextEncoder().encode("%PDF-1.7 …");
  const jpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  it("erlaubt PDF, JPG und PNG anhand des Inhalts", () => {
    expect(checkFile("lebenslauf.pdf", pdf)).toEqual({ ok: true, type: "application/pdf" });
    expect(checkFile("foto.jpg", jpg)).toEqual({ ok: true, type: "image/jpeg" });
    expect(checkFile("scan.png", png)).toEqual({ ok: true, type: "image/png" });
  });
  it("lehnt andere Inhalte ab – auch mit passender Endung", () => {
    expect(checkFile("virus.pdf", new TextEncoder().encode("MZ\x90\x00")).ok).toBe(false);
    expect(checkFile("doc.docx", pdf).ok).toBe(true); // Inhalt zählt, Endung nicht
  });
});

describe("formatApplicationText", () => {
  it("fasst alles lesbar zusammen", () => {
    const r = parseApplication(form({ email: "lena@example.de", nachricht: "Ich wohne um die Ecke.", talentpool: "on" }), NOW);
    if (!r.ok) throw new Error("ungültig");
    const text = formatApplicationText(r.data, [{ name: "lebenslauf.pdf", size: 230_000 }], NOW);
    expect(text).toContain("Name: Lena Schmidt");
    expect(text).toContain("Bereich: Kasse & Service");
    expect(text).toContain("Beschäftigung: Teilzeit");
    expect(text).toContain("Start: so schnell wie möglich");
    expect(text).toContain("Verfügbarkeit: Mo vormittags, Sa nachmittags & abends");
    expect(text).toContain("Ich wohne um die Ecke.");
    expect(text).toContain("Talentpool (12 Monate aufbewahren): ja");
    expect(text).toContain("lebenslauf.pdf (225 KB)");
    expect(text).toContain("05.10.2026, 12:00 Uhr");
  });
});
