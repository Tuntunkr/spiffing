"use client";

import { useEffect, useState } from "react";
import type { Post } from "@/lib/types";

/**
 * The detail-view canvas. Click (or Enter) opens the piece at full size;
 * Escape closes it. The Escape listener runs in the capture phase and stops
 * the event, so the panel's own Escape-to-gallery shortcut does not fire while
 * the lightbox is open.
 */
export default function Artwork({ post }: { post: Post }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey, true);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View ${post.title} at full size`}
        className="focus-ring group block cursor-zoom-in rounded-xl"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.media.src}
          alt={post.title}
          width={post.media.width}
          height={post.media.height}
          fetchPriority="high"
          className="max-h-[calc(100dvh-96px)] w-auto max-w-full rounded-xl object-contain shadow-[0_24px_60px_-24px_rgba(22,21,15,0.35)] transition-transform duration-300 group-hover:scale-[1.005]"
        />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={post.title}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-[#16150f]/95 p-4 backdrop-blur-sm"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.media.src}
            alt={post.title}
            width={post.media.width}
            height={post.media.height}
            className="max-h-full max-w-full object-contain"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close full-size view"
            className="focus-ring absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">
              <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </button>
        </div>
      ) : null}
    </>
  );
}
