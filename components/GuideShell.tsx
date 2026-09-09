import Footer from "./Footer";
import Header, { type HeaderCurrent } from "./Header";

/** Shared chrome for the public guide pages (what this is, how to use). */
export default async function GuideShell({
  current,
  children,
}: {
  current: Extract<HeaderCurrent, "about" | "howto" | "submit">;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Header current={current} search={false} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
