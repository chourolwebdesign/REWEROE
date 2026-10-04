import { describe, expect, it } from "vitest";
import { bottles, formatAmount, scaleAmount } from "./vorrat";

describe("Notvorrat-Rechner", () => {
  it("skaliert linear mit Personen und Tagen (Basis 1 Person, 10 Tage)", () => {
    expect(scaleAmount(20, 1, 10)).toBe(20);
    expect(scaleAmount(20, 2, 10)).toBe(40);
    expect(scaleAmount(3.5, 3, 7)).toBeCloseTo(7.35);
  });
  it("formatiert Mengen lesbar", () => {
    expect(formatAmount(7.35, "kg")).toBe("7,4 kg");
    expect(formatAmount(40, "l")).toBe("40 l");
    expect(formatAmount(0.357, "kg")).toBe("360 g");
    expect(formatAmount(0.1071, "kg")).toBe("110 g");
    expect(formatAmount(12, "kg")).toBe("12 kg");
    expect(formatAmount(6, "l")).toBe("6 l");
  });
  it("rechnet Getränke in 1,5-Liter-Flaschen um", () => {
    expect(bottles(20)).toBe(14);
    expect(bottles(6)).toBe(4);
  });
});
