import { describe, expect, it } from "vitest";
import { dayPlan, easterSunday, formatTime, hessenHolidays, openStatus, specialDayHours, upcomingSpecialDays } from "./hours";
import type { HoursConfig } from "./types";

const cfg: HoursConfig = {
  regular: { 0: null, 1: ["07:00", "22:00"], 2: ["07:00", "22:00"], 3: ["07:00", "22:00"], 4: ["07:00", "22:00"], 5: ["07:00", "22:00"], 6: ["07:00", "22:00"] },
  specialDays: [],
};

/** Berliner Wandzeit → Date. Oktober 2026 bis 24.10. = MESZ (UTC+2), danach MEZ (UTC+1). */
const at = (iso: string) => new Date(iso);

describe("formatTime", () => {
  it("lässt volle Stunden ohne Minuten", () => {
    expect(formatTime("07:00")).toBe("7 Uhr");
    expect(formatTime("22:00")).toBe("22 Uhr");
    expect(formatTime("07:30")).toBe("7:30 Uhr");
  });
});

describe("Feiertage Hessen", () => {
  it("berechnet Ostern", () => {
    expect(easterSunday(2026)).toBe("2026-04-05");
    expect(easterSunday(2027)).toBe("2027-03-28");
  });
  it("enthält die beweglichen und festen Feiertage", () => {
    const h = hessenHolidays(2027);
    expect(h.get("2027-03-26")).toBe("Karfreitag");
    expect(h.get("2027-03-29")).toBe("Ostermontag");
    expect(h.get("2027-05-06")).toBe("Christi Himmelfahrt");
    expect(h.get("2027-05-17")).toBe("Pfingstmontag");
    expect(h.get("2027-05-27")).toBe("Fronleichnam");
    expect(h.get("2027-10-03")).toBe("Tag der Deutschen Einheit");
    expect(h.has("2027-11-01")).toBe(false); // Allerheiligen ist in Hessen kein Feiertag
  });
});

describe("dayPlan", () => {
  it("schließt an Feiertagen", () => {
    expect(dayPlan("2026-10-03", cfg)).toMatchObject({ hours: null, label: "Tag der Deutschen Einheit" });
  });
  it("begrenzt Heiligabend und Silvester auf 14 Uhr (vorläufig)", () => {
    expect(dayPlan("2026-12-24", cfg)).toMatchObject({ hours: ["07:00", "14:00"], label: "Heiligabend", provisional: true });
    expect(dayPlan("2026-12-31", cfg)).toMatchObject({ hours: ["07:00", "14:00"], label: "Silvester", provisional: true });
  });
  it("begrenzt Gründonnerstag auf 20 Uhr", () => {
    expect(dayPlan("2027-03-25", cfg)).toMatchObject({ hours: ["07:00", "20:00"], label: "Gründonnerstag", provisional: true });
  });
  it("bestätigte Sonderzeiten haben Vorrang", () => {
    const withSpecial: HoursConfig = { ...cfg, specialDays: [{ date: "2026-12-24", label: "Heiligabend", hours: ["07:00", "13:00"] }] };
    expect(dayPlan("2026-12-24", withSpecial)).toMatchObject({ hours: ["07:00", "13:00"], provisional: false });
  });
});

describe("openStatus", () => {
  it("geöffnet am Werktag", () => {
    const s = openStatus(at("2026-10-05T08:00:00Z"), cfg); // Mo 10:00
    expect(s.open).toBe(true);
    expect(s.text).toBe("Jetzt geöffnet · bis 22 Uhr");
  });
  it("kurz vor Ladenschluss", () => {
    const s = openStatus(at("2026-10-05T19:30:00Z"), cfg); // Mo 21:30
    expect(s.text).toBe("Geöffnet · schließt in 30 Min.");
  });
  it("vor der Öffnung", () => {
    const s = openStatus(at("2026-10-05T04:30:00Z"), cfg); // Mo 06:30
    expect(s.open).toBe(false);
    expect(s.text).toBe("Geschlossen · öffnet heute um 7 Uhr");
  });
  it("sonntags", () => {
    expect(openStatus(at("2026-10-04T10:00:00Z"), cfg).text).toBe("Geschlossen · öffnet morgen um 7 Uhr");
  });
  it("Samstagabend → Montag", () => {
    expect(openStatus(at("2026-10-10T20:30:00Z"), cfg).text).toBe("Geschlossen · öffnet Montag um 7 Uhr");
  });
  it("am Feiertag", () => {
    const s = openStatus(at("2026-10-03T08:00:00Z"), cfg); // Sa, Tag der Deutschen Einheit
    expect(s.open).toBe(false);
    expect(s.today.label).toBe("Tag der Deutschen Einheit");
    expect(s.text).toBe("Geschlossen · öffnet Montag um 7 Uhr");
  });
  it("Heiligabend nach 14 Uhr → nach den Feiertagen", () => {
    const s = openStatus(at("2026-12-24T14:30:00Z"), cfg); // Do 15:30 MEZ
    expect(s.open).toBe(false);
    expect(s.text).toBe("Geschlossen · öffnet Montag, 28.12., um 7 Uhr");
  });
  it("rechnet nach der Zeitumstellung in MEZ", () => {
    expect(openStatus(at("2026-11-02T05:30:00Z"), cfg).text).toBe("Geschlossen · öffnet heute um 7 Uhr"); // 06:30 MEZ
    expect(openStatus(at("2026-11-02T06:30:00Z"), cfg).open).toBe(true); // 07:30 MEZ
  });
});

describe("upcomingSpecialDays", () => {
  it("listet Feiertage und Sonderschlusszeiten, aber keine Sonntage", () => {
    const list = upcomingSpecialDays("2026-12-20", 14, cfg);
    expect(list.map((d) => d.date)).toEqual(["2026-12-24", "2026-12-25", "2026-12-26", "2026-12-31", "2027-01-01"]);
  });
});

describe("specialDayHours", () => {
  const withDays = (specialDays: HoursConfig["specialDays"]) => ({ ...cfg, specialDays });
  it("zeigt bei geänderten Zeiten auch den Beginn – „bis …“ allein schickte Kunden zur regulären Öffnungszeit", () => {
    const plan = dayPlan("2026-10-12", withDays([{ date: "2026-10-12", label: "Betriebsversammlung", hours: ["10:00", "22:00"] }]));
    expect(specialDayHours(plan)).toBe("10 – 22 Uhr");
    expect(specialDayHours(dayPlan("2026-12-24", withDays([{ date: "2026-12-24", label: "Heiligabend", hours: ["07:30", "14:00"] }])))).toBe("7:30 – 14 Uhr");
  });
  it("vorläufige Zeiten aus dem Gesetz mit Sternchen, geschlossene Tage als „geschlossen“", () => {
    expect(specialDayHours(dayPlan("2026-12-24", cfg))).toBe("7 – 14 Uhr*");
    expect(specialDayHours(dayPlan("2026-12-25", cfg))).toBe("geschlossen");
  });
});
