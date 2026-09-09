import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Artwork from "@/components/Artwork";
import Breadcrumbs from "@/components/Breadcrumbs";
import ConceptBand from "@/components/ConceptBand";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import PieceViewTracker from "@/components/PieceViewTracker";
import PostPanel from "@/components/PostPanel";
import { parseGalleryQuery } from "@/lib/gallery-url";
import { getAllPosts, getNeighbours, getPost, getRelated } from "@/lib/posts";
import { breadcrumbSchema, creativeWorkSchema, graph, organizationSchema, pieceBreadcrumbs, websiteSchema } from "@/lib/schema";
import { pieceMetadata } from "@/lib/seo";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return (await getAllPosts()).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).id);
  if (!post) return { title: "Not found", robots: { index: false, follow: true } };
  return pieceMetadata(post);
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  const [{ prev, next }, related] = await Promise.all([getNeighbours(id), getRelated(post)]);
  const crumbs = pieceBreadcrumbs(post);

  return (
    <div className="flex min-h-[100dvh] w-full flex-col">
      <JsonLd
        data={graph([
          organizationSchema(),
          websiteSchema(),
          breadcrumbSchema(crumbs),
          creativeWorkSchema(post),
        ])}
      />
      <PieceViewTracker id={post.id} title={post.title} category={post.category} />
      <Header query={parseGalleryQuery({})} current="none" />
      <main className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-[1680px] px-4 pt-4 sm:px-6 xl:px-8 min-[1700px]:px-12">
          <Breadcrumbs crumbs={crumbs} />
        </div>
        <div className="flex w-full flex-1 flex-col lg:flex-row">
          <div className="flex flex-1 items-center justify-center bg-[#f1efe9] p-4 sm:p-10 lg:p-14">
            <Artwork post={post} />
          </div>
          <PostPanel post={post} prevId={prev?.id} nextId={next?.id} related={related} />
        </div>
        <ConceptBand text={post.concept || post.description} />
      </main>
    </div>
  );
}
