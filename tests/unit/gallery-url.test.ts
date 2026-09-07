import { describe, expect, it } from "vitest";
import { galleryHref, MAX_QUERY, parseGalleryQuery } from "@/lib/gallery-url";

describe("parseGalleryQuery", () => {
  it("defaults everything", () => {
    expect(parseGalleryQuery({})).toEqual({ category: "All", sort: "Latest", q: "" });
  });
  it("keeps known values", () => {
    expect(parseGalleryQuery({ category: "Web", sort: "Featured", q: " ledger " })).toEqual({
      category: "Web",
      sort: "Featured",
      q: "ledger",
    });
  });
  it("drops unknown values", () => {
    expect(parseGalleryQuery({ category: "Memes", sort: "Random" })).toEqual({
      category: "All",
      sort: "Latest",
      q: "",
    });
  });
  it("takes the first of repeated params and caps the query", () => {
    const parsed = parseGalleryQuery({ category: ["Print", "Web"], q: "x".repeat(MAX_QUERY + 20) });
    expect(parsed.category).toBe("Print");
    expect(parsed.q).toHaveLength(MAX_QUERY);
  });
});

describe("galleryHref", () => {
  it("omits defaults", () => {
    expect(galleryHref({ category: "All", sort: "Latest", q: "" })).toBe("/");
  });
  it("encodes what is set", () => {
    expect(galleryHref({ category: "3D", sort: "Featured", q: "a b" })).toBe("/?category=3D&sort=Featured&q=a+b");
  });
  it("round-trips with parseGalleryQuery", () => {
    const query = { category: "Motion", sort: "Featured" as const, q: "loop" };
    const href = galleryHref(query);
    const sp = Object.fromEntries(new URL(href, "http://x").searchParams);
    expect(parseGalleryQuery(sp)).toEqual(query);
  });
});
