import { describe, expect, it } from "vitest";
import { buildCalendar, escapeText, foldLine } from "./ics";
import { marketEvents } from "./market-calendar";

describe("ICS-Grundlagen", () => {
  it("maskiert Sonderzeichen", () => {
    expect(escapeText("Mo, Di; a\\b\nneu")).toBe("Mo\\, Di\\; a\\\\b\\nneu");
  });
  it("faltet Zeilen nach 75 Bytes, ohne UTF-8-Zeichen zu zerschneiden", () => {
    const line = "SUMMARY:" + "Öffnungszeiten ".repeat(10);
    const folded = foldLine(line);
    const parts = folded.split("\r\n");
    expect(parts.length).toBeGreaterThan(1);
    for (const p of parts) expect(new TextEncoder().encode(p).length).toBeLessThanOrEqual(75);
    expect(parts.slice(1).every((p) => p.startsWith(" "))).toBe(true);
    expect(parts.map((p, i) => (i ? p.slice(1) : p)).join("")).toBe(line);
  });
  it("baut einen gültigen Kalender mit Ganztagsterminen", () => {
    const ics = buildCalendar({
      name: "Test",
      description: "Beschreibung",
      now: new Date("2026-10-04T10:00:00Z"),
      events: [{ uid: "a@test", date: "2026-10-05", summary: "Neuer Prospekt", description: "Gültig Mo–Sa", url: "https://example.org/x?a=1&b=2" }],
    });
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("DTSTART;VALUE=DATE:20261005");
    expect(ics).toContain("DTEND;VALUE=DATE:20261006");
    expect(ics).toContain("DTSTAMP:20261004T100000Z");
    expect(ics).toContain("TRANSP:TRANSPARENT");
    expect(ics.match(/BEGIN:VEVENT/g)?.length).toBe(1);
  });
});

describe("Markt-Kalender", () => {
  it("enthält jede Prospektwoche – nach Feiertags-Montag ab Dienstag", () => {
    const events = marketEvents(new Date("2027-03-20T10:00:00Z"), { weeks: 4, days: 30 });
    const flyers = events.filter((e) => e.uid.startsWith("prospekt-"));
    expect(flyers.map((e) => e.date)).toEqual(["2027-03-15", "2027-03-22", "2027-03-30", "2027-04-05"]);
    expect(flyers[2].summary).toContain("KW 13");
  });
  it("enthält Feiertage und gesetzliche Schlusszeiten", () => {
    const events = marketEvents(new Date("2026-12-01T10:00:00Z"), { weeks: 1, days: 40 });
    const special = events.filter((e) => e.uid.startsWith("tag-"));
    expect(special.map((e) => e.date)).toEqual(["2026-12-24", "2026-12-25", "2026-12-26", "2026-12-31", "2027-01-01"]);
    expect(special[0].summary).toBe("REWE Rödelheim: Heiligabend – voraussichtlich bis 14 Uhr");
    expect(special[1].summary).toBe("REWE Rödelheim geschlossen – 1. Weihnachtsfeiertag");
  });
});
