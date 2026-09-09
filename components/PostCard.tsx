"use client";

import { useState } from "react";
import Link from "next/link";
import { pieceAlt } from "@/lib/seo";
import type { Post } from "@/lib/types";

/** Cover + one tighter crop; a third crop when the piece has extra frames. */
const CROPS = ["50% 0%", "50% 42%", "50% 100%"] as const;

export default function PostCard({ post, priority }: { post: Post; priority?: boolean }) {
  const thumbs = post.slides > 1 ? 3 : 2;
  const [view, setView] = useState(0);
  const crop = CROPS[Math.min(view, CROPS.length - 1)];

  return (
    <div className="group/card relative flex h-full flex-col overflow-hidden rounded-xl bg-white ring-1 ring-[#e7e3da] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-16px_rgba(22,21,15,0.22)]">
      <Link
        href={`/posts/${post.id}`}
        aria-label={post.title}
        className="focus-ring absolute inset-0 z-10 rounded-xl"
      />

      <div className="relative aspect-[3/2] overflow-hidden bg-[#f1efe9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.media.src}
          alt={pieceAlt(post)}
          width={post.media.width}
          height={post.media.height}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          className="absolute inset-0 size-full object-cover"
          style={{ objectPosition: crop }}
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5 pt-3 sm:p-6 sm:pt-3">
        <div className="relative z-20 -m-1 flex gap-2 overflow-x-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {Array.from({ length: thumbs }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show ${post.title} preview ${i + 1}`}
              aria-pressed={view === i}
              onClick={() => setView(i)}
              className={`aspect-[3/2] h-[44px] shrink-0 overflow-hidden rounded-md bg-[#faf9f7] p-0 shadow-sm transition sm:h-[52px] ${
                view === i ? "ring-2 ring-[#16150f]" : "ring-1 ring-[#e7e3da] hover:ring-[#d5cfc2]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.media.src}
                alt=""
                width={post.media.width}
                height={post.media.height}
                className="size-full object-cover"
                style={{ objectPosition: CROPS[i] }}
              />
            </button>
          ))}
        </div>

        <div className="flex items-start justify-between gap-3">
          <h2 className="display min-w-0 text-[17px] font-medium leading-snug text-[#16150f] sm:text-[18px]">
            {post.title}
          </h2>
          {post.featured ? (
            <span className="relative z-20 shrink-0 rounded border border-[#c2452c]/25 bg-[#f8ece8] px-2 py-0.5 text-[11px] font-medium tabular-nums text-[#c2452c]">
              Featured
            </span>
          ) : null}
        </div>

        <p className="line-clamp-2 text-[13px] leading-relaxed text-[#736f65] sm:text-[14px]">
          {post.description}
        </p>

        <p className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-medium text-[#16150f]">
          <span>{post.category}</span>
          <span className="inline-flex items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.creator.avatar}
              alt=""
              width={16}
              height={16}
              className="size-4 rounded-full object-cover"
            />
            {post.creator.handle}
          </span>
          {post.slides > 1 ? <span>{post.slides} frames</span> : null}
        </p>
      </div>
    </div>
  );
}
