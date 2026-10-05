import { describe, expect, it } from "vitest";
import { parseAcceptLanguage, pickLang } from "./lang";

describe("parseAcceptLanguage", () => {
  it("sortiert nach q, behält sonst die Reihenfolge", () => {
    expect(parseAcceptLanguage("de;q=0.5, tr-TR, tr;q=0.9, en;q=0.9")).toEqual(["tr-TR", "tr", "en", "de"]);
  });
  it("leer oder kaputt → leer, q=0 fällt weg", () => {
    expect(parseAcceptLanguage(null)).toEqual([]);
    expect(parseAcceptLanguage("ar;q=0, ru")).toEqual(["ru"]);
  });
});

describe("pickLang", () => {
  it("erste unterstützte Sprache, sonst Deutsch", () => {
    expect(pickLang(["fr-FR", "ar-SA", "de"])).toBe("ar");
    expect(pickLang(["RU"])).toBe("ru");
    expect(pickLang(["fr", "it"])).toBe("de");
    expect(pickLang([])).toBe("de");
  });
});
