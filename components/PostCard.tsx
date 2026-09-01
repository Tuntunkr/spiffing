import Link from "next/link";
import type { Post } from "@/lib/types";

export default function PostCard({ post, priority }: { post: Post; priority?: boolean }) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="focus-ring group relative block overflow-hidden rounded-xl bg-[#f1efe9] ring-1 ring-inset ring-black/[0.06] transition-shadow duration-300 hover:shadow-[0_16px_40px_-12px_rgba(22,21,15,0.28)]"
      style={{ aspectRatio: `${post.media.width}/${post.media.height}` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={post.media.src}
        alt={post.title}
        width={post.media.width}
        height={post.media.height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        className="absolute inset-0 size-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
      />

      {/* Caption scrim — hidden until hover so the artwork reads first. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3.5 pb-3 pt-10 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
        <p className="display truncate text-[14px] font-medium text-white">{post.title}</p>
        <div className="mt-1 flex items-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.creator.avatar}
            alt=""
            width={35}
            height={35}
            loading="lazy"
            className="size-[18px] rounded-full object-cover ring-1 ring-white/25"
          />
          <span className="truncate text-[12px] text-white/75">{post.creator.handle}</span>
        </div>
      </div>

      {/* Resting state: just the creator, bottom-left. */}
      <span className="absolute bottom-3 left-3 z-10 flex items-end transition-opacity duration-200 group-hover:opacity-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.creator.avatar}
          alt=""
          width={35}
          height={35}
          loading="lazy"
          className="size-7 shrink-0 rounded-full object-cover ring-2 ring-white/85 xl:size-[30px]"
        />
      </span>

      {post.slides > 1 && (
        <span className="absolute right-3 top-3 z-10 inline-flex h-[22px] items-center gap-1 rounded-full bg-black/45 px-2 text-[11px] font-medium leading-none text-white backdrop-blur-sm">
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <rect x="0.5" y="2.5" width="6" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M3.5 2V1a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-1" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
          <span className="sr-only">{post.slides} slides</span>
          <span aria-hidden="true">{post.slides}</span>
        </span>
      )}
    </Link>
  );
}
