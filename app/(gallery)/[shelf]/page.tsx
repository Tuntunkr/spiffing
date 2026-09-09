import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import GalleryScreen from "@/components/GalleryScreen";
import { galleryHref, galleryRedirectTarget, parseGalleryQuery, parseShelf, queryStringFromRecord, SHELF_SLUGS } from "@/lib/gallery-url";
import { getPosts } from "@/lib/posts";
import { galleryMetadata, SHELF_SEO } from "@/lib/seo";

type Props = {
  params: Promise<{ shelf: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return SHELF_SLUGS.map((shelf) => ({ shelf }));
}

export const dynamicParams = false;

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const shelf = parseShelf((await params).shelf);
  if (!shelf) notFound();
  const extra = parseGalleryQuery(await searchParams);
  return galleryMetadata({
    category: extra.category !== "All" ? extra.category : shelf.category,
    sort: extra.sort !== "Latest" ? extra.sort : shelf.sort,
    q: extra.q,
  });
}

export default async function ShelfPage({ params, searchParams }: Props) {
  const shelf = parseShelf((await params).shelf);
  if (!shelf) notFound();

  const raw = await searchParams;
  const extra = parseGalleryQuery(raw);
  const query = {
    category: extra.category !== "All" ? extra.category : shelf.category,
    sort: extra.sort !== "Latest" ? extra.sort : shelf.sort,
    q: extra.q,
  };

  const dest = galleryRedirectTarget(`/${shelf.slug}`, queryStringFromRecord(raw));
  if (dest) permanentRedirect(dest);

  const posts = await getPosts(query.category, query.sort, query.q);
  const seo = SHELF_SEO[shelf.slug];
  return (
    <GalleryScreen
      query={query}
      posts={posts}
      heading={seo?.h1}
      intro={query.q ? undefined : seo?.intro}
      canonical={seo?.canonical ?? galleryHref({ category: query.category, sort: query.sort })}
    />
  );
}
