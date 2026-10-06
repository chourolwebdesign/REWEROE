import { describe, expect, it } from "vitest";
import { formValues } from "./form-state";

describe("formValues", () => {
  it("nimmt die Texteingaben, lässt Dateien und interne Felder von React/Next weg", () => {
    const fd = new FormData();
    fd.set("title", "Kürbis-Verkostung");
    fd.set("closed", "on");
    fd.set("$ACTION_KEY", "k0");
    fd.set("bild", new Blob(["x"]), "bild.png");
    expect(formValues(fd)).toEqual({ title: "Kürbis-Verkostung", closed: "on" });
  });
});
