import Link from "next/link";
import type { Post } from "@/lib/types";

const VISIBLE = 16;

/**
 * Server-rendered text index so crawlers can reach pieces beyond the
 * first infinite-scroll page without loading every image.
 */
export default function ShelfLinks({ posts }: { posts: Post[] }) {
  if (posts.length <= VISIBLE) return null;
  const rest = posts.slice(VISIBLE);
  return (
    <section className="mt-16 border-t border-[#e7e3da] pt-10" aria-labelledby="shelf-index">
      <h2 id="shelf-index" className="text-[12px] uppercase tracking-[0.12em] text-[#a8a396]">
        Also on this shelf
      </h2>
      <ul className="mt-4 columns-1 gap-x-10 sm:columns-2 xl:columns-3">
        {rest.map((post) => (
          <li key={post.id} className="break-inside-avoid border-b border-[#e7e3da]/80 py-2">
            <Link
              href={`/posts/${post.id}`}
              className="focus-ring group flex items-baseline justify-between gap-4 rounded-sm"
            >
              <span className="display text-[15px] font-medium text-[#16150f] group-hover:underline">
                {post.title}
              </span>
              <span className="shrink-0 text-[12px] text-[#a8a396]">{post.category}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
