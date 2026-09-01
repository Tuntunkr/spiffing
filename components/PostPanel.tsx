"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SubscribeForm from "./SubscribeForm";
import type { Post } from "@/lib/types";

const CTRL =
  "focus-ring flex size-9 items-center justify-center rounded-full border border-[#e7e3da] bg-white text-[#736f65] transition-colors hover:border-[#d5cfc2] hover:text-[#16150f]";

type Props = { post: Post; prevId?: string; nextId?: string };

export default function PostPanel({ post, prevId, nextId }: Props) {
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

  return (
    <aside className="flex w-full flex-col border-t border-[#e7e3da] bg-[#faf9f7] lg:min-h-full lg:w-[clamp(360px,30vw,480px)] lg:shrink-0 lg:border-l lg:border-t-0">
      <div className="flex flex-1 flex-col px-5 py-5 sm:px-7 lg:px-7 lg:py-6 xl:px-9 min-[1700px]:px-11">
        <nav aria-label="Post navigation" className="flex items-center justify-between">
          <Link href="/" aria-label="Back to gallery" className={CTRL}>
            <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">
              <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
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
          <Link
            href={`/?category=${encodeURIComponent(post.category)}`}
            className="focus-ring inline-flex h-7 items-center rounded-full border border-[#e7e3da] bg-white px-3 text-[13px] text-[#736f65] transition-colors hover:border-[#d5cfc2] hover:text-[#16150f]"
          >
            {post.category}
          </Link>

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
                {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-[#e7e3da] py-3">
              <dt className="text-[#a8a396]">Frames</dt>
              <dd className="text-[#16150f] tabular-nums">{post.slides}</dd>
            </div>
          </dl>

          <a
            href={post.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#16150f] px-4 text-[15px] font-medium text-white transition-colors hover:bg-black"
          >
            View the original
            <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">
              <path d="M4 1h8v8M12 1L1 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </a>
        </div>

        <div className="mt-auto pt-12">
          <SubscribeForm variant="panel" />
          <p className="mt-3 text-center text-[13px] text-[#a8a396]">
            One email a week. Nothing else.
          </p>
        </div>
      </div>
    </aside>
  );
}
