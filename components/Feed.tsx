"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import PostCard from "./PostCard";
import EmptyShelf from "./EmptyShelf";
import { galleryHref, type GalleryQuery } from "@/lib/gallery-url";
import type { Post } from "@/lib/types";

const PAGE = 16;

export default function Feed({ posts, query }: { posts: Post[]; query: GalleryQuery }) {
  const [count, setCount] = useState(Math.min(PAGE, posts.length));
  const sentinelRef = useRef<HTMLDivElement>(null);

  // A new filter/sort/search remounts the feed (keyed by the parent), so the
  // page counter starts over without an effect.

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
      <div className="feed-grid">
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
