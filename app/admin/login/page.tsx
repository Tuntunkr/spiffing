import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import Logo from "@/components/Logo";
import { getAdminSession } from "@/lib/admin";

export const metadata: Metadata = { title: "Desk sign in" };

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-[400px]">
        <Link href="/" className="focus-ring mb-8 flex items-center justify-center gap-2.5 text-[#16150f]">
          <Logo className="size-[26px]" />
          <span className="display text-[17px] font-semibold">Vitrine</span>
        </Link>
        <div className="rounded-2xl border border-[#e7e3da] bg-white px-6 py-8 sm:px-8">
          <h1 className="display text-[26px] font-semibold">Desk</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-[#736f65]">
            Only the archive admin can sign in here. Public Join accounts cannot
            publish to the gallery.
          </p>
          <div className="mt-7">
            <LoginForm />
          </div>
        </div>
        <p className="mt-6 text-center text-[13px] text-[#a8a396]">
          <Link href="/" className="focus-ring hover:text-[#16150f]">
            Back to the gallery
          </Link>
        </p>
      </div>
    </main>
  );
}
