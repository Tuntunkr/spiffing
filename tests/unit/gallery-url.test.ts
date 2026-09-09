import { describe, expect, it } from "vitest";
import {
  galleryHref,
  galleryRedirectTarget,
  isIndexableGallery,
  isIndexableShelf,
  MAX_QUERY,
  parseGalleryHref,
  parseGalleryQuery,
  parseShelf,
  shelfPath,
} from "@/lib/gallery-url";

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
  it("uses clean shelf paths", () => {
    expect(galleryHref({ category: "Web" })).toBe("/web");
    expect(galleryHref({ category: "3D" })).toBe("/3d");
    expect(galleryHref({ sort: "Featured" })).toBe("/featured");
    expect(galleryHref({ category: "3D", sort: "Featured", q: "a b" })).toBe("/3d?sort=Featured&q=a+b");
  });
  it("round-trips with parseGalleryHref", () => {
    const query = { category: "Motion", sort: "Featured" as const, q: "loop" };
    expect(parseGalleryHref(galleryHref(query))).toEqual(query);
  });
});

describe("galleryRedirectTarget", () => {
  it("moves leftover query shelves in one hop and keeps search", () => {
    expect(galleryRedirectTarget("/", "?category=Web")).toBe("/web");
    expect(galleryRedirectTarget("/", "?category=Web&q=ledger")).toBe("/web?q=ledger");
    expect(galleryRedirectTarget("/", "?sort=Featured")).toBe("/featured");
    expect(galleryRedirectTarget("/web", "?category=Print")).toBe("/print");
    expect(galleryRedirectTarget("/featured", "?sort=Featured")).toBe("/featured");
  });
  it("leaves canonical and search URLs alone", () => {
    expect(galleryRedirectTarget("/", "")).toBeNull();
    expect(galleryRedirectTarget("/", "?q=dashboard")).toBeNull();
    expect(galleryRedirectTarget("/web", "")).toBeNull();
    expect(galleryRedirectTarget("/web", "?sort=Featured")).toBeNull();
    expect(galleryRedirectTarget("/web", "?q=ledger")).toBeNull();
  });
});

describe("parseShelf", () => {
  it("maps known slugs", () => {
    expect(parseShelf("web")).toEqual({ slug: "web", category: "Web", sort: "Latest" });
    expect(parseShelf("featured")).toEqual({ slug: "featured", category: "All", sort: "Featured" });
  });
  it("rejects unknown slugs", () => {
    expect(parseShelf("admin")).toBeNull();
    expect(parseShelf("search")).toBeNull();
  });
});

describe("indexability", () => {
  it("indexes home and clean shelves only", () => {
    expect(isIndexableGallery({ category: "All", sort: "Latest", q: "" })).toBe(true);
    expect(isIndexableShelf({ category: "Web", sort: "Latest", q: "" })).toBe(true);
    expect(isIndexableShelf({ category: "All", sort: "Featured", q: "" })).toBe(true);
    expect(isIndexableShelf({ category: "Web", sort: "Latest", q: "dash" })).toBe(false);
    expect(isIndexableShelf({ category: "Web", sort: "Featured", q: "" })).toBe(false);
  });
  it("builds the featured shelf path", () => {
    expect(shelfPath("All", "Featured")).toBe("/featured");
    expect(shelfPath("Web", "Latest")).toBe("/web");
  });
});
