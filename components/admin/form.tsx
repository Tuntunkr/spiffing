/** Shared field styling for every desk form, so they all read the same. */

export const FIELD =
  "w-full rounded-xl border border-[#e7e3da] bg-white px-3.5 py-2.5 text-[15px] text-[#16150f] outline-none transition-colors placeholder:text-[#a8a396] focus:border-[#16150f] disabled:opacity-60";
export const FIELD_ERROR = `${FIELD} border-[#c2452c] focus:border-[#c2452c]`;
export const LABEL = "mb-1.5 block text-[13px] font-medium text-[#16150f]";
export const HINT = "mt-1.5 text-[12px] leading-relaxed text-[#a8a396]";
export const BUTTON =
  "focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#16150f] px-5 text-[15px] font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-50";
export const BUTTON_QUIET =
  "focus-ring inline-flex h-10 items-center justify-center rounded-full border border-[#e7e3da] bg-white px-4 text-[14px] font-medium text-[#16150f] transition-colors hover:border-[#d5cfc2]";

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-[12px] text-[#c2452c]" role="alert">
      {message}
    </p>
  );
}

export function FormAlert({ tone, children }: { tone: "error" | "ok"; children: React.ReactNode }) {
  return tone === "error" ? (
    <p className="rounded-xl bg-[#f8ece8] px-3.5 py-2.5 text-[13px] text-[#c2452c]" role="alert">
      {children}
    </p>
  ) : (
    <p className="rounded-xl bg-[#eef6ea] px-3.5 py-2.5 text-[13px] text-[#2f5d28]" role="status">
      {children}
    </p>
  );
}
