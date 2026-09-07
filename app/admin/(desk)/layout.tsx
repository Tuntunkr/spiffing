import Link from "next/link";
import Logo from "@/components/Logo";
import { logoutAdmin } from "../auth-actions";
import { requireAdmin } from "@/lib/admin";

export default async function DeskLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="min-h-[100dvh] bg-[#faf9f7]">
      <header className="sticky top-0 z-40 border-b border-[#e7e3da] bg-[#faf9f7]/85 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1100px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="focus-ring flex items-center gap-2.5 text-[#16150f]">
              <Logo className="size-[24px]" />
              <span className="display text-[17px] font-semibold">Desk</span>
            </Link>
            <nav aria-label="Admin" className="hidden items-center gap-5 text-[14px] sm:flex">
              <Link href="/admin" className="focus-ring text-[#16150f]">
                Pieces
              </Link>
              <Link href="/admin/new" className="focus-ring text-[#736f65] hover:text-[#16150f]">
                New
              </Link>
              <Link href="/admin/settings" className="focus-ring text-[#736f65] hover:text-[#16150f]">
                Settings
              </Link>
              <Link href="/" className="focus-ring text-[#736f65] hover:text-[#16150f]">
                Gallery
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden max-w-[22ch] truncate text-[13px] text-[#a8a396] sm:block">
              {session.email}
            </span>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="focus-ring text-[14px] text-[#736f65] hover:text-[#16150f]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 sm:py-12">{children}</div>
    </div>
  );
}
