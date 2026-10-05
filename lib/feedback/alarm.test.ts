import { describe, expect, it } from "vitest";
import { alarmMail } from "./alarm";

describe("alarmMail", () => {
  it("deutsch, ohne Kommentar und Kontakt (die bleiben in der Datenbank mit Löschfrist) – nur ob es sie gibt", () => {
    const m = alarmMail({ rating: 1, aspects: ["wartezeit", "kasse"], comment: "Nur eine Kasse offen", contact: "0170 123456", lang: "tr" }, "https://rewe.example/cockpit/feedback");
    expect(m.subject).toBe("Feedback: 1 von 5 Sternen");
    expect(m.text).toBe(
      [
        "Neue Rückmeldung: 1 von 5 (Sehr schlecht)",
        "Bereiche: Wartezeit, Kasse",
        "Kommentar: ja",
        "Rückruf gewünscht: ja",
        "Sprache: Türkçe",
        "",
        "Kommentar und Kontakt stehen nur im Markt-Cockpit: https://rewe.example/cockpit/feedback",
      ].join("\n"),
    );
    expect(m.text).not.toContain("0170");
    expect(m.text).not.toContain("Nur eine Kasse");
  });
  it("leere Felder", () => {
    expect(alarmMail({ rating: 2, aspects: [], comment: "", contact: "", lang: "de" }, "x").text).toContain("Bereiche: –\nKommentar: nein\nRückruf gewünscht: nein");
  });
});
