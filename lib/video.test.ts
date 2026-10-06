import { describe, expect, it } from "vitest";
import { pickSource } from "./video";

const sources = [
  { src: "/av1.mp4", type: 'video/mp4; codecs="av01.0.08M.08"' },
  { src: "/hevc.mp4", type: 'video/mp4; codecs="hvc1.1.6.L93.B0"' },
  { src: "/h264.mp4", type: 'video/mp4; codecs="avc1.640028"' },
];

describe("pickSource", () => {
  it("nimmt die erste Fassung, die der Browser abspielen kann", () => {
    expect(pickSource(sources, () => "probably")).toBe("/av1.mp4");
    expect(pickSource(sources, (t) => (t.includes("av01") ? "" : "maybe"))).toBe("/hevc.mp4");
    expect(pickSource(sources, (t) => (t.includes("avc1") ? "maybe" : ""))).toBe("/h264.mp4");
  });
  it("ohne passende Fassung kein Video – das Standbild bleibt", () => {
    expect(pickSource(sources, () => "")).toBeNull();
  });
});
