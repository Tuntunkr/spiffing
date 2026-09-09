import Link from "next/link";
import { CATEGORIES } from "@/lib/types";
import { galleryHref, type GalleryQuery } from "@/lib/gallery-url";
import { getCounts } from "@/lib/posts";
import SortDropdown from "./SortDropdown";

const CHIP =
  "focus-ring inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[14px] transition-colors duration-150";
const ACTIVE = "bg-[#16150f] text-white";
const IDLE =
  "border border-[#e7e3da] bg-white text-[#736f65] hover:border-[#d5cfc2] hover:text-[#16150f]";

export default async function FilterBar({ query }: { query: GalleryQuery }) {
  const counts = await getCounts(query.q);

  const chips = [{ label: "All", value: "All" }].concat(
    CATEGORIES.map((c) => ({ label: c, value: c })),
  );

  return (
    <div className="mx-auto flex max-w-[1680px] items-center gap-3 px-4 pb-6 pt-8 sm:px-6 xl:px-8 min-[1700px]:px-12">
      <nav
        aria-label="Filter by category"
        className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-max items-center gap-2">
          {chips.map(({ label, value }) => {
            const isActive = query.category === value;
            return (
              <Link
                key={label}
                href={galleryHref({ ...query, category: value })}
                data-category={value}
                aria-current={isActive ? "page" : undefined}
                className={`${CHIP} ${isActive ? ACTIVE : IDLE}`}
              >
                {label}
                <span
                  className={`text-[12px] tabular-nums ${isActive ? "text-white/55" : "text-[#a8a396]"}`}
                >
                  {counts[label] ?? 0}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
      <SortDropdown query={query} />
    </div>
  );
}
