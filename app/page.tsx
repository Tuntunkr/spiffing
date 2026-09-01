import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import Feed from "@/components/Feed";
import Footer from "@/components/Footer";
import { getPosts } from "@/lib/posts";
import { CATEGORIES, SORTS, type Sort } from "@/lib/types";

type Props = {
  searchParams: Promise<{ category?: string; sort?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  const sp = await searchParams;

  const category =
    sp.category && (CATEGORIES as readonly string[]).includes(sp.category)
      ? sp.category
      : "All";
  const sort: Sort = (SORTS as readonly string[]).includes(sp.sort ?? "")
    ? (sp.sort as Sort)
    : "Latest";

  const posts = await getPosts(category, sort);

  return (
    <main className="min-h-[100dvh] w-full max-w-full overflow-x-clip">
      <Header />

      <div className="mx-auto max-w-[1680px] px-4 pb-8 pt-10 sm:px-6 xl:px-8 min-[1700px]:px-12">
        <h1 className="display max-w-[19ch] text-[30px] font-semibold leading-[1.08] sm:text-[38px] xl:text-[46px]">
          Design worth keeping.
        </h1>
        <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-[#736f65] xl:text-[16px]">
          A working archive of interface, brand and print work. New pieces land every
          week — the shelf stays small on purpose.
        </p>
      </div>

      <FilterBar active={category} sort={sort} />

      <div className="mx-auto max-w-[1680px] px-4 pb-20 sm:px-6 xl:px-8 min-[1700px]:px-12">
        <Feed posts={posts} />
      </div>

      <Footer />
    </main>
  );
}
