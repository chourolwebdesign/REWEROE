import { describe, expect, it } from "vitest";
import { flyerWeek, isoWeek } from "./flyer";

describe("isoWeek", () => {
  it("zählt nach ISO 8601", () => {
    expect(isoWeek("2026-10-05")).toBe(41);
    expect(isoWeek("2026-12-28")).toBe(53);
    expect(isoWeek("2027-01-04")).toBe(1);
  });
});

describe("flyerWeek", () => {
  it("zeigt sonntags schon die neue Woche", () => {
    const w = flyerWeek(new Date("2026-10-04T10:00:00Z"));
    expect(w).toMatchObject({ kw: 41, from: "2026-10-05", to: "2026-10-10", startsLater: true });
    expect(w.range).toBe("Mo 05.10. – Sa 10.10.2026");
  });
  it("unter der Woche die laufende Woche", () => {
    expect(flyerWeek(new Date("2026-10-07T10:00:00Z"))).toMatchObject({ kw: 41, from: "2026-10-05", to: "2026-10-10", startsLater: false });
  });
  it("samstagabend noch die laufende Woche", () => {
    expect(flyerWeek(new Date("2026-10-10T20:30:00Z"))).toMatchObject({ kw: 41, to: "2026-10-10" });
  });
  it("beginnt nach einem Feiertags-Montag am Dienstag", () => {
    const w = flyerWeek(new Date("2027-03-28T10:00:00Z")); // Ostersonntag
    expect(w).toMatchObject({ kw: 13, from: "2027-03-30", to: "2027-04-03" });
    expect(w.range).toBe("Di 30.03. – Sa 03.04.2027");
  });
  it("über den Jahreswechsel", () => {
    expect(flyerWeek(new Date("2026-12-29T10:00:00Z"))).toMatchObject({ kw: 53, from: "2026-12-28", to: "2027-01-02" });
  });
});

describe("flyerWeek.note", () => {
  it("beschreibt die Gültigkeit", () => {
    expect(flyerWeek(new Date("2026-10-04T10:00:00Z")).note).toBe("gültig ab morgen");
    expect(flyerWeek(new Date("2026-10-07T10:00:00Z")).note).toBe("gültig bis Samstag");
    expect(flyerWeek(new Date("2027-03-29T10:00:00Z")).note).toBe("gültig ab morgen"); // Ostermontag → Dienstag
    expect(flyerWeek(new Date("2027-03-28T10:00:00Z")).note).toBe("gültig ab Dienstag"); // Ostersonntag
  });
});
