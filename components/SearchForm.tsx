"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { galleryHref, MAX_QUERY, shelfPath, type GalleryQuery } from "@/lib/gallery-url";

/**
 * A plain GET form, so it works before hydration and the result is a normal
 * linkable URL. Category and sort ride along as hidden fields.
 */
export default function SearchForm({ query, autoFocus }: { query: GalleryQuery; autoFocus?: boolean }) {
  // Remounted by the parent (keyed on the query) whenever the URL changes.
  const [value, setValue] = useState(query.q);
  const inputRef = useRef<HTMLInputElement>(null);

  // "/" focuses search from anywhere on the gallery, like most archives.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <form
      role="search"
      action={shelfPath(query.category, query.sort === "Featured" && query.category === "All" ? "Featured" : "Latest")}
      method="get"
      className="flex w-full items-center gap-1 rounded-full border border-[#e7e3da] bg-white py-1 pl-3.5 pr-1 transition-colors focus-within:border-[#c9c3b6]"
    >
      {query.sort === "Featured" && query.category !== "All" ? (
        <input type="hidden" name="sort" value="Featured" />
      ) : null}
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0 text-[#a8a396]">
        <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <label htmlFor="gallery-search" className="sr-only">
        Search the archive
      </label>
      <input
        ref={inputRef}
        id="gallery-search"
        name="q"
        type="search"
        value={value}
        maxLength={MAX_QUERY}
        autoFocus={autoFocus}
        autoComplete="off"
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search pieces, designers…"
        className="ios-no-focus-zoom min-w-0 flex-1 bg-transparent py-1 text-[14px] text-[#16150f] outline-none placeholder:text-[#9c988d] [&::-webkit-search-cancel-button]:hidden"
      />
      {query.q ? (
        <Link
          href={galleryHref({ ...query, q: "" })}
          aria-label="Clear search"
          className="focus-ring flex size-7 shrink-0 items-center justify-center rounded-full text-[#736f65] transition-colors hover:bg-[#f4f2ee] hover:text-[#16150f]"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </Link>
      ) : (
        <kbd
          aria-hidden="true"
          className="hidden h-6 shrink-0 items-center rounded-md border border-[#e7e3da] px-1.5 font-sans text-[11px] text-[#a8a396] md:inline-flex"
        >
          /
        </kbd>
      )}
      <button type="submit" className="sr-only">
        Search
      </button>
    </form>
  );
}
