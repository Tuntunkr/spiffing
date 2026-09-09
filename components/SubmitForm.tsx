"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { SubmitState } from "@/app/submit/actions";
import { submitFieldsFromFormData, SUBMIT_LIMITS, validateSubmit, type SubmitErrors } from "@/lib/submit";
import { CATEGORIES } from "@/lib/types";
import {
  ACCEPT,
  MAX_BYTES,
  MIN_AVATAR_EDGE,
  MIN_PUBLIC_EDGE,
  publicAvatarSizeError,
  publicImageSizeError,
  SIZE_ERROR,
  TYPE_ERROR,
} from "@/lib/upload-rules";
import { FIELD, FIELD_ERROR, FieldError, HINT, LABEL } from "@/components/admin/form";

type Props = {
  action: (prev: SubmitState, formData: FormData) => Promise<SubmitState>;
};

type Preview = { url: string; width: number; height: number; name: string; bytes: number };

function formatBytes(n: number): string {
  return n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(n / 1024)} KB`;
}

export default function SubmitForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [local, setLocal] = useState<SubmitErrors>({});
  const [preview, setPreview] = useState<Preview | null>(null);
  const [dragging, setDragging] = useState(false);
  const [descLen, setDescLen] = useState(0);
  const [conceptLen, setConceptLen] = useState(0);
  const artworkRef = useRef<HTMLInputElement>(null);

  const errors: SubmitErrors = { ...state.fields, ...local };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  const clearArtwork = (message?: string) => {
    if (artworkRef.current) artworkRef.current.value = "";
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    setLocal((prev) => ({ ...prev, artwork: message }));
  };

  const onArtwork = (file: File | undefined) => {
    setLocal((prev) => ({ ...prev, artwork: undefined }));
    if (!file) {
      clearArtwork();
      return;
    }
    if (!ACCEPT.split(",").includes(file.type)) {
      clearArtwork(TYPE_ERROR);
      return;
    }
    if (file.size > MAX_BYTES) {
      clearArtwork(SIZE_ERROR);
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const sizeErr = publicImageSizeError(img.naturalWidth, img.naturalHeight);
      if (sizeErr) {
        URL.revokeObjectURL(url);
        clearArtwork(sizeErr);
        return;
      }
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return { url, width: img.naturalWidth, height: img.naturalHeight, name: file.name, bytes: file.size };
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      clearArtwork("That file is not a readable image.");
    };
    img.src = url;
  };

  const checkField =
    (key: keyof SubmitErrors) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const form = e.currentTarget.form;
      if (!form) return;
      const next = validateSubmit(submitFieldsFromFormData(new FormData(form)));
      setLocal((prev) => ({ ...prev, [key]: next[key] }));
    };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !artworkRef.current) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    artworkRef.current.files = dt.files;
    onArtwork(file);
  };

  return (
    <form
      action={formAction}
      noValidate
      onSubmit={(e) => {
        const data = new FormData(e.currentTarget);
        const fields = validateSubmit(submitFieldsFromFormData(data));
        const artwork = data.get("artwork");
        if (!(artwork instanceof File && artwork.size > 0)) {
          fields.artwork = "Upload the artwork so the card can size itself.";
        } else if (preview) {
          const sizeErr = publicImageSizeError(preview.width, preview.height);
          if (sizeErr) fields.artwork = sizeErr;
        }
        setLocal(fields);
        if (Object.keys(fields).length > 0) {
          e.preventDefault();
          const first = e.currentTarget.querySelector<HTMLElement>("[aria-invalid='true']");
          first?.focus();
        }
      }}
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]"
    >
      <div className="pointer-events-none absolute -left-[10000px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="space-y-6">
        <fieldset className="space-y-5 rounded-[1.25rem] border border-[#e7e3da] bg-white p-5 shadow-[0_12px_36px_-28px_rgba(22,21,15,0.4)] sm:p-6">
          <legend className="display px-1 text-[15px] font-semibold">You</legend>
          <div>
            <label className={LABEL} htmlFor="name">
              Your name
            </label>
            <input
              id="name"
              name="name"
              required
              maxLength={SUBMIT_LIMITS.name}
              autoComplete="name"
              placeholder="Priya Sharma"
              onBlur={checkField("name")}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "name-error" : undefined}
              className={errors.name ? FIELD_ERROR : FIELD}
            />
            <FieldError id="name-error" message={errors.name} />
          </div>
          <div>
            <label className={LABEL} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={SUBMIT_LIMITS.email}
              autoComplete="email"
              placeholder="you@studio.com"
              onBlur={checkField("email")}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "email-error" : "email-hint"}
              className={errors.email ? FIELD_ERROR : FIELD}
            />
            <FieldError id="email-error" message={errors.email} />
            {!errors.email ? (
              <p id="email-hint" className={HINT}>
                Only used if we have a question about the piece. It is not shown on the gallery.
              </p>
            ) : null}
          </div>
        </fieldset>

        <fieldset className="space-y-5 rounded-[1.25rem] border border-[#e7e3da] bg-white p-5 shadow-[0_12px_36px_-28px_rgba(22,21,15,0.4)] sm:p-6">
          <legend className="display px-1 text-[15px] font-semibold">The piece</legend>

          <div>
            <label className={LABEL} htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              required
              defaultValue={CATEGORIES[0]}
              onBlur={checkField("category")}
              aria-invalid={errors.category ? true : undefined}
              className={errors.category ? FIELD_ERROR : FIELD}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <FieldError id="category-error" message={errors.category} />
            {!errors.category ? <p className={HINT}>It lands on this shelf after it is approved.</p> : null}
          </div>

          <div>
            <label className={LABEL} htmlFor="title">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              maxLength={SUBMIT_LIMITS.title}
              placeholder="Ledger pricing"
              onBlur={checkField("title")}
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={errors.title ? "title-error" : undefined}
              className={`${errors.title ? FIELD_ERROR : FIELD} display`}
            />
            <FieldError id="title-error" message={errors.title} />
          </div>

          <div>
            <label className={LABEL} htmlFor="description">
              Description
              <span
                className={`ml-2 font-normal tabular-nums ${descLen > SUBMIT_LIMITS.description ? "text-[#c2452c]" : "text-[#a8a396]"}`}
              >
                {descLen}/{SUBMIT_LIMITS.description}
              </span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              maxLength={SUBMIT_LIMITS.description}
              rows={4}
              onChange={(e) => setDescLen(e.target.value.length)}
              onBlur={checkField("description")}
              placeholder="What the piece is, in one or two sentences."
              aria-invalid={errors.description ? true : undefined}
              aria-describedby={errors.description ? "description-error" : undefined}
              className={`${errors.description ? FIELD_ERROR : FIELD} resize-y leading-relaxed`}
            />
            <FieldError id="description-error" message={errors.description} />
          </div>

          <div>
            <label className={LABEL} htmlFor="concept">
              Concept <span className="font-normal text-[#a8a396]">(optional)</span>
              <span
                className={`ml-2 font-normal tabular-nums ${conceptLen > SUBMIT_LIMITS.concept ? "text-[#c2452c]" : "text-[#a8a396]"}`}
              >
                {conceptLen}/{SUBMIT_LIMITS.concept}
              </span>
            </label>
            <textarea
              id="concept"
              name="concept"
              maxLength={SUBMIT_LIMITS.concept}
              rows={5}
              onChange={(e) => setConceptLen(e.target.value.length)}
              onBlur={checkField("concept")}
              placeholder="The longer note shown in the dark band under the piece."
              aria-invalid={errors.concept ? true : undefined}
              aria-describedby={errors.concept ? "concept-error" : "concept-hint"}
              className={`${errors.concept ? FIELD_ERROR : FIELD} resize-y leading-relaxed`}
            />
            <FieldError id="concept-error" message={errors.concept} />
            {!errors.concept ? (
              <p id="concept-hint" className={HINT}>
                If you leave this empty, the description is used on the piece page.
              </p>
            ) : null}
          </div>

          <div>
            <label className={LABEL} htmlFor="sourceUrl">
              Original URL <span className="font-normal text-[#a8a396]">(optional)</span>
            </label>
            <input
              id="sourceUrl"
              name="sourceUrl"
              type="url"
              inputMode="url"
              placeholder="https://"
              onBlur={checkField("sourceUrl")}
              aria-invalid={errors.sourceUrl ? true : undefined}
              aria-describedby={errors.sourceUrl ? "sourceUrl-error" : "sourceUrl-hint"}
              className={errors.sourceUrl ? FIELD_ERROR : FIELD}
            />
            <FieldError id="sourceUrl-error" message={errors.sourceUrl} />
            {!errors.sourceUrl ? (
              <p id="sourceUrl-hint" className={HINT}>
                A public http(s) link to the original. Leave empty if there is none.
              </p>
            ) : null}
          </div>
        </fieldset>

        <fieldset className="space-y-5 rounded-[1.25rem] border border-[#e7e3da] bg-white p-5 shadow-[0_12px_36px_-28px_rgba(22,21,15,0.4)] sm:p-6">
          <legend className="display px-1 text-[15px] font-semibold">Designer</legend>
          <div>
            <label className={LABEL} htmlFor="handle">
              Handle
            </label>
            <div className="relative">
              <span aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] text-[#a8a396]">
                @
              </span>
              <input
                id="handle"
                name="handle"
                required
                maxLength={SUBMIT_LIMITS.handle}
                placeholder="studioquiet"
                autoComplete="off"
                spellCheck={false}
                onBlur={checkField("handle")}
                aria-invalid={errors.handle ? true : undefined}
                aria-describedby={errors.handle ? "handle-error" : undefined}
                className={`${errors.handle ? FIELD_ERROR : FIELD} pl-8`}
              />
            </div>
            <FieldError id="handle-error" message={errors.handle} />
          </div>
          <div>
            <label className={LABEL} htmlFor="avatar">
              Avatar <span className="font-normal text-[#a8a396]">(optional)</span>
            </label>
            <input
              id="avatar"
              name="avatar"
              type="file"
              accept={ACCEPT}
              aria-invalid={errors.avatar ? true : undefined}
              onChange={(e) => {
                const input = e.currentTarget;
                const file = input.files?.[0];
                if (!file) {
                  setLocal((prev) => ({ ...prev, avatar: undefined }));
                  return;
                }
                if (!ACCEPT.split(",").includes(file.type)) {
                  setLocal((prev) => ({ ...prev, avatar: TYPE_ERROR }));
                  input.value = "";
                  return;
                }
                if (file.size > MAX_BYTES) {
                  setLocal((prev) => ({ ...prev, avatar: SIZE_ERROR }));
                  input.value = "";
                  return;
                }
                const url = URL.createObjectURL(file);
                const img = new Image();
                img.onload = () => {
                  URL.revokeObjectURL(url);
                  const sizeErr = publicAvatarSizeError(img.naturalWidth, img.naturalHeight);
                  if (sizeErr) {
                    setLocal((prev) => ({ ...prev, avatar: sizeErr }));
                    input.value = "";
                    return;
                  }
                  setLocal((prev) => ({ ...prev, avatar: undefined }));
                };
                img.onerror = () => {
                  URL.revokeObjectURL(url);
                  setLocal((prev) => ({ ...prev, avatar: "That file is not a readable image." }));
                  input.value = "";
                };
                img.src = url;
              }}
              className="block w-full text-[13px] text-[#736f65] file:mr-3 file:rounded-full file:border-0 file:bg-[#16150f] file:px-3.5 file:py-1.5 file:text-[13px] file:font-medium file:text-white"
            />
            <FieldError id="avatar-error" message={errors.avatar} />
            {!errors.avatar ? (
              <p className={HINT}>Optional. JPG, PNG, WebP or GIF, at least {MIN_AVATAR_EDGE}px.</p>
            ) : null}
          </div>
        </fieldset>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <fieldset className="space-y-4 rounded-[1.25rem] border border-[#e7e3da] bg-white p-5 shadow-[0_12px_36px_-28px_rgba(22,21,15,0.4)]">
          <legend className="display px-1 text-[15px] font-semibold">Artwork</legend>
          <label
            htmlFor="artwork"
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`relative block aspect-[4/5] cursor-pointer overflow-hidden rounded-xl bg-[#f1efe9] ring-1 ring-inset transition-shadow ${
              dragging ? "ring-2 ring-[#16150f]" : errors.artwork ? "ring-[#c2452c]" : "ring-black/[0.06]"
            }`}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.url} alt="" className="absolute inset-0 size-full object-cover" />
            ) : (
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-[13px] leading-relaxed text-[#a8a396]">
                <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" className="text-[#d5cfc2]">
                  <rect x="2" y="2" width="24" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M14 8v9M10 13l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
                Drop a still here or click to choose. Its aspect ratio becomes the card size.
              </span>
            )}
            {preview ? (
              <span className="absolute inset-x-3 bottom-3 rounded-lg bg-black/55 px-3 py-1.5 text-center text-[12px] text-white backdrop-blur-sm">
                Replace
              </span>
            ) : null}
          </label>
          <input
            ref={artworkRef}
            id="artwork"
            name="artwork"
            type="file"
            accept={ACCEPT}
            required
            aria-invalid={errors.artwork ? true : undefined}
            aria-describedby={errors.artwork ? "artwork-error" : "artwork-hint"}
            onChange={(e) => onArtwork(e.target.files?.[0])}
            className="block w-full text-[13px] text-[#736f65] file:mr-3 file:rounded-full file:border-0 file:bg-[#16150f] file:px-3.5 file:py-1.5 file:text-[13px] file:font-medium file:text-white"
          />
          <FieldError id="artwork-error" message={errors.artwork} />
          {!errors.artwork ? (
            <p id="artwork-hint" className={HINT}>
              {preview
                ? `${preview.width} × ${preview.height} · ${formatBytes(preview.bytes)} — listing preview crop.`
                : `JPG, PNG, WebP or GIF. At least ${MIN_PUBLIC_EDGE}px on the long side, not a thin strip, up to 8 MB.`}
            </p>
          ) : null}
        </fieldset>

        <fieldset className="space-y-4 rounded-[1.25rem] border border-[#e7e3da] bg-white p-5 shadow-[0_12px_36px_-28px_rgba(22,21,15,0.4)]">
          <legend className="display px-1 text-[15px] font-semibold">Listing</legend>
          <div>
            <label className={LABEL} htmlFor="slides">
              Frames
            </label>
            <input
              id="slides"
              name="slides"
              type="number"
              inputMode="numeric"
              min={1}
              max={SUBMIT_LIMITS.slides}
              step={1}
              defaultValue={1}
              onBlur={checkField("slides")}
              aria-invalid={errors.slides ? true : undefined}
              aria-describedby={errors.slides ? "slides-error" : undefined}
              className={errors.slides ? FIELD_ERROR : FIELD}
            />
            <FieldError id="slides-error" message={errors.slides} />
            {!errors.slides ? <p className={HINT}>How many screens the original has. 1 hides the badge.</p> : null}
          </div>
        </fieldset>

        {state.error ? (
          <p className="rounded-xl bg-[#f8ece8] px-3.5 py-2.5 text-[13px] text-[#c2452c]" role="alert">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#16150f] text-[15px] font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {pending ? (
            <>
              <span aria-hidden="true" className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Sending…
            </>
          ) : (
            "Send for review"
          )}
        </button>
        <p className={HINT}>
          Nothing goes live until the archive desk checks it. You will see it on its category shelf after it is
          approved.
        </p>
      </aside>
    </form>
  );
}
