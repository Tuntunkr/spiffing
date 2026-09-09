import type { Post } from "./types";

function tokens(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2),
  );
}

function overlap(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const word of a) if (b.has(word)) n += 1;
  return n;
}

/**
 * Related pieces: same category first, then shared language in title/description,
 * then the same designer. Never random, never the piece itself.
 */
export function pickRelated(post: Post, pool: Post[], limit = 6): Post[] {
  const self = tokens(`${post.title} ${post.description} ${post.concept}`);
  const scored = pool
    .filter((p) => p.id !== post.id)
    .map((p) => {
      let score = 0;
      if (p.category === post.category) score += 5;
      if (p.creator.handle === post.creator.handle) score += 2;
      if (p.featured) score += 1;
      score += overlap(self, tokens(`${p.title} ${p.description}`));
      return { p, score };
    })
    .sort(
      (a, b) =>
        b.score - a.score || b.p.publishedAt.localeCompare(a.p.publishedAt),
    );

  const picked: Post[] = [];
  const seen = new Set<string>();
  for (const row of scored) {
    if (row.score <= 0) continue;
    picked.push(row.p);
    seen.add(row.p.id);
    if (picked.length >= limit) return picked;
  }
  for (const row of scored) {
    if (seen.has(row.p.id)) continue;
    picked.push(row.p);
    if (picked.length >= limit) break;
  }
  return picked;
}
