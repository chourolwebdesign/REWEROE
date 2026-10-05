import { describe, expect, it } from "vitest";
import type { HoursConfig } from "@/lib/types";
import { checkEvent, checkJob, checkSpecialDay, isIsoDate, openSuggestions, rowToSpecialDay } from "./rules";

const today = "2026-10-05";
const cfg: HoursConfig = { regular: { 0: null, 1: ["07:00", "22:00"], 2: ["07:00", "22:00"], 3: ["07:00", "22:00"], 4: ["07:00", "22:00"], 5: ["07:00", "22:00"], 6: ["07:00", "22:00"] }, specialDays: [] };
const day = { date: "2026-10-20", label: "Inventur", closed: true, opens: "", closes: "" };

describe("isIsoDate", () => {
  it("nur echte Kalendertage", () => {
    expect(isIsoDate("2026-10-20")).toBe(true);
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("20.10.2026")).toBe(false);
  });
});

describe("checkSpecialDay", () => {
  it("geschlossen oder mit Zeiten", () => {
    expect(checkSpecialDay(day, today)).toEqual({ ok: { date: "2026-10-20", label: "Inventur", closed: true, opens: null, closes: null } });
    expect(checkSpecialDay({ ...day, label: " Kurz geöffnet ", closed: false, opens: "08:00", closes: "13:00" }, today)).toEqual({
      ok: { date: "2026-10-20", label: "Kurz geöffnet", closed: false, opens: "08:00", closes: "13:00" },
    });
  });
  it("lehnt Vergangenheit, ferne Zukunft, leere Bezeichnung und vertauschte Zeiten ab", () => {
    expect(checkSpecialDay({ ...day, date: "2026-10-04" }, today)).toEqual({ error: "Das Datum liegt in der Vergangenheit." });
    expect(checkSpecialDay({ ...day, date: "2028-10-06" }, today)).toHaveProperty("error");
    expect(checkSpecialDay({ ...day, label: "  " }, today)).toHaveProperty("error");
    expect(checkSpecialDay({ ...day, closed: false, opens: "14:00", closes: "08:00" }, today)).toHaveProperty("error");
    expect(checkSpecialDay({ ...day, closed: false, opens: "8", closes: "13:00" }, today)).toHaveProperty("error");
  });
  it("hält die gesetzlichen Schlusszeiten (Heiligabend, Silvester 14 Uhr; Gründonnerstag 20 Uhr)", () => {
    expect(checkSpecialDay({ ...day, date: "2026-12-24", label: "Heiligabend", closed: false, opens: "07:00", closes: "18:00" }, today)).toEqual({
      error: "Heiligabend erlaubt das Ladenöffnungsgesetz höchstens bis 14 Uhr.",
    });
    expect(checkSpecialDay({ ...day, date: "2026-12-24", label: "Heiligabend", closed: false, opens: "07:00", closes: "14:00" }, today)).toHaveProperty("ok");
    expect(checkSpecialDay({ ...day, date: "2027-03-25", label: "Gründonnerstag", closed: false, opens: "07:00", closes: "21:00" }, today)).toHaveProperty("error");
  });
});

describe("rowToSpecialDay", () => {
  it("Zeiten aus Postgres (HH:MM:SS) → HH:MM; geschlossen → null", () => {
    expect(rowToSpecialDay({ date: "2026-12-24", label: "Heiligabend", closed: false, opens: "07:00:00", closes: "13:00:00" })).toEqual({ date: "2026-12-24", label: "Heiligabend", hours: ["07:00", "13:00"] });
    expect(rowToSpecialDay({ date: "2026-10-20", label: "Inventur", closed: true, opens: null, closes: null })).toEqual({ date: "2026-10-20", label: "Inventur", hours: null });
  });
});

describe("openSuggestions", () => {
  it("nennt gesetzliche Grenztage, solange der Markt sie nicht festgelegt hat", () => {
    expect(openSuggestions(cfg, "2026-12-01", 40).map((d) => d.date)).toEqual(["2026-12-24", "2026-12-31"]);
    const set = { ...cfg, specialDays: [{ date: "2026-12-24", label: "Heiligabend", hours: ["07:00", "13:00"] as const }] };
    expect(openSuggestions(set, "2026-12-01", 40).map((d) => d.date)).toEqual(["2026-12-31"]);
  });
});

describe("checkEvent", () => {
  const ev = { id: "", date: "2026-10-24", time: " 10–14 Uhr ", title: " Kürbis-Verkostung ", text: " Am Stand vor dem Obst. " };
  it("bereinigt und kennt neu oder bearbeiten", () => {
    expect(checkEvent(ev, today)).toEqual({ ok: { id: null, row: { date: "2026-10-24", time: "10–14 Uhr", title: "Kürbis-Verkostung", text: "Am Stand vor dem Obst." } } });
    expect(checkEvent({ ...ev, id: "3f1c0e3a-7b55-4c8e-9a64-1b2d3c4e5f60" }, today)).toHaveProperty("ok.id", "3f1c0e3a-7b55-4c8e-9a64-1b2d3c4e5f60");
  });
  it("heute ist erlaubt, gestern nicht; Titel Pflicht; Längen", () => {
    expect(checkEvent({ ...ev, date: today }, today)).toHaveProperty("ok");
    expect(checkEvent({ ...ev, date: "2026-10-04" }, today)).toHaveProperty("error");
    expect(checkEvent({ ...ev, title: "" }, today)).toHaveProperty("error");
    expect(checkEvent({ ...ev, time: "x".repeat(41) }, today)).toHaveProperty("error");
    expect(checkEvent({ ...ev, text: "x".repeat(601) }, today)).toHaveProperty("error");
    expect(checkEvent({ ...ev, id: "kaputt" }, today)).toHaveProperty("error");
  });
});

describe("checkJob", () => {
  const job = { id: "", title: " Kassierer (m/w/d) ", employment: "Teilzeit", text: " 20 Stunden, auch samstags. ", validThrough: "", active: true };
  it("bereinigt; gültig bis optional", () => {
    expect(checkJob(job, today)).toEqual({ ok: { id: null, row: { title: "Kassierer (m/w/d)", employment: "Teilzeit", text: "20 Stunden, auch samstags.", valid_through: null, active: true } } });
    expect(checkJob({ ...job, validThrough: "2026-12-31", active: false }, today)).toHaveProperty("ok.row.valid_through", "2026-12-31");
  });
  it("lehnt fehlende Angaben, unbekannte Anstellung und Ablauf in der Vergangenheit ab", () => {
    expect(checkJob({ ...job, title: "" }, today)).toHaveProperty("error");
    expect(checkJob({ ...job, employment: "Praktikum" }, today)).toHaveProperty("error");
    expect(checkJob({ ...job, text: "" }, today)).toHaveProperty("error");
    expect(checkJob({ ...job, validThrough: "2026-10-01" }, today)).toHaveProperty("error");
  });
});
