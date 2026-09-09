import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import Logo from "@/components/Logo";
import { getAdminSession } from "@/lib/admin";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = { title: "Desk sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");

  return (
    <main className="grid min-h-[100dvh] bg-[#f4f2ed] lg:grid-cols-[minmax(280px,5fr)_7fr]">
      <section className="relative hidden overflow-hidden bg-[#16150f] px-10 py-12 text-[#faf9f7] lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="focus-ring inline-flex items-center gap-2.5 text-[#faf9f7]">
          <Logo className="size-[28px]" />
          <span className="display text-[18px] font-semibold">{SITE_NAME}</span>
        </Link>
        <div>
          <p className="text-[12px] uppercase tracking-[0.16em] text-[#a8a396]">Private archive</p>
          <p className="display mt-4 max-w-[14ch] text-[44px] font-semibold leading-[1.05]">
            The desk behind the gallery.
          </p>
          <p className="mt-5 max-w-[36ch] text-[15px] leading-relaxed text-[#c9c3b6]">
            Publish, edit and retire pieces. One account. The public site never links here.
          </p>
        </div>
        <p className="flex items-center gap-2 text-[13px] text-[#a8a396]">
          <span aria-hidden="true" className="size-[7px] rounded-full bg-[#c2452c]" />
          Signed access only
        </p>
      </section>

      <section className="flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-[400px]">
          <Link
            href="/"
            className="focus-ring mb-8 flex items-center justify-center gap-2.5 text-[#16150f] lg:hidden"
          >
            <Logo className="size-[26px]" />
            <span className="display text-[17px] font-semibold">{SITE_NAME}</span>
          </Link>
          <div className="rounded-[1.35rem] border border-[#e7e3da] bg-white p-7 shadow-[0_24px_60px_-36px_rgba(22,21,15,0.45)] sm:p-8">
            <h1 className="display text-[26px] font-semibold sm:text-[28px]">Desk</h1>
            <p className="mt-2 text-[14px] leading-relaxed text-[#736f65]">
              Sign in to publish, edit and remove pieces from the gallery. Only the archive admin
              has an account here.
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
      </section>
    </main>
  );
}
