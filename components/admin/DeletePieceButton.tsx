"use client";

export default function DeletePieceButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm("Remove this piece from the gallery?")) e.preventDefault();
      }}
      className="focus-ring text-[14px] text-[#c2452c] hover:underline"
    >
      Remove from gallery
    </button>
  );
}
