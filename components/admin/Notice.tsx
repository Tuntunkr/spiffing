"use client";

import { useEffect, useState } from "react";

/**
 * A transient confirmation after a redirect (published / updated / removed).
 * Strips its own query flag so a refresh does not repeat it. Native
 * replaceState (which Next syncs with) keeps the server from re-rendering the
 * page — a router.replace would drop the flag and unmount this notice at once.
 */
export default function Notice({ message, param }: { message: string; param: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has(param)) {
      url.searchParams.delete(param);
      window.history.replaceState(window.history.state, "", url);
    }
    const t = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(t);
  }, [param]);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="notice-enter mb-6 flex items-center justify-between gap-4 rounded-2xl border border-[#d6e6d0] bg-[#eef6ea] px-4 py-3.5 text-[14px] text-[#2f5d28]"
    >
      <span className="flex items-center gap-2.5">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <circle cx="7" cy="7" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 7l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {message}
      </span>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
        className="focus-ring flex size-7 items-center justify-center rounded-full text-[#2f5d28]/70 hover:bg-[#2f5d28]/10"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
