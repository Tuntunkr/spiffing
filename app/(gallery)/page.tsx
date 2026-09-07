import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import Feed from "@/components/Feed";
import Footer from "@/components/Footer";
import { galleryHref, parseGalleryQuery } from "@/lib/gallery-url";
import { getPosts } from "@/lib/posts";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = parseGalleryQuery(await searchParams);
  const parts: string[] = [];
  if (query.q) parts.push(`“${query.q}”`);
  if (query.category !== "All") parts.push(query.category);
  if (query.sort !== "Latest") parts.push(query.sort);
  return {
    title: parts.length > 0 ? parts.join(" · ") : { absolute: "Vitrine — Design worth keeping" },
    alternates: { canonical: galleryHref(query) },
    // Filtered and searched views are near-duplicates of the root; keep them out of the index.
    robots: parts.length > 0 ? { index: false, follow: true } : undefined,
  };
}

export default async function HomePage({ searchParams }: Props) {
  const query = parseGalleryQuery(await searchParams);
  const posts = await getPosts(query.category, query.sort, query.q);
  const searching = query.q.length > 0;

  return (
    <div className="flex min-h-[100dvh] w-full max-w-full flex-col overflow-x-clip">
      <Header query={query} />

      <main className="flex-1">
      <div className="mx-auto max-w-[1680px] px-4 pb-8 pt-10 sm:px-6 xl:px-8 min-[1700px]:px-12">
        {searching ? (
          <>
            <p className="text-[13px] uppercase tracking-[0.14em] text-[#a8a396]">Search</p>
            <h1 className="display mt-2 max-w-[24ch] text-[26px] font-semibold leading-[1.1] sm:text-[32px] xl:text-[38px]">
              {posts.length === 0 ? "Nothing matches" : `${posts.length} ${posts.length === 1 ? "piece" : "pieces"}`}{" "}
              <span className="text-[#736f65]">for “{query.q}”</span>
            </h1>
            <p className="mt-4 text-[15px] text-[#736f65]">
              {query.category !== "All" ? `Within ${query.category}. ` : ""}
              <Link href={galleryHref({ ...query, q: "" })} className="focus-ring underline decoration-[#d5cfc2] underline-offset-4 hover:text-[#16150f]">
                Clear search
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="display max-w-[19ch] text-[30px] font-semibold leading-[1.08] sm:text-[38px] xl:text-[46px]">
              Design worth keeping.
            </h1>
            <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-[#736f65] xl:text-[16px]">
              A working archive of interface, brand and print work. New pieces land every
              week — the shelf stays small on purpose.
            </p>
          </>
        )}
      </div>

      <FilterBar query={query} />

      <div className="mx-auto max-w-[1680px] px-4 pb-20 sm:px-6 xl:px-8 min-[1700px]:px-12">
        <Feed key={galleryHref(query)} posts={posts} query={query} />
      </div>
      </main>

      <Footer />
    </div>
  );
}
