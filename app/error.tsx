"use client";

import Link from "next/link";
import { useEffect } from "react";
import Logo from "@/components/Logo";

export default function GalleryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[gallery] render failed:", error);
  }, [error]);

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <Logo className="size-8 text-[#16150f]" />
      <p className="mt-8 text-[13px] uppercase tracking-[0.14em] text-[#a8a396]">Something broke</p>
      <h1 className="display mt-3 text-[24px] font-semibold sm:text-[28px]">
        The case would not open.
      </h1>
      <p className="mt-3 max-w-[40ch] text-[15px] text-[#736f65]">
        The gallery hit an error while loading. Try again; if it keeps happening the
        archive storage may be unreachable.
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-[12px] text-[#a8a396]">ref {error.digest}</p>
      ) : null}
      <div className="mt-7 flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="focus-ring inline-flex h-10 items-center rounded-full bg-[#16150f] px-5 text-[14px] font-medium text-white transition-colors hover:bg-black"
        >
          Try again
        </button>
        <Link
          href="/"
          className="focus-ring inline-flex h-10 items-center rounded-full border border-[#e7e3da] bg-white px-5 text-[14px] font-medium text-[#16150f] transition-colors hover:border-[#d5cfc2]"
        >
          Back to the gallery
        </Link>
      </div>
    </main>
  );
}
