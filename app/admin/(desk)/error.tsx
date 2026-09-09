"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function DeskError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[desk] render failed:", error);
  }, [error]);

  return (
    <main className="rounded-[1.25rem] border border-[#e7e3da] bg-white px-6 py-16 text-center shadow-[0_16px_40px_-32px_rgba(22,21,15,0.4)]">
      <p className="text-[13px] uppercase tracking-[0.14em] text-[#a8a396]">Desk error</p>
      <h1 className="display mt-3 text-[22px] font-semibold">This page could not load.</h1>
      <p className="mx-auto mt-2 max-w-[44ch] text-[14px] leading-relaxed text-[#736f65]">
        Usually the catalog store was unreachable for a moment. Nothing was changed. Try
        again, or go back to the list.
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-[12px] text-[#a8a396]">ref {error.digest}</p>
      ) : null}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="focus-ring inline-flex h-10 items-center rounded-full bg-[#16150f] px-4 text-[14px] font-medium text-white hover:opacity-85"
        >
          Try again
        </button>
        <Link
          href="/admin"
          className="focus-ring inline-flex h-10 items-center rounded-full border border-[#e7e3da] px-4 text-[14px] font-medium text-[#16150f] hover:border-[#d5cfc2]"
        >
          All pieces
        </Link>
      </div>
    </main>
  );
}
