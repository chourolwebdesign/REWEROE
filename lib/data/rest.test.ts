import { createServer, type Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getJson } from "./rest";

/** Lokaler http-Server: /ok antwortet JSON, /abbruch bricht nach den Headern ab, /stumm antwortet nie */
let server: Server;
let base = "";
beforeAll(async () => {
  server = createServer((req, res) => {
    if (req.url === "/ok") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify([{ id: 1 }]));
    } else if (req.url === "/abbruch") {
      res.writeHead(200, { "content-type": "application/json" });
      res.write('[{"id":');
      res.socket?.destroy();
    }
    // /stumm: keine Antwort
  });
  await new Promise<void>((ok) => server.listen(0, "127.0.0.1", ok));
  const addr = server.address();
  base = `http://127.0.0.1:${typeof addr === "object" && addr ? addr.port : 0}`;
});
afterAll(() => new Promise<void>((ok) => server.close(() => ok())));

describe("getJson", () => {
  it("liefert die JSON-Antwort", async () => {
    await expect(getJson<{ id: number }[]>(`${base}/ok`, "Test")).resolves.toEqual([{ id: 1 }]);
  });
  it("meldet einen Fehler, wenn die Verbindung nach den Headern abbricht (hängt nicht)", async () => {
    await expect(getJson(`${base}/abbruch`, "Test", { deadlineMs: 2000 })).rejects.toThrow(/Test/);
  });
  it("gibt nach der Gesamtfrist auf, wenn keine Antwort kommt", async () => {
    const t = Date.now();
    await expect(getJson(`${base}/stumm`, "Test", { deadlineMs: 300 })).rejects.toThrow(/antwortet nicht/);
    expect(Date.now() - t).toBeLessThan(1500);
  });
});
