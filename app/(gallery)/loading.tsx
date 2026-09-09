import Logo from "@/components/Logo";
import { SITE_NAME } from "@/lib/site";

/** Gallery skeleton: same masthead, chips and card shape as the real page. */
export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading the gallery" className="min-h-[100dvh]">
      <header className="border-b border-[#e7e3da] bg-[#faf9f7]">
        <div className="mx-auto flex h-[68px] max-w-[1680px] items-center justify-between px-4 sm:px-6 xl:h-[76px] xl:px-8 min-[1700px]:px-12">
          <div className="flex items-center gap-2.5 text-[#16150f]">
            <Logo className="size-[26px]" />
            <span className="display text-[17px] font-semibold">{SITE_NAME}</span>
          </div>
          <div className="hidden h-9 w-[420px] rounded-full bg-[#eeebe4] sm:block" />
          <div className="h-4 w-12 rounded bg-[#eeebe4]" />
        </div>
      </header>

      <div className="mx-auto max-w-[1680px] px-4 pt-6 sm:px-6 sm:pt-8 xl:px-8 min-[1700px]:px-12">
        <div className="hero-case h-[min(420px,70vw)] rounded-[1.5rem] border border-[#e7e3da] sm:rounded-[1.75rem]" />
      </div>

      <div className="mx-auto flex max-w-[1680px] items-center gap-2 px-4 pb-6 sm:px-6 xl:px-8 min-[1700px]:px-12">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 w-20 shrink-0 rounded-full bg-[#eeebe4]" />
        ))}
      </div>

      <div className="mx-auto max-w-[1680px] px-4 pb-20 sm:px-6 xl:px-8 min-[1700px]:px-12">
        <div className="feed-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl bg-white ring-1 ring-[#e7e3da]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="skeleton aspect-[3/2] bg-[#eeebe4]" />
              <div className="space-y-3 p-5">
                <div className="flex gap-2">
                  <div className="h-[44px] w-[66px] rounded-md bg-[#eeebe4] sm:h-[52px] sm:w-[78px]" />
                  <div className="h-[44px] w-[66px] rounded-md bg-[#eeebe4] sm:h-[52px] sm:w-[78px]" />
                </div>
                <div className="h-5 w-3/4 rounded bg-[#eeebe4]" />
                <div className="h-8 w-full rounded bg-[#eeebe4]" />
                <div className="h-3 w-1/2 rounded bg-[#eeebe4]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
