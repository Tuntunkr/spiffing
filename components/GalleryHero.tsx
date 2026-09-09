import Link from "next/link";
import Logo from "./Logo";
import { galleryHref } from "@/lib/gallery-url";
import { pieceAlt } from "@/lib/seo";
import { CATEGORIES } from "@/lib/types";
import type { Post } from "@/lib/types";

const CTA =
  "focus-ring inline-flex h-11 items-center justify-center rounded-full px-5 text-[15px] font-medium transition-[opacity,transform] active:scale-[0.98]";

function stillsFrom(posts: Post[]): Post[] {
  const featured = posts.filter((p) => p.featured);
  const rest = posts.filter((p) => !p.featured);
  const seen = new Set<string>();
  const out: Post[] = [];
  for (const p of [...featured, ...rest]) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
    if (out.length === 3) break;
  }
  return out;
}

function Still({
  post,
  className = "",
  caption = true,
  delay = 0,
  priority = false,
}: {
  post: Post;
  className?: string;
  caption?: boolean;
  delay?: number;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/posts/${post.id}`}
      aria-label={post.title}
      style={{ animationDelay: `${delay}ms` }}
      className={`hero-still group/still focus-ring relative block min-h-0 overflow-hidden rounded-xl bg-[#f1efe9] ring-1 ring-[#e7e3da] transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(22,21,15,0.45)] hover:ring-[#d5cfc2] ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={post.media.src}
        alt={pieceAlt(post)}
        width={post.media.width}
        height={post.media.height}
        fetchPriority={priority ? "high" : "auto"}
        loading={priority ? "eager" : "lazy"}
        className="size-full object-cover transition-transform duration-500 ease-out group-hover/still:scale-[1.035]"
      />
      {caption ? (
        <span className="absolute inset-x-0 bottom-0 bg-[#faf9f7]/92 px-3 py-2">
          <span className="display block truncate text-[13px] font-medium leading-tight text-[#16150f]">
            {post.title}
          </span>
          <span className="mt-0.5 block text-[11px] text-[#a8a396]">{post.category}</span>
        </span>
      ) : null}
    </Link>
  );
}

function StillBoard({ stills }: { stills: Post[] }) {
  if (stills.length === 1) {
    return (
      <div className="aspect-[3/2] min-h-[200px]">
        <Still post={stills[0]} className="size-full" />
      </div>
    );
  }

  if (stills.length === 2) {
    return (
      <div className="grid h-[220px] grid-cols-2 gap-2.5 sm:h-[300px] lg:h-[340px]">
        {stills.map((post, i) => (
          <Still key={post.id} post={post} delay={i * 90} className="h-full" />
        ))}
      </div>
    );
  }

  const [lead, second, third] = stills;
  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:hidden">
        {stills.map((post, i) => (
          <Still key={post.id} post={post} delay={i * 90} caption={false} className="aspect-[3/2]" />
        ))}
      </div>
      <div className="hidden h-[360px] grid-cols-2 grid-rows-[minmax(0,1.7fr)_minmax(0,1fr)] gap-2.5 sm:grid lg:h-[440px]">
        <Still post={lead} delay={0} priority className="col-span-2 h-full" />
        <Still post={second} delay={90} className="h-full" />
        <Still post={third} delay={180} className="h-full" />
      </div>
    </>
  );
}

/** Landing masthead: split type + live stills, paper case, not a dark SaaS banner. */
export default function GalleryHero({ posts }: { posts: Post[] }) {
  const stills = stillsFrom(posts);
  const count = posts.length;

  return (
    <section className="mx-auto max-w-[1680px] px-4 pt-6 sm:px-6 sm:pt-8 xl:px-8 min-[1700px]:px-12">
      <div className="hero-case overflow-hidden rounded-[1.5rem] border border-[#e7e3da] sm:rounded-[1.75rem]">
        <div className="grid items-center gap-10 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-0 lg:px-14 lg:py-14 xl:px-16">
          <div className="lg:pr-12 xl:pr-16">
            <p className="flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-[#a8a396]">
              <span aria-hidden="true" className="size-[7px] shrink-0 rounded-full bg-[#c2452c]" />
              The archive
              {count > 0 ? (
                <>
                  <span aria-hidden="true" className="text-[#d5cfc2]">
                    ·
                  </span>
                  <span className="tabular-nums">
                    {count} {count === 1 ? "piece" : "pieces"}
                  </span>
                </>
              ) : null}
            </p>
            <h1 className="display mt-4 max-w-[12ch] text-[36px] font-semibold leading-[1.04] text-[#16150f] sm:text-[48px] xl:text-[56px]">
              Design worth keeping.
            </h1>
            <p className="mt-4 max-w-[36ch] text-[16px] leading-relaxed text-[#736f65] sm:text-[17px]">
              A working archive of interface, brand and print. Kept small on purpose.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/how-to-use" className={`${CTA} bg-[#16150f] text-white hover:opacity-85`}>
                How to use
              </Link>
              <Link
                href="/what-is"
                className={`${CTA} border border-[#e7e3da] bg-white text-[#16150f] hover:border-[#d5cfc2]`}
              >
                What is this
              </Link>
            </div>
            <nav aria-label="Categories" className="mt-6 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-[#736f65]">
              {CATEGORIES.map((category) => (
                <Link
                  key={category}
                  href={galleryHref({ category })}
                  data-category={category}
                  className="focus-ring rounded-sm underline-offset-4 hover:text-[#16150f] hover:underline"
                >
                  {category}
                </Link>
              ))}
              <Link href="/featured" className="focus-ring rounded-sm underline-offset-4 hover:text-[#16150f] hover:underline">
                Featured
              </Link>
            </nav>
          </div>

          <div className="min-w-0 lg:border-l lg:border-[#e7e3da] lg:pl-12 xl:pl-16">
            {stills.length === 0 ? (
              <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-white/70 ring-1 ring-[#e7e3da]">
                <Logo className="size-16 text-[#16150f]" />
              </div>
            ) : (
              <div className="rounded-[1.15rem] bg-white/55 p-2 ring-1 ring-[#e7e3da] sm:p-2.5">
                <StillBoard stills={stills} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
