import { describe, expect, it } from "vitest";
import { mergePosts, parseCatalog } from "@/lib/catalog";
import { searchPosts, sortPosts } from "@/lib/posts";
import { SEED_POSTS } from "@/lib/seed";
import { CATEGORIES, type Post } from "@/lib/types";

function post(overrides: Partial<Post> & { id: string }): Post {
  return {
    title: overrides.id,
    description: "",
    concept: "",
    category: "Web",
    creator: { handle: "someone", avatar: "/creators/creator-1.svg" },
    media: { src: "/x.png", width: 100, height: 100 },
    slides: 1,
    sourceUrl: "",
    featured: false,
    publishedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("searchPosts", () => {
  const posts = [
    post({ id: "a", title: "Ledger pricing", description: "tiers", creator: { handle: "quiet", avatar: "" } }),
    post({ id: "b", title: "Atlas brand", category: "Branding", creator: { handle: "loud", avatar: "" } }),
    post({ id: "c", title: "Loop", description: "motion ledger", category: "Motion", creator: { handle: "x", avatar: "" } }),
    post({ id: "d", title: "Quiet", concept: "mossforge lime accent" }),
  ];
  it("returns everything for an empty query", () => {
    expect(searchPosts(posts, "   ")).toHaveLength(4);
  });
  it("matches title, description, concept, handle and category, case-insensitively", () => {
    expect(searchPosts(posts, "LEDGER").map((p) => p.id)).toEqual(["a", "c"]);
    expect(searchPosts(posts, "loud").map((p) => p.id)).toEqual(["b"]);
    expect(searchPosts(posts, "branding").map((p) => p.id)).toEqual(["b"]);
    expect(searchPosts(posts, "mossforge").map((p) => p.id)).toEqual(["d"]);
  });
  it("requires every word to match", () => {
    expect(searchPosts(posts, "ledger motion").map((p) => p.id)).toEqual(["c"]);
    expect(searchPosts(posts, "ledger nothing")).toEqual([]);
  });
});

describe("sortPosts", () => {
  const posts = [
    post({ id: "old", publishedAt: "2025-01-01T00:00:00.000Z", featured: true }),
    post({ id: "new", publishedAt: "2026-06-01T00:00:00.000Z" }),
    post({ id: "mid", publishedAt: "2026-01-01T00:00:00.000Z", featured: true }),
  ];
  it("Latest is newest first", () => {
    expect(sortPosts(posts, "Latest").map((p) => p.id)).toEqual(["new", "mid", "old"]);
  });
  it("Featured puts featured first, then newest", () => {
    expect(sortPosts(posts, "Featured").map((p) => p.id)).toEqual(["mid", "old", "new"]);
  });
  it("does not mutate the input", () => {
    const copy = [...posts];
    sortPosts(posts, "Latest");
    expect(posts).toEqual(copy);
  });
});

describe("mergePosts", () => {
  it("keeps uploads first and drops duplicate ids from the rest", () => {
    const merged = mergePosts([post({ id: "a" }), post({ id: "b" })], [post({ id: "b" }), post({ id: "c" })]);
    expect(merged.map((p) => p.id)).toEqual(["a", "b", "c"]);
  });
});

describe("seed gallery", () => {
    it("ships at least two pieces in every category so each tab is testable", () => {
    for (const category of CATEGORIES) {
      const n = SEED_POSTS.filter((p) => p.category === category).length;
      expect(n, category).toBeGreaterThanOrEqual(2);
    }
  });
  it("gives every piece a concept note for the detail band", () => {
    expect(SEED_POSTS.every((p) => p.concept.length > p.description.length)).toBe(true);
  });
});

describe("parseCatalog", () => {
  it("returns [] for anything that is not an array", () => {
    expect(parseCatalog(null)).toEqual([]);
    expect(parseCatalog({})).toEqual([]);
    expect(parseCatalog("[]")).toEqual([]);
  });
  it("drops malformed rows and fills defaults", () => {
    const rows = [
      post({ id: "ok" }),
      { id: "no-media", title: "x" },
      { ...post({ id: "bad-cat" }), category: "Memes" },
      { ...post({ id: "loose" }), slides: undefined, sourceUrl: undefined, featured: "yes", concept: undefined },
    ];
    const parsed = parseCatalog(rows);
    expect(parsed.map((p) => p.id)).toEqual(["ok", "loose"]);
    expect(parsed[1]).toMatchObject({ slides: 1, sourceUrl: "", featured: false, concept: "" });
  });
});
