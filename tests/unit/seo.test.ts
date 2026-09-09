import { describe, expect, it } from "vitest";
import { galleryMetadata, pieceAlt, pieceDescription, pieceMetadata, pieceTitle } from "@/lib/seo";
import { collectIndexableDescriptions, collectIndexableTitles, HOME_SEO, SHELF_SEO } from "@/lib/seo";
import { SEED_POSTS } from "@/lib/seed";
import { buildSitemapEntries } from "@/lib/sitemap-entries";

describe("indexable route metadata", () => {
  it("gives every static indexable page a unique title", () => {
    const titles = collectIndexableTitles();
    expect(titles.every((title) => title.length > 10)).toBe(true);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("gives every static indexable page a unique description", () => {
    const descriptions = collectIndexableDescriptions();
    expect(descriptions.every((d) => d.length >= 70)).toBe(true);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("homes and shelves are indexable with self-canonicals", () => {
    const home = galleryMetadata({ category: "All", sort: "Latest", q: "" });
    expect(home.alternates).toMatchObject({ canonical: "/" });
    expect(home.robots).toMatchObject({ index: true });
    expect(home.title).toEqual({ absolute: HOME_SEO.title });

    const web = galleryMetadata({ category: "Web", sort: "Latest", q: "" });
    expect(web.alternates).toMatchObject({ canonical: "/web" });
    expect(web.title).toEqual({ absolute: SHELF_SEO.web.title });
  });

  it("search and in-shelf featured sorts are noindex", () => {
    const search = galleryMetadata({ category: "Web", sort: "Latest", q: "dashboard" });
    expect(search.robots).toMatchObject({ index: false, follow: true });
    expect(search.alternates).toMatchObject({ canonical: "/web" });

    const mixed = galleryMetadata({ category: "Web", sort: "Featured", q: "" });
    expect(mixed.robots).toMatchObject({ index: false, follow: true });
  });
});

describe("piece metadata", () => {
  it("builds a unique title and description for every seed piece", () => {
    const titles = SEED_POSTS.map(pieceTitle);
    const descriptions = SEED_POSTS.map(pieceDescription);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
    for (const post of SEED_POSTS) {
      const meta = pieceMetadata(post);
      expect(meta.alternates).toMatchObject({ canonical: `/posts/${post.id}` });
      expect(meta.robots).toMatchObject({ index: true });
      expect(JSON.stringify(meta.openGraph)).toContain("article");
      expect(meta.openGraph?.images).toBeTruthy();
      expect(JSON.stringify(meta.twitter)).toContain("summary_large_image");
      expect(pieceAlt(post).length).toBeGreaterThan(8);
    }
  });
});

describe("sitemap entries", () => {
  it("lists only canonical indexable paths", async () => {
    const rows = await buildSitemapEntries();
    const urls = rows.map((row) => row.url);
    expect(urls.some((url) => url.endsWith("/"))).toBe(true);
    expect(urls.some((url) => url.includes("/what-is"))).toBe(true);
    expect(urls.some((url) => url.includes("/how-to-use"))).toBe(true);
    expect(urls.some((url) => url.includes("/submit"))).toBe(true);
    expect(urls.some((url) => url.includes("/web"))).toBe(true);
    expect(urls.some((url) => url.includes("/featured"))).toBe(true);
    expect(urls.some((url) => url.includes("/posts/"))).toBe(true);
    expect(urls.every((url) => !url.includes("?category="))).toBe(true);
    expect(urls.every((url) => !url.includes("?q="))).toBe(true);
    expect(urls.every((url) => !url.includes("/admin"))).toBe(true);
    expect(new Set(urls).size).toBe(urls.length);
  });
});
