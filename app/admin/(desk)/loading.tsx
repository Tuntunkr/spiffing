export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading the desk">
      <div className="h-9 w-40 rounded-lg bg-[#eeebe4] sm:h-11" />
      <div className="mt-3 h-4 w-[min(420px,90%)] rounded bg-[#eeebe4]" />
      <div className="mt-8 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-20 rounded-full bg-[#eeebe4]" />
        ))}
      </div>
      <div className="mt-8 overflow-hidden rounded-2xl border border-[#e7e3da] bg-white">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-[#e7e3da] px-4 py-3.5 last:border-b-0 sm:px-5">
            <div className="skeleton size-14 rounded-lg bg-[#eeebe4]" style={{ animationDelay: `${i * 80}ms` }} />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-[#eeebe4]" />
              <div className="h-3 w-1/4 rounded bg-[#eeebe4]" />
            </div>
            <div className="h-4 w-10 rounded bg-[#eeebe4]" />
          </div>
        ))}
      </div>
    </main>
  );
}
