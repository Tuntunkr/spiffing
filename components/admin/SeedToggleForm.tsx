"use client";

import { useActionState } from "react";
import { updateSeedVisibility } from "@/app/admin/settings-actions";

export default function SeedToggleForm({ showSeed }: { showSeed: boolean }) {
  const [state, formAction, pending] = useActionState(updateSeedVisibility, {});

  return (
    <form action={formAction} className="space-y-5">
      <label className="flex items-start gap-3 text-[15px] leading-relaxed text-[#16150f]">
        <input
          type="checkbox"
          name="showSeed"
          defaultChecked={showSeed}
          className="mt-1 size-4 rounded border-[#d5cfc2] accent-[#16150f]"
        />
        <span>
          Show the built-in seed archive on the public gallery
          <span className="mt-1 block text-[13px] text-[#736f65]">
            Off = only pieces you uploaded. On = seed work sits behind your uploads.
          </span>
        </span>
      </label>
      {state.error ? (
        <p className="rounded-xl bg-[#f8ece8] px-3.5 py-2.5 text-[13px] text-[#c2452c]" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="rounded-xl bg-[#eef6ea] px-3.5 py-2.5 text-[13px] text-[#2f5d28]" role="status">
          {state.ok}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="focus-ring inline-flex h-11 items-center justify-center rounded-full bg-[#16150f] px-5 text-[15px] font-medium text-white hover:opacity-85 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save shelf"}
      </button>
    </form>
  );
}
