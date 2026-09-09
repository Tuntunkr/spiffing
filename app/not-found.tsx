import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import SearchForm from "@/components/SearchForm";
import { CATEGORIES } from "@/lib/types";
import { galleryHref } from "@/lib/gallery-url";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

const LINK =
  "focus-ring inline-flex h-9 items-center rounded-full border border-[#e7e3da] bg-white px-4 text-[14px] text-[#16150f] transition-colors hover:border-[#d5cfc2]";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-[640px] flex-col items-center justify-center px-6 py-16 text-center">
      <Logo className="size-8 text-[#16150f]" />
      <p className="mt-8 text-[13px] uppercase tracking-[0.14em] text-[#a8a396]">404</p>
      <h1 className="display mt-3 text-[24px] font-semibold sm:text-[28px]">
        This piece has left the case.
      </h1>
      <p className="mt-3 max-w-[42ch] text-[15px] text-[#736f65]">
        It may have been removed from the {SITE_NAME} archive, or the link was never right.
      </p>

      <div className="mt-8 w-full max-w-[420px]">
        <SearchForm query={{ category: "All", sort: "Latest", q: "" }} />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <Link href="/" className={`${LINK} border-transparent bg-[#16150f] text-white hover:bg-black`}>
          Back to the gallery
        </Link>
        <Link href="/featured" className={LINK}>
          Featured
        </Link>
        {CATEGORIES.map((category) => (
          <Link key={category} href={galleryHref({ category })} className={LINK}>
            {category}
          </Link>
        ))}
      </div>
    </main>
  );
}
