import { describe, expect, it } from "vitest";
import { allPages } from "./pages";

describe("allPages", () => {
  const rows = Array.from({ length: 2500 }, (_, i) => i);
  const fetchPage = async (from: number, to: number) => ({ data: rows.slice(from, to + 1), error: null });
  it("liest Seite für Seite, bis eine Seite kürzer ist (PostgREST liefert höchstens 1000 Zeilen je Abfrage)", async () => {
    expect(await allPages(fetchPage, 1000)).toEqual(rows);
    expect(await allPages(async (from, to) => ({ data: rows.slice(0, 1000).slice(from, to + 1), error: null }), 1000)).toHaveLength(1000);
  });
  it("Fehler brechen ab statt still weniger zu liefern", async () => {
    await expect(allPages(async () => ({ data: null, error: { message: "kaputt" } }), 1000)).rejects.toThrow("kaputt");
  });
});
