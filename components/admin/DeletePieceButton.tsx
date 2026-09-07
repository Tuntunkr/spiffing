"use client";

import { useFormStatus } from "react-dom";

export default function DeletePieceButton({ title }: { title: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm(`Remove “${title}” from the gallery? This deletes its artwork too.`)) {
          e.preventDefault();
        }
      }}
      className="focus-ring inline-flex h-10 items-center gap-2 rounded-full border border-[#efd6cf] bg-white px-4 text-[14px] font-medium text-[#c2452c] transition-colors hover:border-[#c2452c] hover:bg-[#fdf6f4] disabled:opacity-50"
    >
      <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">
        <path d="M2 3.5h9M5 3.5V2h3v1.5M3 3.5l.6 7a1 1 0 0 0 1 .9h3.8a1 1 0 0 0 1-.9l.6-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      {pending ? "Removing…" : "Remove"}
    </button>
  );
}
