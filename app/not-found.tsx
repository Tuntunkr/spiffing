import Link from "next/link";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <Logo className="size-8 text-[#16150f]" />
      <p className="mt-8 text-[13px] uppercase tracking-[0.14em] text-[#a8a396]">404</p>
      <h1 className="display mt-3 text-[24px] font-semibold sm:text-[28px]">
        This piece has left the case.
      </h1>
      <p className="mt-3 max-w-[38ch] text-[15px] text-[#736f65]">
        It may have been removed from the archive, or the link was never right.
      </p>
      <Link
        href="/"
        className="focus-ring mt-7 inline-flex h-10 items-center rounded-full bg-[#16150f] px-5 text-[14px] font-medium text-white transition-colors hover:bg-black"
      >
        Back to the gallery
      </Link>
    </main>
  );
}
