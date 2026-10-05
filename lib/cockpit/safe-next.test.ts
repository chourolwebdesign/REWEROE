import { describe, expect, it } from "vitest";
import { safeNext } from "./safe-next";

describe("safeNext", () => {
  it("lässt Cockpit-Pfade durch", () => {
    expect(safeNext("/cockpit")).toBe("/cockpit");
    expect(safeNext("/cockpit/prospekt")).toBe("/cockpit/prospekt");
    expect(safeNext("/cockpit/prospekt?woche=2026-10-12")).toBe("/cockpit/prospekt?woche=2026-10-12");
  });
  it("verhindert offene Weiterleitungen", () => {
    expect(safeNext("https://evil.example/cockpit")).toBe("/cockpit");
    expect(safeNext("//evil.example")).toBe("/cockpit");
    expect(safeNext("/cockpit/../angebote")).toBe("/cockpit");
    expect(safeNext("/cockpitx")).toBe("/cockpit");
    expect(safeNext("/angebote")).toBe("/cockpit");
    expect(safeNext(null)).toBe("/cockpit");
    expect(safeNext(42)).toBe("/cockpit");
  });
});
