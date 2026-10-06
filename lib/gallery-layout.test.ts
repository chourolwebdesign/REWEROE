import { describe, expect, it } from "vitest";
import { featuredSpan } from "./gallery-layout";

describe("featuredSpan", () => {
  it("behält die übliche Breite der ersten Kachel, wenn damit alle Zeilen voll werden (7 Kacheln)", () => {
    expect(featuredSpan(7, 4, [2, 3, 1])).toBe(2);
    expect(featuredSpan(7, 3, [3, 1])).toBe(3);
    expect(featuredSpan(7, 2, [2, 1])).toBe(2);
  });

  it("weicht für volle Zeilen aus (6 Kacheln: drei Spalten breit bei vier Spalten, eine bei drei oder zwei)", () => {
    expect(featuredSpan(6, 4, [2, 3, 1])).toBe(3);
    expect(featuredSpan(6, 3, [3, 1])).toBe(1);
    expect(featuredSpan(6, 2, [2, 1])).toBe(1);
  });

  it("nimmt die übliche Breite, wenn keine Breite aufgeht", () => {
    expect(featuredSpan(4, 4, [2])).toBe(2);
  });
});
