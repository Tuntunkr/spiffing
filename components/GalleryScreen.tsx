import Link from "next/link";
import Feed from "@/components/Feed";
import FilterBar from "@/components/FilterBar";
import Footer from "@/components/Footer";
import GalleryHero from "@/components/GalleryHero";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import SearchTracker from "@/components/SearchTracker";
import ShelfLinks from "@/components/ShelfLinks";
import { galleryHref, type GalleryQuery } from "@/lib/gallery-url";
import Breadcrumbs from "@/components/Breadcrumbs";
import { breadcrumbSchema, collectionSchema, graph, shelfBreadcrumbs } from "@/lib/schema";
import { SHELF_SEO } from "@/lib/seo";
import type { Post } from "@/lib/types";

type Props = {
  query: GalleryQuery;
  posts: Post[];
  heading?: string;
  intro?: string;
  canonical: string;
};

export default function GalleryScreen({ query, posts, heading, intro, canonical }: Props) {
  const searching = query.q.length > 0;
  const landing = !searching && query.category === "All" && query.sort === "Latest";
  const featured = !searching && query.category === "All" && query.sort === "Featured";
  const shelfKey =
    featured ? "featured" : query.category === "3D" ? "3d" : query.category.toLowerCase();
  const shelf = !landing && !searching ? SHELF_SEO[shelfKey] : undefined;
  const title = heading ?? (searching ? undefined : featured ? "Featured." : query.category !== "All" ? query.category : undefined);
  const blurb = intro ?? shelf?.intro;
  const crumbs = !landing && !searching ? galleryCrumbs(query) : null;

  return (
    <div className="flex min-h-[100dvh] w-full max-w-full flex-col overflow-x-clip">
      <JsonLd
        data={graph([
          ...(crumbs ? [breadcrumbSchema(crumbs)] : []),
          collectionSchema({
            name: shelf?.title ?? "Spiffing",
            description: shelf?.description ?? blurb ?? "A curated design archive.",
            path: canonical,
            posts,
          }),
        ])}
      />
      {searching ? <SearchTracker q={query.q} results={posts.length} /> : null}
      <Header query={query} current={featured ? "featured" : "gallery"} />

      <main className="flex-1">
        {landing ? (
          <GalleryHero posts={posts} />
        ) : (
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
                  <Link
                    href={galleryHref({ ...query, q: "" })}
                    className="focus-ring underline decoration-[#d5cfc2] underline-offset-4 hover:text-[#16150f]"
                  >
                    Clear search
                  </Link>
                </p>
              </>
            ) : (
              <>
                <Breadcrumbs crumbs={galleryCrumbs(query)} />
                <h1 className="display mt-4 max-w-[19ch] text-[30px] font-semibold leading-[1.08] sm:text-[38px] xl:text-[46px]">
                  {title?.endsWith(".") ? title : `${title}.`}
                </h1>
                <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-[#736f65] xl:text-[16px]">
                  {blurb ? `${blurb} ` : null}
                  {posts.length} {posts.length === 1 ? "piece" : "pieces"} on this shelf.
                </p>
              </>
            )}
          </div>
        )}

        <FilterBar query={query} />

        <div className="mx-auto max-w-[1680px] px-4 pb-20 sm:px-6 xl:px-8 min-[1700px]:px-12">
          <Feed key={galleryHref(query)} posts={posts} query={query} />
          <ShelfLinks posts={posts} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export function galleryCrumbs(query: GalleryQuery) {
  if (query.category === "All" && query.sort === "Featured") {
    return shelfBreadcrumbs("Featured", "/featured");
  }
  if (query.category !== "All") {
    return shelfBreadcrumbs(query.category, galleryHref({ category: query.category }));
  }
  return shelfBreadcrumbs("Gallery", "/");
}
