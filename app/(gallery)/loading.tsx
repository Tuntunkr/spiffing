import Logo from "@/components/Logo";

const SKELETON_RATIOS = ["4/5", "1/1", "3/4", "4/3", "4/5", "1/1", "3/4", "4/5", "1/1", "4/3", "3/4", "4/5"];

/** Gallery skeleton: same masthead, chips and grid shape as the real page. */
export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading the gallery" className="min-h-[100dvh]">
      <header className="border-b border-[#e7e3da] bg-[#faf9f7]">
        <div className="mx-auto flex h-[68px] max-w-[1680px] items-center justify-between px-4 sm:px-6 xl:h-[76px] xl:px-8 min-[1700px]:px-12">
          <div className="flex items-center gap-2.5 text-[#16150f]">
            <Logo className="size-[26px]" />
            <span className="display text-[17px] font-semibold">Vitrine</span>
          </div>
          <div className="hidden h-9 w-[420px] rounded-full bg-[#eeebe4] sm:block" />
          <div className="h-4 w-12 rounded bg-[#eeebe4]" />
        </div>
      </header>

      <div className="mx-auto max-w-[1680px] px-4 pb-8 pt-10 sm:px-6 xl:px-8 min-[1700px]:px-12">
        <div className="h-9 w-[min(420px,80%)] rounded-lg bg-[#eeebe4] sm:h-11" />
        <div className="mt-5 h-4 w-[min(520px,90%)] rounded bg-[#eeebe4]" />
      </div>

      <div className="mx-auto flex max-w-[1680px] items-center gap-2 px-4 pb-6 sm:px-6 xl:px-8 min-[1700px]:px-12">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 w-20 shrink-0 rounded-full bg-[#eeebe4]" />
        ))}
      </div>

      <div className="mx-auto max-w-[1680px] px-4 pb-20 sm:px-6 xl:px-8 min-[1700px]:px-12">
        <div className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-3 min-[1440px]:grid-cols-4">
          {SKELETON_RATIOS.map((ratio, i) => (
            <div
              key={i}
              className="skeleton rounded-xl bg-[#eeebe4]"
              style={{ aspectRatio: ratio, animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
