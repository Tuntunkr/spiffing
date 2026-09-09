export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading the desk">
      <div className="h-3 w-16 rounded bg-[#e7e3da]" />
      <div className="mt-3 h-10 w-44 rounded-lg bg-[#e7e3da] sm:h-12" />
      <div className="mt-3 h-4 w-[min(420px,90%)] rounded bg-[#eeebe4]" />
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-[88px] rounded-[1.15rem] border border-[#e7e3da] bg-white" />
        ))}
      </div>
      <div className="mt-8 overflow-hidden rounded-[1.25rem] border border-[#e7e3da] bg-white">
        <div className="flex gap-2 border-b border-[#e7e3da] px-4 py-3.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-20 rounded-full bg-[#eeebe4]" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-[#e7e3da] px-4 py-3.5 last:border-b-0 sm:px-5"
          >
            <div className="skeleton size-16 rounded-xl bg-[#eeebe4]" style={{ animationDelay: `${i * 80}ms` }} />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-[#eeebe4]" />
              <div className="h-3 w-1/4 rounded bg-[#eeebe4]" />
            </div>
            <div className="h-8 w-14 rounded-full bg-[#eeebe4]" />
          </div>
        ))}
      </div>
    </main>
  );
}
