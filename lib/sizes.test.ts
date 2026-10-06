import { describe, expect, it } from "vitest";
import { coverSizes } from "./sizes";

const TILE = "(min-width: 64rem) 320px, (min-width: 48rem) 31vw, 72vw";

describe("coverSizes", () => {
  it("lässt Hochformate in einer 4:5-Kachel unverändert (nichts wird seitlich abgeschnitten)", () => {
    expect(coverSizes(TILE, 3 / 4, 4 / 5)).toBe(TILE);
  });

  it("vergrößert die Breiten um den Zuschnitt: Querformat 3:2 in 4:5 braucht das 1,875-Fache", () => {
    expect(coverSizes(TILE, 3 / 2, 4 / 5)).toBe("(min-width: 64rem) 600px, (min-width: 48rem) 58vw, 135vw");
  });

  it("rührt die Medienbedingungen nicht an", () => {
    expect(coverSizes("(min-width: 40rem) 50vw, 100vw", 2, 1)).toBe("(min-width: 40rem) 100vw, 200vw");
  });

  it("kommt mit einer einzelnen Angabe ohne Bedingung aus", () => {
    expect(coverSizes("640px", 16 / 9, 4 / 5)).toBe("1422px");
  });
});
