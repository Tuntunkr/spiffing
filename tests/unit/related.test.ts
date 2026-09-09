import { describe, expect, it } from "vitest";
import { pickRelated } from "@/lib/related";
import { SEED_POSTS } from "@/lib/seed";

describe("pickRelated", () => {
  it("never includes the source piece and prefers the same category", () => {
    const post = SEED_POSTS.find((p) => p.title === "Orbit analytics") ?? SEED_POSTS[0];
    const related = pickRelated(post, SEED_POSTS, 6);
    expect(related).toHaveLength(6);
    expect(related.every((p) => p.id !== post.id)).toBe(true);
    expect(related.filter((p) => p.category === post.category).length).toBeGreaterThanOrEqual(3);
  });

  it("returns fewer when the pool is small", () => {
    const [a, b] = SEED_POSTS;
    expect(pickRelated(a, [a, b], 6)).toEqual([b]);
  });
});
