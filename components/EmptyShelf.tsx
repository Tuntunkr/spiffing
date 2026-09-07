/** The shared empty state: an outlined display case with nothing in it. */
export default function EmptyShelf({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#e7e3da] px-6 py-16 text-center sm:py-20">
      <svg width="64" height="52" viewBox="0 0 64 52" aria-hidden="true" className="text-[#d5cfc2]">
        <rect x="1.5" y="1.5" width="61" height="41" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M1.5 34.5h61" stroke="currentColor" strokeWidth="1.5" />
        <path d="M20 48.5h24M32 42.5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="12" y="12" width="16" height="18" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
        <rect x="36" y="9" width="16" height="21" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
      <p className="display mt-6 text-[18px] font-semibold text-[#16150f]">{title}</p>
      <p className="mx-auto mt-2 max-w-[40ch] text-[14px] leading-relaxed text-[#736f65]">{body}</p>
      {children ? <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{children}</div> : null}
    </div>
  );
}
