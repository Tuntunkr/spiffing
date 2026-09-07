import Link from "next/link";
import Logo from "./Logo";
import { CATEGORIES } from "@/lib/types";
import { galleryHref } from "@/lib/gallery-url";
import { getAllPosts } from "@/lib/posts";

const LINK =
  "focus-ring text-[14px] text-[#736f65] transition-colors hover:text-[#16150f]";

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[12px] uppercase tracking-[0.12em] text-[#a8a396]">{title}</h2>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

export default async function Footer() {
  const posts = await getAllPosts();
  const latest = posts.map((p) => p.publishedAt).sort().at(-1);
  const year = new Date().getUTCFullYear();
  // Split the categories so the column does not run longer than its neighbours.
  const half = Math.ceil(CATEGORIES.length / 2);

  return (
    <footer className="mt-8 border-t border-[#e7e3da] bg-[#f4f2ed]">
      <div className="mx-auto max-w-[1680px] px-4 py-14 sm:px-6 xl:px-8 xl:py-16 min-[1700px]:px-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-8">
          <div className="max-w-[34ch]">
            <Link
              href="/"
              aria-label="Vitrine home"
              className="focus-ring inline-flex items-center gap-2.5 text-[#16150f]"
            >
              <Logo className="size-[24px]" />
              <span className="display text-[17px] font-semibold">Vitrine</span>
            </Link>
            <p className="mt-4 text-[14px] leading-relaxed text-[#736f65]">
              A working archive of interface, brand and print design. Collected weekly,
              kept small on purpose.
            </p>
            <p className="mt-5 flex items-center gap-2 text-[13px] text-[#a8a396]">
              <span aria-hidden="true" className="size-[6px] rounded-full bg-[#c2452c]" />
              <span className="tabular-nums">{posts.length}</span> pieces
              {latest ? (
                <>
                  {" · last added "}
                  <time dateTime={latest}>
                    {new Date(latest).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      timeZone: "UTC",
                    })}
                  </time>
                </>
              ) : null}
            </p>
          </div>

          <Column title="Browse">
            <li>
              <Link href="/" className={LINK}>
                Everything
              </Link>
            </li>
            {CATEGORIES.slice(0, half).map((c) => (
              <li key={c}>
                <Link href={galleryHref({ category: c })} className={LINK}>
                  {c}
                </Link>
              </li>
            ))}
          </Column>

          <Column title="More">
            {CATEGORIES.slice(half).map((c) => (
              <li key={c}>
                <Link href={galleryHref({ category: c })} className={LINK}>
                  {c}
                </Link>
              </li>
            ))}
            <li>
              <Link href={galleryHref({ sort: "Featured" })} className={LINK}>
                Featured
              </Link>
            </li>
          </Column>

          <Column title="Follow">
            <li>
              <a href="/feed.xml" className={LINK} type="application/rss+xml">
                RSS feed
              </a>
            </li>
            <li>
              <Link href="/sitemap.xml" className={LINK}>
                Sitemap
              </Link>
            </li>
            <li>
              <Link href="/admin" className={LINK}>
                Desk sign in
              </Link>
            </li>
          </Column>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-[#e7e3da] pt-6 text-[13px] text-[#a8a396] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Vitrine</p>
          <p className="sm:text-right">Set in Inter · Built with Next.js · Artwork generated for this archive</p>
        </div>
      </div>
    </footer>
  );
}
