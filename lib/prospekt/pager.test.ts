import { describe, expect, it } from "vitest";
import { nearPages, pageLabel, pagerTarget, pagesLabel, usesSpreads } from "./pager";

describe("pageLabel", () => {
  it("eine Seite, Doppelseite, unsortiert, leer", () => {
    expect(pageLabel([3], 34)).toBe("Seite 3 von 34");
    expect(pageLabel([5, 4], 34)).toBe("Seite 4–5 von 34");
    expect(pageLabel([], 34)).toBe("Seite 1 von 34");
    expect(pageLabel([1], 1)).toBe("Seite 1 von 1");
  });
});

describe("nearPages", () => {
  it("sichtbare Seiten und zwei davor und danach, innerhalb des Prospekts", () => {
    expect(nearPages([1], 34)).toEqual([1, 2, 3]);
    expect(nearPages([4, 5], 34)).toEqual([2, 3, 4, 5, 6, 7]);
    expect(nearPages([34], 34)).toEqual([32, 33, 34]);
    expect(nearPages([1], 1)).toEqual([1]);
  });
});

describe("pagerTarget", () => {
  it("einzelne Seiten: die Seite selbst, begrenzt auf 1 bis Seitenzahl", () => {
    expect(pagerTarget(3, 34, false)).toBe(3);
    expect(pagerTarget(0, 34, false)).toBe(1);
    expect(pagerTarget(99, 34, false)).toBe(34);
  });
  it("Doppelseiten: Titelseite allein, ungerade Seiten springen zur geraden davor", () => {
    expect(pagerTarget(1, 34, true)).toBe(1);
    expect(pagerTarget(2, 34, true)).toBe(2);
    expect(pagerTarget(3, 34, true)).toBe(2);
    expect(pagerTarget(33, 34, true)).toBe(32);
    expect(pagerTarget(34, 34, true)).toBe(34);
    expect(pagerTarget(3, 3, true)).toBe(2);
    expect(pagerTarget(1, 1, true)).toBe(1);
  });
});

describe("usesSpreads", () => {
  it("Doppelseiten nur bei Hochformat (und quadratisch); Querformat blättert einzeln", () => {
    expect(usesSpreads(1800, 3182)).toBe(true);
    expect(usesSpreads(1800, 1800)).toBe(true);
    expect(usesSpreads(1800, 1018)).toBe(false);
  });
});

describe("pagesLabel", () => {
  it("„Alle n Seiten ansehen“, bei einer Seite ohne „Alle 1 Seiten“", () => {
    expect(pagesLabel(34)).toBe("Alle 34 Seiten ansehen");
    expect(pagesLabel(2)).toBe("Alle 2 Seiten ansehen");
    expect(pagesLabel(1)).toBe("Die Seite ansehen");
  });
});
