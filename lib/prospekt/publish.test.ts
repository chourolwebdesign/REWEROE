import { describe, expect, it } from "vitest";
import { checkPublishInput } from "./publish";

const ok = { id: "x", pageCount: 3, pageWidth: 1800, pageHeight: 2546, format: "webp" as const };

describe("checkPublishInput", () => {
  it("nimmt gültige Angaben an", () => {
    expect(checkPublishInput(ok)).toBeNull();
    expect(checkPublishInput({ ...ok, format: "jpg" })).toBeNull();
  });
  it("nur ganze Zahlen", () => {
    expect(checkPublishInput({ ...ok, pageCount: 3.5 })).not.toBeNull();
    expect(checkPublishInput({ ...ok, pageHeight: 2546.4 })).not.toBeNull();
    expect(checkPublishInput({ ...ok, pageWidth: Number.NaN })).not.toBeNull();
  });
  it("Bereiche und Format", () => {
    expect(checkPublishInput({ ...ok, pageCount: 0 })).not.toBeNull();
    expect(checkPublishInput({ ...ok, pageCount: 81 })).not.toBeNull();
    expect(checkPublishInput({ ...ok, pageWidth: 99 })).not.toBeNull();
    expect(checkPublishInput({ ...ok, format: "png" as never })).not.toBeNull();
  });
});
