"use client";

import { useEffect, useState } from "react";

const CTRL =
  "focus-ring inline-flex h-9 items-center gap-2 rounded-full border border-[#e7e3da] bg-white px-3.5 text-[13px] text-[#736f65] transition-colors hover:border-[#d5cfc2] hover:text-[#16150f]";

/** Native share sheet where there is one; otherwise copies the URL. */
export default function ShareButton({ title }: { title: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const t = setTimeout(() => setState("idle"), 2000);
    return () => clearTimeout(t);
  }, [state]);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch (error) {
      // The user dismissed the share sheet; nothing to report.
      if (error instanceof DOMException && error.name === "AbortError") return;
      setState("failed");
    }
  }

  return (
    <button type="button" onClick={share} className={CTRL} aria-live="polite">
      <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">
        <path d="M6.5 8V1.5M3.5 4.5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M1.5 7.5v3a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
      {state === "copied" ? "Link copied" : state === "failed" ? "Could not copy" : "Share"}
    </button>
  );
}
