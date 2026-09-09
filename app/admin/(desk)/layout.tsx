import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import DeskNav from "@/components/admin/DeskNav";
import { logoutAdmin } from "../auth-actions";
import { requireAdmin } from "@/lib/admin";
import { countPending } from "@/lib/submissions";

export const metadata: Metadata = {
  title: { default: "Desk", template: "%s — Desk" },
  robots: { index: false, follow: false },
};

export default async function DeskLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const pending = await countPending();
  const initial = (session.email[0] ?? "A").toUpperCase();

  return (
    <div className="min-h-[100dvh] bg-[#f4f2ed] lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-[100dvh] flex-col border-r border-[#e7e3da] bg-[#faf9f7] lg:flex">
        <Link
          href="/admin"
          className="focus-ring mx-3 mt-4 flex items-center gap-2.5 rounded-xl px-3 py-3 text-[#16150f]"
        >
          <Logo className="size-[26px]" />
          <span className="display text-[18px] font-semibold">Desk</span>
        </Link>
        <div className="mt-4 flex-1">
          <DeskNav variant="rail" pending={pending} />
        </div>
        <div className="border-t border-[#e7e3da] p-3">
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#16150f] text-[12px] font-medium text-[#faf9f7]"
            >
              {initial}
            </span>
            <span className="min-w-0 truncate text-[12px] text-[#736f65]" title={session.email}>
              {session.email}
            </span>
          </div>
          <Link
            href="/"
            className="focus-ring mt-1 flex items-center rounded-xl px-3 py-2 text-[13px] text-[#736f65] transition-colors hover:bg-white hover:text-[#16150f]"
          >
            View gallery
          </Link>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="focus-ring mt-1 flex h-10 w-full items-center rounded-xl px-3 text-[13px] font-medium text-[#16150f] transition-colors hover:bg-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-[#e7e3da] bg-[#faf9f7]/90 backdrop-blur-md lg:hidden">
          <div className="flex h-[60px] items-center justify-between gap-3 px-4">
            <Link href="/admin" className="focus-ring flex items-center gap-2 text-[#16150f]">
              <Logo className="size-[22px]" />
              <span className="display text-[16px] font-semibold">Desk</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="max-w-[18ch] truncate text-[12px] text-[#a8a396]" title={session.email}>
                {session.email}
              </span>
              <form action={logoutAdmin}>
                <button
                  type="submit"
                  className="focus-ring inline-flex h-9 items-center rounded-full border border-[#e7e3da] bg-white px-3 text-[13px] font-medium text-[#16150f] transition-colors hover:border-[#d5cfc2]"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
          <DeskNav variant="mobile" pending={pending} />
        </header>

        <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">{children}</div>
      </div>
    </div>
  );
}
