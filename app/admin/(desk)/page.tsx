import type { Metadata } from "next";
import Link from "next/link";
import EmptyShelf from "@/components/EmptyShelf";
import Notice from "@/components/admin/Notice";
import { getCatalogPosts } from "@/lib/catalog";
import { searchPosts, sortPosts } from "@/lib/posts";
import { getSettings } from "@/lib/settings";
import { CATEGORIES } from "@/lib/types";

export const metadata: Metadata = { title: "Pieces" };

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const CHIP =
  "focus-ring inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[14px] transition-colors duration-150";

function adminHref(category: string, q: string): string {
  const params = new URLSearchParams();
  if (category !== "All") params.set("category", category);
  if (q) params.set("q", q);
  const qs = params.toString();
  return qs ? `/admin?${qs}` : "/admin";
}

function newHref(category: string): string {
  return category === "All" ? "/admin/new" : `/admin/new?category=${encodeURIComponent(category)}`;
}

export default async function AdminPage({ searchParams }: Props) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const category = (CATEGORIES as readonly string[]).includes(one(sp.category)) ? one(sp.category) : "All";
  const q = one(sp.q).trim().slice(0, 80);

  const [all, settings] = await Promise.all([getCatalogPosts(), getSettings()]);
  const inCategory = category === "All" ? all : all.filter((p) => p.category === category);
  const list = sortPosts(searchPosts(inCategory, q), "Latest");

  const counts: Record<string, number> = { All: all.length };
  for (const c of CATEGORIES) counts[c] = 0;
  for (const p of all) counts[p.category] = (counts[p.category] ?? 0) + 1;

  const chips = [{ label: "All", value: "All" }].concat(CATEGORIES.map((c) => ({ label: c, value: c })));

  const notice = sp.published
    ? { param: "published", message: "Published. It is live at the top of Latest." }
    : sp.updated
      ? { param: "updated", message: "Saved. The gallery shows the new version." }
      : sp.removed
        ? { param: "removed", message: "Removed from the gallery." }
        : null;

  return (
    <main>
      {notice ? <Notice {...notice} /> : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="display text-[28px] font-semibold leading-tight sm:text-[34px]">Pieces</h1>
          <p className="mt-2 max-w-[48ch] text-[15px] leading-relaxed text-[#736f65]">
            {all.length === 0
              ? "Nothing published yet."
              : `${all.length} ${all.length === 1 ? "piece" : "pieces"} in the catalog.`}{" "}
            {settings.showSeed ? (
              <>
                The public gallery also shows the seed archive —{" "}
                <Link href="/admin/settings" className="focus-ring underline decoration-[#d5cfc2] underline-offset-4 hover:text-[#16150f]">
                  change that in Settings
                </Link>
                .
              </>
            ) : (
              "The public gallery shows exactly this list."
            )}
          </p>
        </div>
        <Link
          href={newHref(category)}
          className="focus-ring inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#16150f] px-5 text-[15px] font-medium text-white hover:opacity-85"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Add {category === "All" ? "a piece" : category}
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
        <nav
          aria-label="Filter by category"
          className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex w-max items-center gap-2">
            {chips.map(({ label, value }) => {
              const active = category === value;
              return (
                <Link
                  key={label}
                  href={adminHref(value, q)}
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
        <form role="search" action="/admin" method="get" className="flex h-9 w-full items-center gap-2 rounded-full border border-[#e7e3da] bg-white pl-3.5 pr-1.5 focus-within:border-[#c9c3b6] md:w-[260px]">
          {category !== "All" ? <input type="hidden" name="category" value={category} /> : null}
          <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0 text-[#a8a396]">
            <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <label htmlFor="admin-search" className="sr-only">
            Search pieces
          </label>
          <input
            id="admin-search"
            name="q"
            type="search"
            defaultValue={q}
            maxLength={80}
            placeholder="Search title, designer…"
            className="min-w-0 flex-1 bg-transparent text-[14px] text-[#16150f] outline-none placeholder:text-[#a8a396] [&::-webkit-search-cancel-button]:hidden"
          />
          {q ? (
            <Link href={adminHref(category, "")} aria-label="Clear search" className="focus-ring flex size-6 items-center justify-center rounded-full text-[#736f65] hover:bg-[#f4f2ee]">
              <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden="true">
                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </Link>
          ) : null}
        </form>
      </div>

      {list.length === 0 ? (
        <div className="mt-8">
          <EmptyShelf
            title={q ? `Nothing matches “${q}”` : category === "All" ? "Nothing uploaded yet" : `Nothing in ${category} yet`}
            body={
              q
                ? "Try a shorter search, or clear it to see the whole catalog."
                : "The first piece you publish appears at the top of Latest on the public gallery."
            }
          >
            {q ? (
              <Link href={adminHref(category, "")} className="focus-ring inline-flex h-10 items-center rounded-full border border-[#e7e3da] bg-white px-4 text-[14px] font-medium text-[#16150f] hover:border-[#d5cfc2]">
                Clear search
              </Link>
            ) : null}
            <Link href={newHref(category)} className="focus-ring inline-flex h-10 items-center rounded-full bg-[#16150f] px-4 text-[14px] font-medium text-white hover:opacity-85">
              Upload one
            </Link>
          </EmptyShelf>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-[#e7e3da] bg-white">
          <table className="w-full text-left text-[14px]">
            <caption className="sr-only">
              {list.length} {list.length === 1 ? "piece" : "pieces"}
              {category !== "All" ? ` in ${category}` : ""}
              {q ? ` matching “${q}”` : ""}
            </caption>
            <thead className="hidden border-b border-[#e7e3da] text-[12px] uppercase tracking-[0.08em] text-[#a8a396] sm:table-header-group">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">Piece</th>
                <th scope="col" className="px-3 py-3 font-medium">Category</th>
                <th scope="col" className="hidden px-3 py-3 font-medium lg:table-cell">Designer</th>
                <th scope="col" className="hidden px-3 py-3 font-medium md:table-cell">Added</th>
                <th scope="col" className="px-3 py-3 font-medium">Status</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7e3da]">
              {list.map((post) => (
                <tr key={post.id} className="group transition-colors hover:bg-[#faf9f7]">
                  <td className="px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-3.5">
                      <Link href={`/admin/${post.id}/edit`} className="focus-ring shrink-0 rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.media.src}
                          alt=""
                          width={56}
                          height={56}
                          loading="lazy"
                          className="size-14 rounded-lg object-cover ring-1 ring-inset ring-black/[0.06]"
                        />
                      </Link>
                      <div className="min-w-0">
                        <Link href={`/admin/${post.id}/edit`} className="focus-ring display block truncate text-[15px] font-medium text-[#16150f]">
                          {post.title}
                        </Link>
                        <p className="mt-0.5 truncate text-[13px] text-[#a8a396] sm:hidden">
                          {post.category} · @{post.creator.handle}
                        </p>
                        <p className="mt-0.5 hidden truncate font-mono text-[12px] text-[#a8a396] sm:block">/posts/{post.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-3 py-3 text-[#736f65] sm:table-cell">{post.category}</td>
                  <td className="hidden px-3 py-3 text-[#736f65] lg:table-cell">@{post.creator.handle}</td>
                  <td className="hidden px-3 py-3 tabular-nums text-[#736f65] md:table-cell">
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        timeZone: "UTC",
                      })}
                    </time>
                  </td>
                  <td className="hidden px-3 py-3 sm:table-cell">
                    {post.featured ? (
                      <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-[#16150f] px-2.5 text-[12px] font-medium text-white">
                        <span aria-hidden="true" className="size-[5px] rounded-full bg-[#c2452c]" />
                        Featured
                      </span>
                    ) : (
                      <span className="inline-flex h-6 items-center rounded-full border border-[#e7e3da] px-2.5 text-[12px] text-[#736f65]">
                        Live
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right sm:px-5">
                    <div className="inline-flex items-center gap-3 text-[13px]">
                      <Link href={`/posts/${post.id}`} className="focus-ring hidden text-[#736f65] hover:text-[#16150f] sm:inline">
                        View
                      </Link>
                      <Link href={`/admin/${post.id}/edit`} className="focus-ring font-medium text-[#16150f]">
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
