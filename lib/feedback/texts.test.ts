import { describe, expect, it } from "vitest";
import { ASPECTS, LANGS } from "./rules";
import { FEEDBACK_TEXTS } from "./texts";

describe("FEEDBACK_TEXTS", () => {
  it("jede Sprache hat alle Texte, fünf Stufen und alle Bereiche", () => {
    const keys = Object.keys(FEEDBACK_TEXTS.de).sort();
    for (const l of LANGS) {
      const t = FEEDBACK_TEXTS[l];
      expect(Object.keys(t).sort()).toEqual(keys);
      expect(t.scale).toHaveLength(5);
      expect(t.hint).toHaveLength(5);
      expect(Object.keys(t.aspects).sort()).toEqual([...ASPECTS].sort());
      expect(t.h1).toHaveLength(3);
      expect(t.h2).toHaveLength(3);
    }
  });
  it("Arabisch von rechts nach links, sonst links nach rechts", () => {
    expect(LANGS.map((l) => FEEDBACK_TEXTS[l].dir)).toEqual(["ltr", "ltr", "rtl", "ltr", "ltr"]);
  });
  it("Deutsch duzt", () => {
    expect(JSON.stringify(FEEDBACK_TEXTS.de)).not.toMatch(/\b(Sie|Ihr|Ihre|Ihnen|Ihrem|Ihren)\b/);
  });
  it("keine Zusage einer Antwortfrist", () => {
    for (const l of LANGS) expect(FEEDBACK_TEXTS[l].careText).not.toMatch(/48/);
  });
});
