import Link from "next/link";
import { getCatalogPosts } from "@/lib/catalog";
import { CATEGORIES } from "@/lib/types";

type Props = { searchParams: Promise<{ category?: string }> };

const CHIP =
  "focus-ring inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[14px] transition-colors duration-150";

export default async function AdminPage({ searchParams }: Props) {
  const { category: raw } = await searchParams;
  const category =
    raw && (CATEGORIES as readonly string[]).includes(raw) ? raw : "All";
  const all = await getCatalogPosts();
  const list = category === "All" ? all : all.filter((p) => p.category === category);

  const counts: Record<string, number> = { All: all.length };
  for (const c of CATEGORIES) counts[c] = 0;
  for (const p of all) counts[p.category] = (counts[p.category] ?? 0) + 1;

  const href = (value?: string) => (value ? `/admin?category=${encodeURIComponent(value)}` : "/admin");
  const chips = [{ label: "All", value: undefined as string | undefined }].concat(
    CATEGORIES.map((c) => ({ label: c, value: c })),
  );

  return (
    <main>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="display text-[28px] font-semibold leading-tight sm:text-[34px]">
            Pieces
          </h1>
          <p className="mt-2 max-w-[48ch] text-[15px] leading-relaxed text-[#736f65]">
            Upload into a category the gallery already filters on. New work lands
            first under Latest, and in that category chip.
          </p>
        </div>
        <Link
          href={category === "All" ? "/admin/new" : `/admin/new?category=${encodeURIComponent(category)}`}
          className="focus-ring inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#16150f] px-5 text-[15px] font-medium text-white hover:opacity-85"
        >
          Add {category === "All" ? "a piece" : category}
        </Link>
      </div>

      <nav aria-label="Filter by category" className="mt-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max items-center gap-2">
          {chips.map(({ label, value }) => {
            const active = category === label;
            return (
              <Link
                key={label}
                href={href(value)}
                aria-current={active ? "page" : undefined}
                className={`${CHIP} ${
                  active
                    ? "bg-[#16150f] text-white"
                    : "border border-[#e7e3da] bg-white text-[#736f65] hover:text-[#16150f]"
                }`}
              >
                {label}
                <span className={`text-[12px] tabular-nums ${active ? "text-white/55" : "text-[#a8a396]"}`}>
                  {counts[label] ?? 0}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {list.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-[#e7e3da] px-6 py-16 text-center">
          <p className="display text-[18px] font-semibold">Nothing uploaded yet</p>
          <p className="mx-auto mt-2 max-w-[40ch] text-[14px] leading-relaxed text-[#736f65]">
            The public gallery still shows the seed archive. The first piece you
            publish here appears at the top of Latest.
          </p>
          <Link
            href={category === "All" ? "/admin/new" : `/admin/new?category=${encodeURIComponent(category)}`}
            className="focus-ring mt-6 inline-flex h-10 items-center rounded-full bg-[#16150f] px-4 text-[14px] font-medium text-white"
          >
            Upload one
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-[#e7e3da] overflow-hidden rounded-2xl border border-[#e7e3da] bg-white">
          {list.map((post) => (
            <li key={post.id} className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.media.src}
                alt=""
                width={56}
                height={56}
                className="size-14 shrink-0 rounded-lg object-cover ring-1 ring-inset ring-black/[0.06]"
              />
              <div className="min-w-0 flex-1">
                <p className="display truncate text-[16px] font-medium">{post.title}</p>
                <p className="mt-0.5 truncate text-[13px] text-[#736f65]">
                  {post.category}
                  {post.featured ? " · Featured" : ""}
                  {" · "}
                  {post.creator.handle}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-[13px]">
                <Link
                  href={`/posts/${post.id}`}
                  className="focus-ring hidden text-[#736f65] hover:text-[#16150f] sm:inline"
                >
                  View
                </Link>
                <Link
                  href={`/admin/${post.id}/edit`}
                  className="focus-ring font-medium text-[#16150f]"
                >
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
