import { describe, expect, it } from "vitest";
import { flyerLink, linkTarget, pickFlyers, publishNotice, shownFlyer, viewerTabs, type FlyerRecord } from "./select";
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

describe("shownFlyer und flyerLink", () => {
  it("zeigt den Prospekt des vorausgewählten Reiters", () => {
    expect(shownFlyer(pickFlyers(all, at("2026-10-07")))).toEqual(all[1]);
    expect(shownFlyer(pickFlyers(all, at("2026-10-11")))).toEqual(all[2]); // sonntags die neue Woche
    expect(shownFlyer(pickFlyers([flyer("2026-10-05")], at("2026-10-11")))).toBeNull(); // sonntags ohne neue Woche: keiner
  });
  it("„Prospekt“-Knöpfe führen zum eigenen Viewer, sonst zu rewe.de", () => {
    expect(flyerLink(all[1], "https://rewe.example/prospekt")).toEqual({ href: "/angebote#prospekt", external: false });
    expect(flyerLink(null, "https://rewe.example/prospekt")).toEqual({ href: "https://rewe.example/prospekt", external: true });
  });
});

describe("viewerTabs (/angebote)", () => {
  it("unter der Woche die laufende Woche", () => {
    expect(viewerTabs(pickFlyers(all, at("2026-10-07")))).toEqual([{ key: "current", flyer: all[1] }]);
  });
  it("samstags beide Wochen, ohne laufende auch nur die nächste", () => {
    expect(viewerTabs(pickFlyers(all, at("2026-10-10")))).toEqual([{ key: "current", flyer: all[1] }, { key: "next", flyer: all[2] }]);
    expect(viewerTabs(pickFlyers([all[2]], at("2026-10-10")))).toEqual([{ key: "next", flyer: all[2] }]);
  });
  it("sonntags ohne Prospekt der neuen Woche: kein abgelaufener Prospekt, Rückfall auf rewe.de", () => {
    expect(viewerTabs(pickFlyers([all[1]], at("2026-10-11")))).toBeNull();
  });
  it("ohne Prospekt: Rückfall auf rewe.de", () => {
    expect(viewerTabs(pickFlyers([], at("2026-10-07")))).toBeNull();
  });
});

describe("linkTarget (geteilte Links ?kw=&seite=)", () => {
  const weeks = [
    { key: "current" as const, kw: 41, pages: 3 },
    { key: "next" as const, kw: 42, pages: 5 },
  ];
  it("?kw= wählt die Woche des geteilten Links", () => {
    expect(linkTarget("?kw=42&seite=4", weeks, "current")).toEqual({ tab: "next", page: 4 });
    expect(linkTarget("?kw=41&seite=2", weeks, "next")).toEqual({ tab: "current", page: 2 });
  });
  it("ohne kw (ältere Links) der vorausgewählte Reiter", () => {
    expect(linkTarget("?seite=2", weeks, "current")).toEqual({ tab: "current", page: 2 });
    expect(linkTarget("", weeks, "next")).toEqual({ tab: "next", page: null });
  });
  it("veraltete Woche oder fremde Seite: nichts öffnen", () => {
    expect(linkTarget("?kw=40&seite=2", weeks, "next")).toEqual({ tab: "next", page: null });
    expect(linkTarget("?kw=41&seite=9", weeks, "current")).toEqual({ tab: "current", page: null });
    expect(linkTarget("?kw=41&seite=1.5", weeks, "current")).toEqual({ tab: "current", page: null });
  });
});

describe("publishNotice (Meldung nach dem Veröffentlichen)", () => {
  it("laufende Woche: sofort online", () => {
    expect(publishNotice("2026-10-05", at("2026-10-07"))).toEqual({
      online: true,
      title: "Fertig! KW 41 ist online.",
      text: "Die Website zeigt den Prospekt in wenigen Sekunden.",
    });
  });
  it("freitags für die nächste Woche: gespeichert, sichtbar ab Samstag", () => {
    expect(publishNotice("2026-10-12", at("2026-10-09"))).toEqual({
      online: false,
      title: "Fertig! KW 42 ist gespeichert.",
      text: "Die Website zeigt ihn ab Samstag, 10.10., unter „Nächste Woche“ – ab Montag, 12.10., als aktuellen Prospekt.",
    });
  });
  it("samstags für die nächste Woche: online unter „Nächste Woche“", () => {
    expect(publishNotice("2026-10-12", at("2026-10-10"))).toMatchObject({ online: true, title: "Fertig! KW 42 ist online.", text: expect.stringContaining("„Nächste Woche“") });
  });
  it("sonntags für die neue Woche: online", () => {
    expect(publishNotice("2026-10-12", at("2026-10-11"))).toMatchObject({ online: true, title: "Fertig! KW 42 ist online." });
  });
  it("zwei Wochen voraus: ab dem Samstag davor", () => {
    expect(publishNotice("2026-10-19", at("2026-10-07")).text).toContain("ab Samstag, 17.10.");
  });
});
