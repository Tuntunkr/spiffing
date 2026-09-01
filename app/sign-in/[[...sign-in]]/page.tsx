import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata: Metadata = { title: "Sign in" };

export default function Page() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#faf9f7] px-4 py-16">
      <SignIn appearance={clerkAppearance} />
    </main>
  );
}
