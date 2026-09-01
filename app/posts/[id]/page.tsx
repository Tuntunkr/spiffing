import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PostPanel from "@/components/PostPanel";
import { getAllPosts, getPost, getNeighbours } from "@/lib/posts";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return (await getAllPosts()).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return { title: "Not found" };
  return { title: post.title, description: post.description };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  const { prev, next } = await getNeighbours(id);

  return (
    <main className="flex min-h-[100dvh] w-full flex-col lg:flex-row">
      <div className="flex flex-1 items-center justify-center bg-[#f1efe9] p-4 sm:p-10 lg:p-14">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.media.src}
          alt={post.title}
          width={post.media.width}
          height={post.media.height}
          className="max-h-[calc(100dvh-96px)] w-auto max-w-full rounded-xl object-contain shadow-[0_24px_60px_-24px_rgba(22,21,15,0.35)]"
        />
      </div>
      <PostPanel post={post} prevId={prev?.id} nextId={next?.id} />
    </main>
  );
}
