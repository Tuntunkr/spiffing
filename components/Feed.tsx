"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import PostCard from "./PostCard";
import EmptyShelf from "./EmptyShelf";
import { galleryHref, type GalleryQuery } from "@/lib/gallery-url";
import type { Post } from "@/lib/types";

const PAGE = 16;
/** Must match `grid-auto-rows` on .feed-grid in globals.css. */
const ROW_UNIT = 4;

export default function Feed({ posts, query }: { posts: Post[]; query: GalleryQuery }) {
  const [count, setCount] = useState(Math.min(PAGE, posts.length));
  const gridRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const lastWidthRef = useRef(0);

  // A new filter/sort/search remounts the feed (keyed by the parent), so the
  // page counter starts over without an effect.

  /*
   * Each article spans as many rows as its rendered card is tall, plus the
   * gap. The <a> sizes itself from the inline aspect-ratio, so this works
   * before any image has loaded — no layout shift as the gallery fills in.
   */
  const layout = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;
    // Row gap tracks the column gap, which is set per breakpoint in CSS.
    const gap = parseFloat(getComputedStyle(grid).columnGap) || 16;
    for (const child of Array.from(grid.children) as HTMLElement[]) {
      const card = child.firstElementChild as HTMLElement | null;
      if (!card) continue;
      const h = card.getBoundingClientRect().height;
      child.style.gridRowEnd = `span ${Math.ceil((h + gap) / ROW_UNIT)}`;
    }
  }, []);

  useLayoutEffect(() => {
    layout();
  }, [layout, count, posts]);

  /*
   * Only width changes matter. Re-running on height would loop forever: the
   * spans we write change the grid's height, which would retrigger the
   * observer that wrote them.
   */
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const onWidthChange = () => {
      const w = grid.clientWidth;
      if (w === lastWidthRef.current) return;
      lastWidthRef.current = w;
      layout();
    };

    const ro = new ResizeObserver(onWidthChange);
    ro.observe(grid);
    window.addEventListener("resize", onWidthChange);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onWidthChange);
    };
  }, [layout]);

  /*
   * Infinite scroll. IntersectionObserver is the cheap path, but it is
   * silently inert in some embedded/automation contexts, so a throttled
   * scroll check backs it up. Both funnel through the same guard, so a
   * double trigger just advances one page.
   */
  useEffect(() => {
    if (count >= posts.length) return;

    const loadMore = () => setCount((c) => Math.min(c + PAGE, posts.length));

    const el = sentinelRef.current;
    const io = el
      ? new IntersectionObserver(([entry]) => entry.isIntersecting && loadMore(), {
          rootMargin: "900px 0px",
        })
      : null;
    io?.observe(el!);

    // Throttled on a timestamp rather than rAF: rAF never runs in a hidden
    // tab, which would leave a "pending frame" latch stuck permanently.
    let last = 0;
    const onScroll = () => {
      const now = Date.now();
      if (now - last < 150) return;
      last = now;
      const remaining =
        document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      if (remaining < 900) loadMore();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll(); // the first screenful may already reach the end

    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [count, posts.length]);

  if (posts.length === 0) {
    const filtered = query.q || query.category !== "All";
    return (
      <EmptyShelf
        title={filtered ? "Nothing on this shelf" : "The archive is empty"}
        body={
          filtered
            ? "Try a broader search, or another category."
            : "Pieces published from the desk appear here, newest first."
        }
      >
        {filtered ? (
          <Link
            href={galleryHref({ sort: query.sort })}
            className="focus-ring inline-flex h-10 items-center rounded-full border border-[#e7e3da] bg-white px-4 text-[14px] font-medium text-[#16150f] transition-colors hover:border-[#d5cfc2]"
          >
            Show everything
          </Link>
        ) : null}
      </EmptyShelf>
    );
  }

  return (
    <>
      <div ref={gridRef} className="feed-grid">
        {posts.slice(0, count).map((post, i) => (
          <article
            key={post.id}
            className={i >= PAGE ? "card-enter" : undefined}
            style={i >= PAGE ? { animationDelay: `${((i - PAGE) % PAGE) * 28}ms` } : undefined}
          >
            <PostCard post={post} priority={i < 4} />
          </article>
        ))}
      </div>
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      {count < posts.length && (
        <p className="py-12 text-center text-[14px] text-[#a8a396]">Loading more…</p>
      )}
    </>
  );
}
