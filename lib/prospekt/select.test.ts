import { describe, expect, it } from "vitest";
import { pickFlyers, type FlyerRecord } from "./select";
import { flyerImage, flyerObjectPath } from "./urls";

const flyer = (week_start: string): FlyerRecord => ({
  id: `id-${week_start}`, week_start, kw: 0, year: 2026, valid_from: week_start, valid_to: week_start,
  page_count: 3, page_width: 1800, page_height: 2546, format: "webp",
});
const at = (iso: string, hhmm = "10:00") => new Date(`${iso}T${hhmm}:00Z`);
const all = [flyer("2026-09-28"), flyer("2026-10-05"), flyer("2026-10-12")];

describe("pickFlyers", () => {
  it("unter der Woche nur die laufende Woche", () => {
    expect(pickFlyers(all, at("2026-10-07"))).toEqual({ current: all[1], next: null, defaultTab: "current" });
  });
  it("samstags zusätzlich die nächste Woche, vorausgewählt bleibt die laufende", () => {
    expect(pickFlyers(all, at("2026-10-10"))).toEqual({ current: all[1], next: all[2], defaultTab: "current" });
  });
  it("sonntags ist die nächste Woche vorausgewählt", () => {
    expect(pickFlyers(all, at("2026-10-11"))).toEqual({ current: all[1], next: all[2], defaultTab: "next" });
  });
  it("ohne Prospekt der laufenden Woche kein alter Prospekt", () => {
    expect(pickFlyers([flyer("2026-09-28")], at("2026-10-07"))).toEqual({ current: null, next: null, defaultTab: "current" });
  });
  it("sonntags nur die nächste Woche vorhanden", () => {
    expect(pickFlyers([flyer("2026-10-12")], at("2026-10-11"))).toEqual({ current: null, next: flyer("2026-10-12"), defaultTab: "next" });
  });
  it("rechnet in Berliner Zeit (Sa 23:30 UTC = So 01:30)", () => {
    expect(pickFlyers(all, at("2026-10-10", "23:30")).defaultTab).toBe("next");
  });
});

describe("Bildpfade", () => {
  it("öffentlich über die eigene Domain, im Bucket ohne Präfix", () => {
    expect(flyerImage({ id: "abc", format: "jpg" }, 3, "thumb")).toBe("/prospekt-bilder/abc/thumb-3.jpg");
    expect(flyerImage({ id: "abc", format: "webp" }, 1, "full")).toBe("/prospekt-bilder/abc/1.webp");
    expect(flyerObjectPath("abc", 12, "full", "webp")).toBe("abc/12.webp");
  });
});
