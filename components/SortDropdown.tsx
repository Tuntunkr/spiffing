"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SORTS, type Sort } from "@/lib/types";
import { galleryHref, type GalleryQuery } from "@/lib/gallery-url";

export default function SortDropdown({ query }: { query: GalleryQuery }) {
  const sort = query.sort;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const href = (next: Sort) => galleryHref({ ...query, sort: next });

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="focus-ring inline-flex h-9 items-center gap-2 rounded-full border border-[#e7e3da] bg-white px-4 text-[14px] text-[#16150f] transition-colors hover:border-[#d5cfc2]"
      >
        <span className="hidden text-[#a8a396] sm:inline">Sort</span>
        {sort}
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          aria-hidden="true"
          className={`text-[#a8a396] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[150px] overflow-hidden rounded-xl border border-[#e7e3da] bg-white p-1 shadow-[0_12px_32px_rgba(22,21,15,0.1)]"
        >
          {SORTS.map((s) => (
            <Link
              key={s}
              role="menuitem"
              href={href(s)}
              data-filter={s}
              onClick={() => setOpen(false)}
              className={`focus-ring flex items-center justify-between rounded-lg px-3 py-2 text-[14px] transition-colors hover:bg-[#f4f2ee] ${
                s === sort ? "text-[#16150f]" : "text-[#736f65]"
              }`}
            >
              {s}
              {s === sort && (
                <svg width="12" height="10" viewBox="0 0 12 10" aria-hidden="true">
                  <path d="M1 5l3.5 3.5L11 1.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
