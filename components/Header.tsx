import Link from "next/link";
import { galleryHref, type GalleryQuery } from "@/lib/gallery-url";
import { getAllPosts } from "@/lib/posts";
import { SITE_NAME } from "@/lib/site";
import Logo from "./Logo";
import SearchForm from "./SearchForm";

const NAV =
  "focus-ring text-[15px] text-[#736f65] transition-colors hover:text-[#16150f] aria-[current=page]:font-medium aria-[current=page]:text-[#16150f]";

export type HeaderCurrent = "gallery" | "featured" | "about" | "howto" | "submit" | "none";

const SUBMIT =
  "focus-ring inline-flex h-9 shrink-0 items-center rounded-full bg-[#16150f] px-4 text-[14px] font-medium text-white transition-[opacity,transform] hover:opacity-85 active:scale-[0.98]";

export default async function Header({
  query = { category: "All", sort: "Latest", q: "" },
  current = "gallery",
  search = true,
}: {
  query?: GalleryQuery;
  current?: HeaderCurrent;
  search?: boolean;
}) {
  const count = search ? (await getAllPosts()).length : 0;
  const featured = query.sort === "Featured";
  const galleryCurrent = current === "gallery" && !featured;
  const featuredCurrent = current === "featured" || (current === "gallery" && featured);

  return (
    <header className="sticky top-0 z-40 border-b border-[#e7e3da] bg-[#faf9f7]/85 backdrop-blur-md">
      <div
        className={`mx-auto flex max-w-[1680px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:h-[68px] sm:flex-nowrap sm:py-0 sm:px-6 xl:h-[76px] xl:px-8 min-[1700px]:px-12`}
      >
        <div className="flex min-w-0 shrink-0 items-center gap-7">
          <Link
            aria-label={`${SITE_NAME} home`}
            className="focus-ring flex items-center gap-2.5 text-[#16150f]"
            href="/"
          >
            <Logo className="size-[26px]" />
            <span className="display text-[17px] font-semibold xl:text-[18px]">{SITE_NAME}</span>
          </Link>

          <nav
            aria-label="Primary"
            className={`items-center gap-5 ${current === "none" || !search ? "flex" : "hidden min-[1100px]:flex"}`}
          >
            <Link className={NAV} href="/" aria-current={galleryCurrent ? "page" : undefined}>
              Gallery
            </Link>
            <Link
              className={`${NAV} ${search ? "hidden min-[1100px]:inline" : "hidden sm:inline"}`}
              href={galleryHref({ sort: "Featured" })}
              aria-current={featuredCurrent ? "page" : undefined}
            >
              Featured
            </Link>
            {search ? null : (
              <>
                <Link className={NAV} href="/what-is" aria-current={current === "about" ? "page" : undefined}>
                  What is this
                </Link>
                <Link className={NAV} href="/how-to-use" aria-current={current === "howto" ? "page" : undefined}>
                  How to use
                </Link>
              </>
            )}
          </nav>
        </div>

        {search ? (
          <>
            <div className="order-3 min-w-0 basis-full sm:order-none sm:flex-1 sm:basis-auto sm:max-w-[420px] xl:max-w-[460px]">
              <SearchForm key={query.q} query={query} />
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
              <nav aria-label="Guides" className="hidden items-center gap-5 min-[1280px]:flex">
                <Link className={NAV} href="/what-is" aria-current={current === "about" ? "page" : undefined}>
                  What is this
                </Link>
                <Link className={NAV} href="/how-to-use" aria-current={current === "howto" ? "page" : undefined}>
                  How to use
                </Link>
              </nav>
              <p className="hidden shrink-0 items-center gap-2 text-[14px] text-[#736f65] min-[1680px]:flex">
                <span aria-hidden="true" className="size-[7px] rounded-full bg-[#c2452c]" />
                <span className="tabular-nums">{count}</span> pieces
              </p>
              <Link className={SUBMIT} href="/submit" aria-current={current === "submit" ? "page" : undefined}>
                Submit
              </Link>
            </div>
          </>
        ) : (
          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            <p className="hidden items-center gap-2 text-[14px] text-[#736f65] sm:flex">
              <span aria-hidden="true" className="size-[7px] rounded-full bg-[#c2452c]" />
              A working archive
            </p>
            <Link className={SUBMIT} href="/submit" aria-current={current === "submit" ? "page" : undefined}>
              Submit
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
