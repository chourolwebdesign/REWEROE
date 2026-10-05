import { describe, expect, it } from "vitest";
import { DraftError, uploadFailure, uploadSupported } from "./upload-errors";

const named = (name: string, message = "") => Object.assign(new Error(message), { name });
const api = (status: number, message = "") => Object.assign(named("StorageApiError", message), { status, statusCode: String(status) });
const ctx = { uploaded: 1 };

describe("uploadFailure", () => {
  it("Netzabbruch → fortsetzen ab der nächsten Seite", () => {
    expect(uploadFailure(named("StorageUnknownError", "Failed to fetch"), ctx)).toEqual({
      action: "retry",
      message: "Die Verbindung ist abgebrochen. Erneut versuchen setzt bei Seite 2 fort.",
    });
    expect(uploadFailure(new TypeError("Load failed"), ctx).action).toBe("retry"); // Safari: Server-Aktion ohne Netz
    expect(uploadFailure(new TypeError("NetworkError when attempting to fetch resource."), ctx).action).toBe("retry"); // Firefox
  });
  it("Serverfehler beim Hochladen → fortsetzen", () => {
    expect(uploadFailure(api(503, "Service Unavailable"), ctx).action).toBe("retry");
  });
  it("abgelaufene Anmeldung → neu anmelden, kein Fortsetzen", () => {
    expect(uploadFailure(api(401, "jwt expired"), ctx)).toMatchObject({ action: "stop", message: expect.stringContaining("neu an"), relogin: true });
    expect(uploadFailure(Object.assign(api(400, "new row violates row-level security policy"), { statusCode: "403" }), ctx).action).toBe("stop");
  });
  it("PDF mit Passwort → klare Meldung, kein Fortsetzen", () => {
    expect(uploadFailure(named("PasswordException", "No password given"), ctx)).toMatchObject({ action: "stop", message: expect.stringContaining("Passwort") });
    expect(uploadFailure(named("PasswordException", "No password given"), ctx).relogin).toBeUndefined();
  });
  it("beschädigte oder leere Datei → klare Meldung, kein Fortsetzen", () => {
    expect(uploadFailure(named("InvalidPDFException", "Invalid PDF structure."), ctx)).toMatchObject({ action: "stop", message: expect.stringContaining("beschädigt") });
    expect(uploadFailure(named("ResponseException", "Missing PDF"), ctx).action).toBe("stop"); // pdf.js 6: früher MissingPDFException
    expect(uploadFailure(named("UnknownErrorException", "xref"), ctx).action).toBe("stop");
  });
  it("fehlende Browser-Funktion → Browser aktualisieren statt Endlosschleife", () => {
    expect(uploadFailure(new TypeError("t.getOrInsertComputed is not a function"), ctx)).toMatchObject({ action: "stop", message: expect.stringContaining("Browser") });
  });
  it("Seite ließ sich nicht als Bild speichern (Speicher knapp) → erneut versuchen", () => {
    expect(uploadFailure(new Error("Bild konnte nicht erzeugt werden"), ctx)).toMatchObject({ action: "retry", message: expect.stringContaining("Speicher") });
  });
  it("Entwurf vom Server abgelehnt → Woche ändern und neu starten", () => {
    expect(uploadFailure(new DraftError("Bitte eine Woche in der Nähe von heute wählen."), { uploaded: 0 })).toEqual({
      action: "ready",
      message: "Bitte eine Woche in der Nähe von heute wählen.",
    });
  });
  it("Unbekanntes → erneut versuchen", () => {
    expect(uploadFailure("kaputt", ctx).action).toBe("retry");
  });
});

describe("uploadSupported", () => {
  it("braucht Promise.withResolvers (pdf.js, auch im Legacy-Build)", () => {
    expect(uploadSupported({ Promise: { withResolvers: () => ({}) } })).toBe(true);
    expect(uploadSupported({ Promise: {} })).toBe(false);
  });
});
