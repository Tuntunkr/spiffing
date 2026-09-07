import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DeletePieceButton from "@/components/admin/DeletePieceButton";
import PieceForm from "@/components/admin/PieceForm";
import { deletePiece, updatePiece } from "../../../actions";
import { getCatalogPost } from "@/lib/catalog";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const piece = await getCatalogPost(id);
  return { title: piece ? `Edit ${piece.title}` : "Edit" };
}

export default async function EditPiecePage({ params }: Props) {
  const { id } = await params;
  const piece = await getCatalogPost(id);
  if (!piece) notFound();

  return (
    <main>
      <p className="text-[13px] text-[#a8a396]">
        <Link href="/admin" className="focus-ring hover:text-[#16150f]">
          Pieces
        </Link>
        <span aria-hidden="true"> / </span>
        Edit
      </p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="display text-[28px] font-semibold leading-tight sm:text-[34px]">
          {piece.title}
        </h1>
        <form action={deletePiece}>
          <input type="hidden" name="id" value={piece.id} />
          <DeletePieceButton />
        </form>
      </div>
      <div className="mt-8">
        <PieceForm action={updatePiece} piece={piece} />
      </div>
    </main>
  );
}
