"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Pieces", match: (p: string) => p === "/admin" || /^\/admin\/[^/]+\/edit$/.test(p) },
  { href: "/admin/new", label: "New", match: (p: string) => p === "/admin/new" },
  { href: "/admin/settings", label: "Settings", match: (p: string) => p.startsWith("/admin/settings") },
];

/** Desk navigation with the current section marked. Inline on desktop, a strip on phones. */
export default function DeskNav({ mobile }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Desk"
      className={
        mobile
          ? "flex items-center gap-1 overflow-x-auto border-t border-[#e7e3da] px-3 sm:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          : "hidden items-center gap-1 sm:flex"
      }
    >
      {ITEMS.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`focus-ring relative inline-flex h-9 items-center rounded-full px-3 text-[14px] transition-colors ${
              active ? "font-medium text-[#16150f]" : "text-[#736f65] hover:text-[#16150f]"
            } ${mobile ? "h-11 rounded-none" : ""}`}
          >
            {item.label}
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
