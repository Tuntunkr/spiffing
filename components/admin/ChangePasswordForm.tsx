"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { changeAdminPassword, type PasswordState } from "@/app/admin/settings-actions";
import { validatePasswordChange } from "@/lib/admin-validation";
import { BUTTON, FIELD, FIELD_ERROR, FieldError, FormAlert, HINT, LABEL } from "./form";

export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changeAdminPassword, {});
  const [local, setLocal] = useState<PasswordState["fields"]>({});
  const formRef = useRef<HTMLFormElement>(null);

  // Never leave passwords sitting in the fields after a successful change.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  const currentError = local?.current ?? state.fields?.current;
  const nextError = local?.next ?? state.fields?.next;
  const confirmError = local?.confirm ?? state.fields?.confirm;

  return (
    <form
      ref={formRef}
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
          aria-invalid={currentError ? true : undefined}
          aria-describedby={currentError ? "current-error" : undefined}
          className={currentError ? FIELD_ERROR : FIELD}
        />
        <FieldError id="current-error" message={currentError} />
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
          maxLength={128}
          aria-invalid={nextError ? true : undefined}
          aria-describedby={nextError ? "next-error" : "next-hint"}
          className={nextError ? FIELD_ERROR : FIELD}
        />
        <FieldError id="next-error" message={nextError} />
        {!nextError ? (
          <p id="next-hint" className={HINT}>
            At least 8 characters, with a letter and a number.
          </p>
        ) : null}
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
          maxLength={128}
          aria-invalid={confirmError ? true : undefined}
          aria-describedby={confirmError ? "confirm-error" : undefined}
          className={confirmError ? FIELD_ERROR : FIELD}
        />
        <FieldError id="confirm-error" message={confirmError} />
      </div>

      {state.error ? <FormAlert tone="error">{state.error}</FormAlert> : null}
      {state.ok ? <FormAlert tone="ok">{state.ok}</FormAlert> : null}

      <button type="submit" disabled={pending} className={BUTTON}>
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
