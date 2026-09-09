import type { Metadata } from "next";
import Link from "next/link";
import PieceForm from "@/components/admin/PieceForm";
import { createPiece } from "../../actions";
import { CATEGORIES } from "@/lib/types";

export const metadata: Metadata = { title: "New piece" };

type Props = { searchParams: Promise<{ category?: string }> };

export default async function NewPiecePage({ searchParams }: Props) {
  const { category } = await searchParams;
  const preset =
    category && (CATEGORIES as readonly string[]).includes(category) ? category : undefined;

  return (
    <main>
      <p className="text-[13px] text-[#a8a396]">
        <Link href="/admin" className="focus-ring hover:text-[#16150f]">
          Pieces
        </Link>
        <span aria-hidden="true"> / </span>
        New
      </p>
      <p className="mt-4 text-[12px] uppercase tracking-[0.14em] text-[#a8a396]">Publish</p>
      <h1 className="display mt-1.5 text-[30px] font-semibold leading-[1.05] sm:text-[36px]">
        Add a piece
      </h1>
      <p className="mt-2 max-w-[48ch] text-[15px] leading-relaxed text-[#736f65]">
        Category, title, artwork and designer. The same fields the gallery card and detail panel
        already read.
      </p>
      <div className="mt-8">
        <PieceForm action={createPiece} defaultCategory={preset} />
      </div>
    </main>
  );
}
