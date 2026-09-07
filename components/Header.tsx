import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { clerkEnabled } from "@/lib/clerk";
import Logo from "./Logo";
import SubscribeForm from "./SubscribeForm";

const CONTACT_URL = "https://x.com";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#e7e3da] bg-[#faf9f7]/85 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-[1680px] items-center justify-between gap-4 px-4 sm:px-6 xl:h-[76px] xl:px-8 min-[1700px]:px-12">
        <div className="flex shrink-0 items-center gap-7">
          <Link
            aria-label="Vitrine home"
            className="focus-ring flex items-center gap-2.5 text-[#16150f]"
            href="/"
          >
            <Logo className="size-[26px]" />
            <span className="display text-[17px] font-semibold xl:text-[18px]">Vitrine</span>
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-6 text-[15px] min-[1100px]:flex"
          >
            <Link className="focus-ring font-medium text-[#16150f]" href="/">
              Gallery
            </Link>
            <a
              href={CONTACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring text-[#736f65] transition-colors hover:text-[#16150f]"
            >
              Contact
            </a>
          </nav>
        </div>

        <div className="min-w-0 flex-1 sm:max-w-[420px] xl:max-w-[460px]">
          <SubscribeForm />
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="hidden items-center gap-2 min-[1480px]:flex">
            <span aria-hidden="true" className="size-[7px] rounded-full bg-[#c2452c]" />
            <span className="text-[14px] text-[#736f65]">Updated hourly</span>
          </div>

          <Link
            className="focus-ring hidden text-[15px] text-[#736f65] transition-colors hover:text-[#16150f] sm:block"
            href="/admin"
          >
            Admin
          </Link>
          {clerkEnabled ? (
            <>
              <SignedOut>
                <div className="flex items-center gap-3">
                  <Link
                    className="focus-ring hidden text-[15px] text-[#736f65] transition-colors hover:text-[#16150f] md:block"
                    href="/sign-in"
                  >
                    Sign in
                  </Link>
                  <Link
                    className="focus-ring rounded-full bg-[#16150f] px-4 py-[7px] text-[15px] font-medium text-[#faf9f7] transition-opacity hover:opacity-85"
                    href="/sign-up"
                  >
                    Join
                  </Link>
                </div>
              </SignedOut>
              <SignedIn>
                <UserButton
                  appearance={{ elements: { avatarBox: "size-[30px]" } }}
                />
              </SignedIn>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
