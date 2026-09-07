"use client";

import { useActionState, useState } from "react";
import { changeAdminPassword, type PasswordState } from "@/app/admin/settings-actions";
import { validatePasswordChange } from "@/lib/admin-validation";

const FIELD =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-[15px] text-[#16150f] outline-none transition-colors placeholder:text-[#a8a396] focus:border-[#16150f]";
const LABEL = "mb-1.5 block text-[13px] font-medium text-[#16150f]";

export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changeAdminPassword, {});
  const [local, setLocal] = useState<PasswordState["fields"]>({});

  const currentError = local?.current ?? state.fields?.current;
  const nextError = local?.next ?? state.fields?.next;
  const confirmError = local?.confirm ?? state.fields?.confirm;

  return (
    <form
      action={formAction}
      noValidate
      onSubmit={(e) => {
        const data = new FormData(e.currentTarget);
        const fields = validatePasswordChange(
          String(data.get("current") ?? ""),
          String(data.get("next") ?? ""),
          String(data.get("confirm") ?? ""),
        );
        setLocal(fields);
        if (fields.current || fields.next || fields.confirm) e.preventDefault();
      }}
      className="space-y-5"
    >
      <div>
        <label className={LABEL} htmlFor="current">
          Current password
        </label>
        <input
          id="current"
          name="current"
          type="password"
          autoComplete="current-password"
          required
          className={`${FIELD} ${currentError ? "border-[#c2452c]" : "border-[#e7e3da]"}`}
        />
        {currentError ? (
          <p className="mt-1.5 text-[12px] text-[#c2452c]" role="alert">
            {currentError}
          </p>
        ) : null}
      </div>
      <div>
        <label className={LABEL} htmlFor="next">
          New password
        </label>
        <input
          id="next"
          name="next"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={`${FIELD} ${nextError ? "border-[#c2452c]" : "border-[#e7e3da]"}`}
        />
        {nextError ? (
          <p className="mt-1.5 text-[12px] text-[#c2452c]" role="alert">
            {nextError}
          </p>
        ) : (
          <p className="mt-1.5 text-[12px] text-[#a8a396]">At least 8 characters, with a letter and a number.</p>
        )}
      </div>
      <div>
        <label className={LABEL} htmlFor="confirm">
          Confirm new password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={`${FIELD} ${confirmError ? "border-[#c2452c]" : "border-[#e7e3da]"}`}
        />
        {confirmError ? (
          <p className="mt-1.5 text-[12px] text-[#c2452c]" role="alert">
            {confirmError}
          </p>
        ) : null}
      </div>

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
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
