"use client";

import { useActionState, useState } from "react";
import { loginAdmin, type LoginState } from "@/app/admin/auth-actions";
import { EMAIL_RE, validateLoginFields } from "@/lib/admin-validation";

const FIELD =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-[15px] text-[#16150f] outline-none transition-colors placeholder:text-[#a8a396] focus:border-[#16150f]";
const LABEL = "mb-1.5 block text-[13px] font-medium text-[#16150f]";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, {});
  const [local, setLocal] = useState<LoginState["fields"]>({});

  const emailError = local?.email ?? state.fields?.email;
  const passwordError = local?.password ?? state.fields?.password;

  return (
    <form
      action={formAction}
      noValidate
      onSubmit={(e) => {
        const data = new FormData(e.currentTarget);
        const fields = validateLoginFields(
          String(data.get("email") ?? "").trim().toLowerCase(),
          String(data.get("password") ?? ""),
        );
        setLocal(fields);
        if (fields.email || fields.password) e.preventDefault();
      }}
      className="space-y-5"
    >
      <div>
        <label className={LABEL} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          inputMode="email"
          pattern={EMAIL_RE.source}
          className={`${FIELD} ${emailError ? "border-[#c2452c]" : "border-[#e7e3da]"}`}
        />
        {emailError ? (
          <p className="mt-1.5 text-[12px] text-[#c2452c]" role="alert">
            {emailError}
          </p>
        ) : null}
      </div>

      <div>
        <label className={LABEL} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          maxLength={128}
          className={`${FIELD} ${passwordError ? "border-[#c2452c]" : "border-[#e7e3da]"}`}
        />
        {passwordError ? (
          <p className="mt-1.5 text-[12px] text-[#c2452c]" role="alert">
            {passwordError}
          </p>
        ) : null}
      </div>

      {state.error ? (
        <p className="rounded-xl bg-[#f8ece8] px-3.5 py-2.5 text-[13px] text-[#c2452c]" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="focus-ring inline-flex h-11 w-full items-center justify-center rounded-full bg-[#16150f] text-[15px] font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in to the desk"}
      </button>
    </form>
  );
}
