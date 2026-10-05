import { describe, expect, it } from "vitest";
import { alarmMail } from "./alarm";

describe("alarmMail", () => {
  it("deutsch, mit Bereichen, Kommentar, Kontakt, Sprache und Link ins Cockpit", () => {
    const m = alarmMail({ rating: 1, aspects: ["wartezeit", "kasse"], comment: "Nur eine Kasse offen", contact: "0170 123456", lang: "tr" }, "https://rewe.example/cockpit/feedback");
    expect(m.subject).toBe("Feedback: 1 von 5 Sternen");
    expect(m.text).toBe(
      [
        "Neue Rückmeldung: 1 von 5 (Sehr schlecht)",
        "Bereiche: Wartezeit, Kasse",
        "Kommentar: Nur eine Kasse offen",
        "Kontakt: 0170 123456",
        "Sprache: Türkçe",
        "",
        "Im Markt-Cockpit ansehen: https://rewe.example/cockpit/feedback",
      ].join("\n"),
    );
  });
  it("leere Felder als Strich", () => {
    expect(alarmMail({ rating: 2, aspects: [], comment: "", contact: "", lang: "de" }, "x").text).toContain("Bereiche: –\nKommentar: –\nKontakt: –");
  });
});
