import { describe, expect, it } from "vitest";
import { defaultUploadWeekStart, mondayOfIsoWeek, suggestUploadWeek, uploadWeek, uploadWeekChoices, weekFromFilename } from "./week";

const at = (iso: string) => new Date(`${iso}T10:00:00Z`);

describe("mondayOfIsoWeek", () => {
  it("rechnet nach ISO 8601", () => {
    expect(mondayOfIsoWeek(41, 2026)).toBe("2026-10-05");
    expect(mondayOfIsoWeek(1, 2026)).toBe("2025-12-29");
    expect(mondayOfIsoWeek(53, 2026)).toBe("2026-12-28");
    expect(mondayOfIsoWeek(1, 2027)).toBe("2027-01-04");
  });
});

describe("uploadWeek", () => {
  it("übernimmt die Gültigkeit aus lib/flyer.ts", () => {
    expect(uploadWeek("2026-10-05")).toEqual({ kw: 41, year: 2026, weekStart: "2026-10-05", validFrom: "2026-10-05", validTo: "2026-10-10", range: "Mo 05.10. – Sa 10.10.2026" });
  });
  it("beginnt nach Ostermontag am Dienstag", () => {
    expect(uploadWeek("2027-03-29")).toMatchObject({ kw: 13, validFrom: "2027-03-30", validTo: "2027-04-03" });
  });
  it("KW 53 über den Jahreswechsel gehört zu 2026", () => {
    expect(uploadWeek("2026-12-28")).toMatchObject({ kw: 53, year: 2026, validTo: "2027-01-02" });
  });
});

describe("weekFromFilename", () => {
  it("liest die REWE-Dateinamen", () => {
    expect(weekFromFilename("KW41_2026_final_proof.pdf", at("2026-10-02"))).toEqual({ kw: 41, year: 2026 });
    expect(weekFromFilename("Prospekt KW 7.pdf", at("2027-02-10"))).toEqual({ kw: 7, year: 2027 });
    expect(weekFromFilename("rewe-kw-42-2026.pdf", at("2026-10-09"))).toEqual({ kw: 42, year: 2026 });
  });
  it("nimmt ohne Jahr das nächstliegende Jahr", () => {
    expect(weekFromFilename("kw-01.pdf", at("2026-12-30"))).toEqual({ kw: 1, year: 2027 });
    expect(weekFromFilename("KW52.pdf", at("2027-01-02"))).toEqual({ kw: 52, year: 2026 });
  });
  it("ignoriert Unsinn", () => {
    expect(weekFromFilename("Angebote.pdf", at("2026-10-02"))).toBeNull();
    expect(weekFromFilename("KW99_2026.pdf", at("2026-10-02"))).toBeNull();
    expect(weekFromFilename("KW53_2027.pdf", at("2027-10-02"))).toBeNull(); // 2027 hat keine KW 53
  });
});

describe("defaultUploadWeekStart", () => {
  it("Do–So → nächste Woche, Mo–Mi → laufende Woche (Berliner Zeit)", () => {
    expect(defaultUploadWeekStart(at("2026-10-06"))).toBe("2026-10-05"); // Di
    expect(defaultUploadWeekStart(at("2026-10-07"))).toBe("2026-10-05"); // Mi
    expect(defaultUploadWeekStart(at("2026-10-08"))).toBe("2026-10-12"); // Do
    expect(defaultUploadWeekStart(at("2026-10-09"))).toBe("2026-10-12"); // Fr
    expect(defaultUploadWeekStart(at("2026-10-11"))).toBe("2026-10-12"); // So
    expect(defaultUploadWeekStart(new Date("2026-10-07T22:30:00Z"))).toBe("2026-10-12"); // Mi 23:30 UTC = Do 00:30 Berlin
  });
});

describe("suggestUploadWeek", () => {
  it("Dateiname vor Wochentag", () => {
    expect(suggestUploadWeek("KW41_2026_final_proof.pdf", at("2026-10-09")).weekStart).toBe("2026-10-05");
    expect(suggestUploadWeek("prospekt.pdf", at("2026-10-09")).weekStart).toBe("2026-10-12");
  });
});

describe("uploadWeekChoices", () => {
  it("laufende Woche und drei folgende", () => {
    expect(uploadWeekChoices(at("2026-10-07")).map((w) => w.kw)).toEqual([41, 42, 43, 44]);
    expect(uploadWeekChoices(at("2026-10-11"))[0].weekStart).toBe("2026-10-05"); // sonntags zuerst noch die laufende Woche
  });
});
