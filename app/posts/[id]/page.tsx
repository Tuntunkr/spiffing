import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Artwork from "@/components/Artwork";
import PostPanel from "@/components/PostPanel";
import { getAllPosts, getNeighbours, getPost, getRelated } from "@/lib/posts";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return (await getAllPosts()).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/posts/${post.id}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      images: [{ url: post.media.src, width: post.media.width, height: post.media.height, alt: post.title }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description, images: [post.media.src] },
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  const [{ prev, next }, related] = await Promise.all([getNeighbours(id), getRelated(post)]);

  return (
    <main className="flex min-h-[100dvh] w-full flex-col lg:flex-row">
      <div className="flex flex-1 items-center justify-center bg-[#f1efe9] p-4 sm:p-10 lg:p-14">
        <Artwork post={post} />
      </div>
      <PostPanel post={post} prevId={prev?.id} nextId={next?.id} related={related} />
    </main>
  );
}
