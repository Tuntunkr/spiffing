"use client";

import { useEffect, useState } from "react";

/** Copies a short snippet (RSS URL, keyboard hint, desk path). */
export default function CopyBlock({
  label,
  value,
  filename,
}: {
  label: string;
  value: string;
  filename?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div className="overflow-hidden rounded-[1.15rem] border border-[#e7e3da] bg-[#16150f] text-[#faf9f7]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
        <p className="text-[12px] text-[#c9c3b6]">
          {filename ? <span className="font-mono">{filename}</span> : label}
        </p>
        <button
          type="button"
          className="focus-ring rounded-full px-2.5 py-1 text-[12px] text-[#faf9f7] hover:bg-white/10"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed text-[#faf9f7]">{value}</pre>
    </div>
  );
}
