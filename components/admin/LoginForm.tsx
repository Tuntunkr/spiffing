"use client";

import { useActionState, useState } from "react";
import { loginAdmin, type LoginState } from "@/app/admin/auth-actions";
import { EMAIL_RE, validateLoginFields } from "@/lib/admin-validation";
import { BUTTON, FIELD, FIELD_ERROR, FieldError, FormAlert, LABEL } from "./form";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, {});
  const [local, setLocal] = useState<LoginState["fields"]>({});
  const [showPassword, setShowPassword] = useState(false);

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
          autoFocus
          defaultValue={state.email}
          required
          inputMode="email"
          pattern={EMAIL_RE.source}
          aria-invalid={emailError ? true : undefined}
          aria-describedby={emailError ? "email-error" : undefined}
          className={emailError ? FIELD_ERROR : FIELD}
        />
        <FieldError id="email-error" message={emailError} />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-[13px] font-medium text-[#16150f]" htmlFor="password">
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-pressed={showPassword}
            className="focus-ring text-[12px] text-[#736f65] hover:text-[#16150f]"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          minLength={8}
          maxLength={128}
          aria-invalid={passwordError ? true : undefined}
          aria-describedby={passwordError ? "password-error" : undefined}
          className={passwordError ? FIELD_ERROR : FIELD}
        />
        <FieldError id="password-error" message={passwordError} />
      </div>

      {state.error ? <FormAlert tone="error">{state.error}</FormAlert> : null}

      <button type="submit" disabled={pending} className={`${BUTTON} w-full`}>
        {pending ? (
          <>
            <span aria-hidden="true" className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Signing in…
          </>
        ) : (
          "Sign in to the desk"
        )}
      </button>
    </form>
  );
}
