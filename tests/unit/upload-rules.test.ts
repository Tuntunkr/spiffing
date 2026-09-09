import { describe, expect, it } from "vitest";
import {
  AVATAR_SMALL_ERROR,
  HUGE_ERROR,
  MAX_EDGE,
  MIN_AVATAR_EDGE,
  MIN_PUBLIC_EDGE,
  publicAvatarSizeError,
  publicImageSizeError,
  SMALL_ERROR,
  THIN_ERROR,
} from "@/lib/upload-rules";

describe("publicImageSizeError", () => {
  it("allows a gallery-sized still", () => {
    expect(publicImageSizeError(800, 1000)).toBeUndefined();
    expect(publicImageSizeError(MIN_PUBLIC_EDGE, 240)).toBeUndefined();
  });
  it("rejects tiny, huge or thin frames", () => {
    expect(publicImageSizeError(2, 1)).toBe(SMALL_ERROR);
    expect(publicImageSizeError(MAX_EDGE + 1, 400)).toBe(HUGE_ERROR);
    expect(publicImageSizeError(2400, 200)).toBe(THIN_ERROR);
    expect(publicImageSizeError(0, 800)).toMatch(/size/);
  });
});

describe("publicAvatarSizeError", () => {
  it("allows a small square and rejects a 1px file", () => {
    expect(publicAvatarSizeError(200, 200)).toBeUndefined();
    expect(publicAvatarSizeError(MIN_AVATAR_EDGE, MIN_AVATAR_EDGE)).toBeUndefined();
    expect(publicAvatarSizeError(1, 1)).toBe(AVATAR_SMALL_ERROR);
  });
});
