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
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12px] uppercase tracking-[0.14em] text-[#a8a396]">Edit</p>
          <h1 className="display mt-1.5 text-[30px] font-semibold leading-[1.05] sm:text-[36px]">
            {piece.title}
          </h1>
          <p className="mt-2 text-[14px] text-[#736f65]">
            Live at{" "}
            <Link href={`/posts/${piece.id}`} className="focus-ring font-mono text-[13px] text-[#16150f] underline decoration-[#d5cfc2] underline-offset-4">
              /posts/{piece.id}
            </Link>
          </p>
        </div>
        <form action={deletePiece}>
          <input type="hidden" name="id" value={piece.id} />
          <DeletePieceButton title={piece.title} />
        </form>
      </div>
      <div className="mt-8">
        <PieceForm action={updatePiece} piece={piece} />
      </div>
    </main>
  );
}
