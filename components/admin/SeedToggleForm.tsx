"use client";

import { useActionState } from "react";
import { updateSeedVisibility } from "@/app/admin/settings-actions";
import { BUTTON, FormAlert } from "./form";

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
      {state.error ? <FormAlert tone="error">{state.error}</FormAlert> : null}
      {state.ok ? <FormAlert tone="ok">{state.ok}</FormAlert> : null}
      <button type="submit" disabled={pending} className={BUTTON}>
        {pending ? "Saving…" : "Save shelf"}
      </button>
    </form>
  );
}
