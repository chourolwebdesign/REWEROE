import { describe, expect, it } from "vitest";
import { contactHref, feedbackStats, formatBerlin, inboxFilter, inboxHref, newFeedbackLine, toCsv, type FeedbackRow } from "./inbox";

const row = (over: Partial<FeedbackRow> = {}): FeedbackRow => ({
  id: "1",
  created_at: "2026-10-05T12:30:00Z",
  rating: 2,
  aspects: ["kasse"],
  comment: "",
  contact: "",
  lang: "de",
  google_click: false,
  status: "neu",
  handled_at: null,
  ...over,
});

describe("inboxFilter und inboxHref", () => {
  it("Standard: neue Rückmeldungen, alle Sterne", () => {
    expect(inboxFilter({})).toEqual({ status: "neu", stars: null });
    expect(inboxHref({ status: "neu", stars: null })).toBe("/cockpit/feedback");
  });
  it("liest status und sterne, ignoriert Unsinn", () => {
    expect(inboxFilter({ status: "erledigt", sterne: "1" })).toEqual({ status: "erledigt", stars: 1 });
    expect(inboxFilter({ status: "gelöscht", sterne: "9" })).toEqual({ status: "neu", stars: null });
    expect(inboxFilter({ status: ["alle", "neu"], sterne: ["3"] })).toEqual({ status: "alle", stars: 3 });
    expect(inboxHref({ status: "alle", stars: 3 })).toBe("/cockpit/feedback?status=alle&sterne=3");
  });
});

describe("feedbackStats", () => {
  const now = new Date("2026-10-31T12:00:00Z");
  it("Durchschnitt und häufigste Bereiche der letzten 30 Tage", () => {
    const rows = [
      row({ rating: 5, aspects: [], created_at: "2026-10-30T10:00:00Z" }),
      row({ rating: 2, aspects: ["kasse", "wartezeit"], created_at: "2026-10-20T10:00:00Z" }),
      row({ rating: 1, aspects: ["kasse"], created_at: "2026-10-02T10:00:00Z" }),
      row({ rating: 1, aspects: ["preis"], created_at: "2026-09-30T10:00:00Z" }),
    ];
    expect(feedbackStats(rows, now)).toEqual({ count: 3, average: 2.7, top: [{ aspect: "kasse", count: 2 }, { aspect: "wartezeit", count: 1 }] });
  });
  it("ohne Rückmeldungen kein Durchschnitt", () => {
    expect(feedbackStats([], now)).toEqual({ count: 0, average: null, top: [] });
  });
  it("Zeile für die Übersicht", () => {
    expect([0, 1, 3].map(newFeedbackLine)).toEqual(["Keine neuen Rückmeldungen", "1 neue Rückmeldung", "3 neue Rückmeldungen"]);
  });
});

describe("contactHref", () => {
  it("E-Mail → mailto", () => {
    expect(contactHref(" kunde+rewe@example.org ")).toBe("mailto:kunde+rewe@example.org");
  });
  it("Telefonnummern in üblichen Schreibweisen → tel", () => {
    expect(contactHref("0170 123 45 67")).toBe("tel:01701234567");
    expect(contactHref("+49 (69) 945158-650")).toBe("tel:+4969945158650");
    expect(contactHref("0049 170/1234567")).toBe("tel:+491701234567");
  });
  it("sonst kein Link", () => {
    expect(contactHref("ruft mich an")).toBeNull();
    expect(contactHref("12")).toBeNull();
    expect(contactHref("javascript:alert(1)")).toBeNull();
  });
});

describe("toCsv", () => {
  it("Excel-tauglich: BOM, Semikolon, Berliner Zeit, deutsche Bereiche, Anführungszeichen", () => {
    const csv = toCsv([row({ aspects: ["wartezeit", "kasse"], comment: 'Kasse; zu "lange"\nwarten', contact: "+49 170 1234567", google_click: true })]);
    expect(formatBerlin("2026-10-05T12:30:00Z")).toBe("05.10.2026, 14:30");
    expect(csv).toBe('﻿Datum;Sterne;Bereiche;Kommentar;Kontakt;Sprache;Google;Status\r\n05.10.2026, 14:30;2;Wartezeit, Kasse;"Kasse; zu ""lange""\nwarten";\'+49 170 1234567;de;ja;neu');
  });
  it("entschärft Formeln am Zellanfang", () => {
    expect(toCsv([row({ comment: '=HYPERLINK("http://x")', contact: "@x" })])).toContain(';"\'=HYPERLINK(""http://x"")";\'@x;');
  });
});
