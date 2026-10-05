import { describe, expect, it } from "vitest";
import { checkFeedback, createLimiter, needsAlarm } from "./rules";

const ok = { rating: 2, aspects: ["kasse", "wartezeit"], comment: " Lange Schlange ", contact: " 0170 123456 ", lang: "tr" };

describe("checkFeedback", () => {
  it("bereinigt gültige Angaben; Bereiche in fester Reihenfolge", () => {
    expect(checkFeedback(ok)).toEqual({ rating: 2, aspects: ["wartezeit", "kasse"], comment: "Lange Schlange", contact: "0170 123456", lang: "tr" });
  });
  it("Kontakt nur bei 1–3 Sternen", () => {
    expect(checkFeedback({ ...ok, rating: 4 })?.contact).toBe("");
  });
  it("lehnt Unbekanntes ab", () => {
    expect(checkFeedback({ ...ok, rating: 0 })).toBeNull();
    expect(checkFeedback({ ...ok, rating: 2.5 })).toBeNull();
    expect(checkFeedback({ ...ok, lang: "fr" })).toBeNull();
    expect(checkFeedback({ ...ok, aspects: ["kasse", "parkplatz"] })).toBeNull();
  });
  it("Längen wie in der Datenbank: Zeichen, nicht UTF-16-Einheiten", () => {
    expect(checkFeedback({ ...ok, comment: "😀".repeat(500) })?.comment).toHaveLength(1000);
    expect(checkFeedback({ ...ok, comment: "x".repeat(501) })).toBeNull();
    expect(checkFeedback({ ...ok, contact: "x".repeat(121) })).toBeNull();
  });
  it("doppelte Bereiche zählen einmal", () => {
    expect(checkFeedback({ ...ok, aspects: ["kasse", "kasse"] })?.aspects).toEqual(["kasse"]);
  });
});

describe("createLimiter", () => {
  it("10 je Stunde und Adresse, danach erst nach Ablauf wieder", () => {
    const allow = createLimiter(10, 3_600_000);
    for (let i = 0; i < 10; i++) expect(allow("203.0.113.1", 1000 + i)).toBe(true);
    expect(allow("203.0.113.1", 2000)).toBe(false);
    expect(allow("203.0.113.2", 2000)).toBe(true);
    expect(allow("203.0.113.1", 1000 + 3_600_000)).toBe(true);
  });
});

describe("needsAlarm", () => {
  it("Mail an die Marktleitung bei 1–2 Sternen", () => {
    expect([1, 2, 3, 4, 5].map(needsAlarm)).toEqual([true, true, false, false, false]);
  });
});
