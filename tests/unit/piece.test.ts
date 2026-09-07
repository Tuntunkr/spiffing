import { describe, expect, it } from "vitest";
import {
  LIMITS,
  normaliseSourceUrl,
  pieceFromFields,
  slugify,
  uniqueId,
  validatePiece,
  type PieceFields,
} from "@/lib/piece";

const valid: PieceFields = {
  title: "Ledger — pricing",
  description: "A pricing page with three tiers.",
  category: "Web",
  handle: "@studioquiet",
  sourceUrl: "https://example.com/ledger",
  slides: "3",
  featured: true,
};

describe("slugify", () => {
  it("lowercases, strips punctuation and collapses dashes", () => {
    expect(slugify("Ledger — Pricing  Page!")).toBe("ledger-pricing-page");
  });
  it("removes accents", () => {
    expect(slugify("Café Négro")).toBe("cafe-negro");
  });
  it("falls back when nothing survives", () => {
    expect(slugify("!!!")).toBe("piece");
    expect(slugify("")).toBe("piece");
  });
  it("caps the length without a trailing dash", () => {
    const slug = slugify("word ".repeat(40));
    expect(slug.length).toBeLessThanOrEqual(72);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("uniqueId", () => {
  it("returns the plain slug when free", () => {
    expect(uniqueId("Hello World", new Set())).toBe("hello-world");
  });
  it("appends the first free counter", () => {
    expect(uniqueId("Hello", new Set(["hello", "hello-2", "hello-3"]))).toBe("hello-4");
  });
});

describe("normaliseSourceUrl", () => {
  it("allows empty", () => {
    expect(normaliseSourceUrl("   ")).toBe("");
  });
  it("accepts http(s) and normalises", () => {
    expect(normaliseSourceUrl("https://Example.com")).toBe("https://example.com/");
    expect(normaliseSourceUrl("http://a.b/c?d=1")).toBe("http://a.b/c?d=1");
  });
  it("rejects other schemes and garbage", () => {
    expect(normaliseSourceUrl("javascript:alert(1)")).toBeNull();
    expect(normaliseSourceUrl("ftp://x.y")).toBeNull();
    expect(normaliseSourceUrl("not a url")).toBeNull();
  });
});

describe("validatePiece", () => {
  it("accepts a complete piece", () => {
    expect(validatePiece(valid)).toEqual({});
  });
  it("requires title, description, handle", () => {
    const errors = validatePiece({ ...valid, title: "", description: "", handle: "" });
    expect(errors.title).toBe("Title is required.");
    expect(errors.description).toBe("Description is required.");
    expect(errors.handle).toBe("Designer handle is required.");
  });
  it("enforces limits", () => {
    const errors = validatePiece({
      ...valid,
      title: "x".repeat(LIMITS.title + 1),
      description: "x".repeat(LIMITS.description + 1),
      handle: "h".repeat(LIMITS.handle + 1),
    });
    expect(errors.title).toMatch(/under/);
    expect(errors.description).toMatch(/300/);
    expect(errors.handle).toMatch(/under/);
  });
  it("rejects unknown categories", () => {
    expect(validatePiece({ ...valid, category: "Memes" }).category).toMatch(/category/);
  });
  it("rejects handles with spaces or symbols", () => {
    expect(validatePiece({ ...valid, handle: "studio quiet" }).handle).toMatch(/Letters, numbers/);
    expect(validatePiece({ ...valid, handle: "studio<script>" }).handle).toMatch(/Letters, numbers/);
    expect(validatePiece({ ...valid, handle: "studio.quiet_2-b" })).toEqual({});
  });
  it("rejects bad source URLs", () => {
    expect(validatePiece({ ...valid, sourceUrl: "javascript:alert(1)" }).sourceUrl).toMatch(/http/);
  });
  it("validates frames", () => {
    expect(validatePiece({ ...valid, slides: "0" }).slides).toMatch(/1 to/);
    expect(validatePiece({ ...valid, slides: "2.5" }).slides).toMatch(/whole number/);
    expect(validatePiece({ ...valid, slides: "abc" }).slides).toMatch(/whole number/);
    expect(validatePiece({ ...valid, slides: String(LIMITS.slides + 1) }).slides).toBeDefined();
    expect(validatePiece({ ...valid, slides: "" })).toEqual({});
  });
});

describe("pieceFromFields", () => {
  it("normalises on success", () => {
    const result = pieceFromFields(valid);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual({
      title: "Ledger — pricing",
      description: "A pricing page with three tiers.",
      category: "Web",
      handle: "studioquiet",
      sourceUrl: "https://example.com/ledger",
      slides: 3,
      featured: true,
    });
  });
  it("defaults frames to 1 and source to empty", () => {
    const result = pieceFromFields({ ...valid, slides: "", sourceUrl: "" });
    expect(result.ok && result.value.slides).toBe(1);
    expect(result.ok && result.value.sourceUrl).toBe("");
  });
  it("returns every field error at once", () => {
    const result = pieceFromFields({ ...valid, title: "", handle: "" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.fields).sort()).toEqual(["handle", "title"]);
  });
});
