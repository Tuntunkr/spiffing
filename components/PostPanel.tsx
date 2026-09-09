"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ShareButton from "./ShareButton";
import { galleryHref } from "@/lib/gallery-url";
import { pieceAlt } from "@/lib/seo";
import type { Post } from "@/lib/types";

const CTRL =
  "focus-ring flex size-9 items-center justify-center rounded-full border border-[#e7e3da] bg-white text-[#736f65] transition-colors hover:border-[#d5cfc2] hover:text-[#16150f]";

type Props = { post: Post; prevId?: string; nextId?: string; related: Post[] };

export default function PostPanel({ post, prevId, nextId, related }: Props) {
  const router = useRouter();

  // Arrow keys page through the archive; Escape returns to the gallery.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/");
      if (e.key === "ArrowLeft" && prevId) router.push(`/posts/${prevId}`);
      if (e.key === "ArrowRight" && nextId) router.push(`/posts/${nextId}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, prevId, nextId]);

  const added = new Date(post.publishedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <aside className="flex w-full flex-col border-t border-[#e7e3da] bg-[#faf9f7] lg:min-h-full lg:w-[clamp(360px,30vw,480px)] lg:shrink-0 lg:border-l lg:border-t-0">
      <div className="flex flex-1 flex-col px-5 py-5 sm:px-7 lg:px-7 lg:py-6 xl:px-9 min-[1700px]:px-11">
        <nav aria-label="Post navigation" className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-full border border-[#e7e3da] bg-white pl-2.5 pr-3 text-[13px] font-medium text-[#16150f] transition-colors hover:border-[#d5cfc2]"
          >
            <svg width="15" height="12" viewBox="0 0 15 12" aria-hidden="true">
              <path
                d="M6 1L1 6l5 5M1 6h13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            Gallery
          </Link>
          <div className="flex items-center gap-2">
            {prevId ? (
              <Link href={`/posts/${prevId}`} aria-label="Previous piece" className={CTRL}>
                <svg width="17" height="12" viewBox="0 0 17 12" aria-hidden="true">
                  <path d="M6 1L1 6l5 5M1 6h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </Link>
            ) : (
              <span aria-hidden="true" className={`${CTRL} opacity-35`} />
            )}
            {nextId ? (
              <Link href={`/posts/${nextId}`} aria-label="Next piece" className={CTRL}>
                <svg width="17" height="12" viewBox="0 0 17 12" aria-hidden="true">
                  <path d="M11 1l5 5-5 5M16 6H1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </Link>
            ) : (
              <span aria-hidden="true" className={`${CTRL} opacity-35`} />
            )}
          </div>
        </nav>

        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={galleryHref({ category: post.category })}
              className="focus-ring inline-flex h-7 items-center rounded-full border border-[#e7e3da] bg-white px-3 text-[13px] text-[#736f65] transition-colors hover:border-[#d5cfc2] hover:text-[#16150f]"
            >
              {post.category}
            </Link>
            {post.featured ? (
              <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[#16150f] px-3 text-[12px] font-medium text-white">
                <span aria-hidden="true" className="size-[5px] rounded-full bg-[#c2452c]" />
                Featured
              </span>
            ) : null}
          </div>

          <h1 className="display mt-5 text-[24px] font-semibold leading-[1.15] xl:text-[27px]">
            {post.title}
          </h1>

          <p className="mt-4 text-[15px] leading-relaxed text-[#4d4a42]">{post.description}</p>

          <dl className="mt-8 space-y-0 border-t border-[#e7e3da] text-[14px]">
            <div className="flex items-center justify-between gap-4 border-b border-[#e7e3da] py-3">
              <dt className="text-[#a8a396]">Designer</dt>
              <dd className="flex items-center gap-2 text-[#16150f]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.creator.avatar}
                  alt=""
                  width={22}
                  height={22}
                  className="size-[22px] rounded-full object-cover"
                />
                {post.creator.handle}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-[#e7e3da] py-3">
              <dt className="text-[#a8a396]">Added</dt>
              <dd className="text-[#16150f]">
                <time dateTime={post.publishedAt}>{added}</time>
              </dd>
            </div>
            {post.slides > 1 ? (
              <div className="flex items-center justify-between gap-4 border-b border-[#e7e3da] py-3">
                <dt className="text-[#a8a396]">Frames</dt>
                <dd className="text-[#16150f] tabular-nums">{post.slides}</dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-4 border-b border-[#e7e3da] py-3">
              <dt className="text-[#a8a396]">Size</dt>
              <dd className="text-[#16150f] tabular-nums">
                {post.media.width} × {post.media.height}
              </dd>
            </div>
          </dl>

          <div className="mt-7 flex flex-col gap-3">
            {post.sourceUrl ? (
              <a
                href={post.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#16150f] px-4 text-[15px] font-medium text-white transition-colors hover:bg-black"
              >
                View the original
                <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">
                  <path d="M4 1h8v8M12 1L1 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </a>
            ) : null}
            <div className="flex items-center gap-2">
              <ShareButton title={post.title} />
              <span className="hidden text-[12px] text-[#a8a396] sm:inline">
                ← → to browse · Esc to close
              </span>
            </div>
          </div>
        </div>

        {related.length > 0 ? (
          <div className="mt-auto pt-12">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[12px] uppercase tracking-[0.12em] text-[#a8a396]">
                Related {post.category.toLowerCase()} design
              </h2>
              <Link
                href={galleryHref({ category: post.category })}
                className="focus-ring text-[13px] text-[#736f65] hover:text-[#16150f]"
              >
                See all
              </Link>
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {related.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/posts/${p.id}`}
                    className="focus-ring group relative block aspect-[4/5] overflow-hidden rounded-lg bg-[#f1efe9] ring-1 ring-inset ring-black/[0.06]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.media.src}
                      alt={pieceAlt(p)}
                      width={p.media.width}
                      height={p.media.height}
                      loading="lazy"
                      className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
