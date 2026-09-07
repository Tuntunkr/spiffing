import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import DeskNav from "@/components/admin/DeskNav";
import { logoutAdmin } from "../auth-actions";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: { default: "Desk", template: "%s — Desk" },
  robots: { index: false, follow: false },
};

export default async function DeskLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="min-h-[100dvh] bg-[#faf9f7]">
      <header className="sticky top-0 z-40 border-b border-[#e7e3da] bg-[#faf9f7]/85 backdrop-blur-md">
        <div className="mx-auto flex h-[64px] max-w-[1100px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="focus-ring flex items-center gap-2.5 text-[#16150f]">
              <Logo className="size-[24px]" />
              <span className="display text-[17px] font-semibold">Desk</span>
            </Link>
            <DeskNav />
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden max-w-[22ch] truncate text-[13px] text-[#a8a396] md:block" title={session.email}>
              {session.email}
            </span>
            <Link href="/" className="focus-ring hidden text-[14px] text-[#736f65] hover:text-[#16150f] sm:block">
              View gallery
            </Link>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="focus-ring inline-flex h-9 items-center rounded-full border border-[#e7e3da] bg-white px-3.5 text-[13px] font-medium text-[#16150f] transition-colors hover:border-[#d5cfc2]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
        <DeskNav mobile />
      </header>
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 sm:py-12">{children}</div>
    </div>
  );
}
