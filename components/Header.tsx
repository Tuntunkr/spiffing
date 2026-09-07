import Link from "next/link";
import { galleryHref, type GalleryQuery } from "@/lib/gallery-url";
import { getAllPosts } from "@/lib/posts";
import Logo from "./Logo";
import SearchForm from "./SearchForm";

const NAV =
  "focus-ring text-[15px] text-[#736f65] transition-colors hover:text-[#16150f] aria-[current=page]:font-medium aria-[current=page]:text-[#16150f]";

export default async function Header({ query }: { query: GalleryQuery }) {
  const count = (await getAllPosts()).length;
  const featured = query.sort === "Featured";

  return (
    <header className="sticky top-0 z-40 border-b border-[#e7e3da] bg-[#faf9f7]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1680px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:h-[68px] sm:flex-nowrap sm:py-0 sm:px-6 xl:h-[76px] xl:px-8 min-[1700px]:px-12">
        <div className="flex shrink-0 items-center gap-7">
          <Link
            aria-label="Vitrine home"
            className="focus-ring flex items-center gap-2.5 text-[#16150f]"
            href="/"
          >
            <Logo className="size-[26px]" />
            <span className="display text-[17px] font-semibold xl:text-[18px]">Vitrine</span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-6 min-[1100px]:flex">
            <Link className={NAV} href="/" aria-current={!featured ? "page" : undefined}>
              Gallery
            </Link>
            <Link
              className={NAV}
              href={galleryHref({ sort: "Featured" })}
              aria-current={featured ? "page" : undefined}
            >
              Featured
            </Link>
          </nav>
        </div>

        <div className="order-3 min-w-0 basis-full sm:order-none sm:flex-1 sm:basis-auto sm:max-w-[420px] xl:max-w-[460px]">
          <SearchForm key={query.q} query={query} />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-4 sm:ml-0">
          <p className="hidden items-center gap-2 text-[14px] text-[#736f65] min-[1480px]:flex">
            <span aria-hidden="true" className="size-[7px] rounded-full bg-[#c2452c]" />
            <span className="tabular-nums">{count}</span> pieces
          </p>
          <Link className={NAV} href="/admin">
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
