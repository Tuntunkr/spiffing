import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import GalleryScreen from "@/components/GalleryScreen";
import { galleryRedirectTarget, parseGalleryQuery, queryStringFromRecord } from "@/lib/gallery-url";
import { getPosts } from "@/lib/posts";
import { galleryMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return galleryMetadata(parseGalleryQuery(await searchParams));
}

export default async function HomePage({ searchParams }: Props) {
  const raw = await searchParams;
  const query = parseGalleryQuery(raw);
  const dest = galleryRedirectTarget("/", queryStringFromRecord(raw));
  if (dest) permanentRedirect(dest);
  const posts = await getPosts("All", "Latest", query.q);
  return <GalleryScreen query={{ ...query, category: "All", sort: "Latest" }} posts={posts} canonical="/" />;
}
