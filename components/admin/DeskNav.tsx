"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  {
    href: "/admin",
    label: "Pieces",
    match: (p: string) => p === "/admin" || /^\/admin\/[^/]+\/edit$/.test(p),
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
        <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
        <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
        <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
        <rect x="9" y="9" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    href: "/admin/submissions",
    label: "Inbox",
    match: (p: string) => p.startsWith("/admin/submissions"),
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
        <rect x="2" y="3" width="12" height="10" rx="1.4" stroke="currentColor" strokeWidth="1.4" />
        <path d="M2.5 4.5L8 9l5.5-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/admin/new",
    label: "New",
    match: (p: string) => p === "/admin/new",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/admin/settings",
    label: "Settings",
    match: (p: string) => p.startsWith("/admin/settings"),
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
        <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M8 1.6v1.5M8 12.9v1.5M1.6 8h1.5M12.9 8h1.5M3.3 3.3l1.1 1.1M11.6 11.6l1.1 1.1M3.3 12.7l1.1-1.1M11.6 4.4l1.1-1.1"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

/** Desk navigation. Rail on large screens, a compact strip on phones. */
export default function DeskNav({
  variant = "bar",
  pending = 0,
}: {
  variant?: "rail" | "bar" | "mobile";
  pending?: number;
}) {
  const pathname = usePathname();

  if (variant === "rail") {
    return (
      <nav aria-label="Desk" className="flex flex-col gap-1 px-3">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          const showCount = item.href === "/admin/submissions" && pending > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`focus-ring flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] transition-colors duration-150 ${
                active
                  ? "bg-[#16150f] font-medium text-white"
                  : "text-[#736f65] hover:bg-white hover:text-[#16150f]"
              }`}
            >
              <span className={active ? "text-white" : "text-[#a8a396]"}>{item.icon}</span>
              {item.label}
              {showCount ? (
                <span className={`ml-auto tabular-nums text-[12px] ${active ? "text-white/70" : "text-[#c2452c]"}`}>
                  {pending}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    );
  }

  const mobile = variant === "mobile";

  return (
    <nav
      aria-label="Desk"
      className={
        mobile
          ? "flex items-center gap-1 overflow-x-auto border-t border-[#e7e3da] px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          : "hidden items-center gap-1 sm:flex"
      }
    >
      {ITEMS.map((item) => {
        const active = item.match(pathname);
        const showCount = item.href === "/admin/submissions" && pending > 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`focus-ring relative inline-flex items-center gap-1.5 rounded-full px-3 text-[14px] transition-colors ${
              mobile ? "h-11 rounded-none" : "h-9"
            } ${active ? "font-medium text-[#16150f]" : "text-[#736f65] hover:text-[#16150f]"}`}
          >
            {item.label}
            {showCount ? <span className="tabular-nums text-[12px] text-[#c2452c]">{pending}</span> : null}
            {active ? (
              <span
                aria-hidden="true"
                className={
                  mobile
                    ? "absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-[#16150f]"
                    : "absolute inset-x-3 -bottom-[13px] h-[2px] rounded-full bg-[#16150f]"
                }
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
