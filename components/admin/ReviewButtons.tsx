"use client";

import { useFormStatus } from "react-dom";

export function ApproveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring inline-flex h-11 items-center justify-center rounded-full bg-[#16150f] px-5 text-[15px] font-medium text-white transition-[opacity,transform] hover:opacity-85 active:scale-[0.98] disabled:opacity-50"
    >
      {pending ? "Approving…" : "Approve and publish"}
    </button>
  );
}

export function RejectButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm("Reject this submission? The artwork is deleted and it never reaches the gallery.")) {
          e.preventDefault();
        }
      }}
      className="focus-ring inline-flex h-10 items-center justify-center rounded-full border border-[#efd6cf] bg-white px-4 text-[14px] font-medium text-[#c2452c] transition-colors hover:border-[#c2452c] hover:bg-[#fdf6f4] disabled:opacity-50"
    >
      {pending ? "Rejecting…" : "Reject"}
    </button>
  );
}
