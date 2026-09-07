"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { ActionState } from "@/app/admin/actions";
import { LIMITS, validatePiece, type PieceErrors } from "@/lib/piece";
import { CATEGORIES, type Post } from "@/lib/types";
import { ACCEPT, MAX_BYTES, SIZE_ERROR, TYPE_ERROR } from "@/lib/upload-rules";
import { FIELD, FIELD_ERROR, FieldError, HINT, LABEL } from "./form";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  piece?: Post;
  defaultCategory?: string;
};

type Preview = { url: string; width: number; height: number; name: string; bytes: number };

function formatBytes(n: number): string {
  return n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(n / 1024)} KB`;
}

export default function PieceForm({ action, piece, defaultCategory }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [local, setLocal] = useState<PieceErrors>({});
  const [preview, setPreview] = useState<Preview | null>(null);
  const [dragging, setDragging] = useState(false);
  const [descLen, setDescLen] = useState(piece?.description.length ?? 0);
  const artworkRef = useRef<HTMLInputElement>(null);

  // Server errors win once they arrive; local ones show instantly on submit.
  const errors: PieceErrors = { ...local, ...state.fields };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  const onArtwork = (file: File | undefined) => {
    setLocal((prev) => ({ ...prev, artwork: undefined }));
    if (!file) {
      setPreview(null);
      return;
    }
    if (!ACCEPT.split(",").includes(file.type)) {
      setLocal((prev) => ({ ...prev, artwork: TYPE_ERROR }));
      setPreview(null);
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocal((prev) => ({ ...prev, artwork: SIZE_ERROR }));
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () =>
      setPreview({ url, width: img.naturalWidth, height: img.naturalHeight, name: file.name, bytes: file.size });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setLocal((prev) => ({ ...prev, artwork: "That file is not a readable image." }));
    };
    img.src = url;
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

  const initialCategory =
    piece?.category ??
    (defaultCategory && (CATEGORIES as readonly string[]).includes(defaultCategory)
      ? defaultCategory
      : CATEGORIES[0]);

  const shownSrc = preview?.url ?? piece?.media.src ?? "";
  const shownSize = preview ?? piece?.media;

  return (
    <form
      action={formAction}
      noValidate
      onSubmit={(e) => {
        const data = new FormData(e.currentTarget);
        const str = (k: string) => String(data.get(k) ?? "").trim();
        const fields = validatePiece({
          title: str("title"),
          description: str("description"),
          category: str("category"),
          handle: str("handle"),
          sourceUrl: str("sourceUrl"),
          slides: str("slides"),
          featured: data.get("featured") === "on",
        });
        const artwork = data.get("artwork");
        if (!piece && !(artwork instanceof File && artwork.size > 0)) {
          fields.artwork = "Upload the artwork so the card can size itself.";
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
      {piece ? <input type="hidden" name="id" value={piece.id} /> : null}

      <div className="space-y-6">
        <fieldset className="space-y-5 rounded-2xl border border-[#e7e3da] bg-white p-5 sm:p-6">
          <legend className="display px-1 text-[15px] font-semibold">On the shelf</legend>

          <div>
            <label className={LABEL} htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              required
              defaultValue={initialCategory}
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
            {!errors.category ? <p className={HINT}>Same chips as the gallery filter.</p> : null}
          </div>

          <div>
            <label className={LABEL} htmlFor="title">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              maxLength={LIMITS.title}
              defaultValue={piece?.title}
              placeholder="Ledger — pricing"
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
                className={`ml-2 font-normal tabular-nums ${descLen > LIMITS.description ? "text-[#c2452c]" : "text-[#a8a396]"}`}
              >
                {descLen}/{LIMITS.description}
              </span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              maxLength={LIMITS.description}
              rows={4}
              defaultValue={piece?.description}
              onChange={(e) => setDescLen(e.target.value.length)}
              placeholder="What the piece is, in one or two sentences."
              aria-invalid={errors.description ? true : undefined}
              aria-describedby={errors.description ? "description-error" : undefined}
              className={`${errors.description ? FIELD_ERROR : FIELD} resize-y leading-relaxed`}
            />
            <FieldError id="description-error" message={errors.description} />
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
              defaultValue={piece?.sourceUrl}
              placeholder="https://"
              aria-invalid={errors.sourceUrl ? true : undefined}
              aria-describedby={errors.sourceUrl ? "sourceUrl-error" : undefined}
              className={errors.sourceUrl ? FIELD_ERROR : FIELD}
            />
            <FieldError id="sourceUrl-error" message={errors.sourceUrl} />
            {!errors.sourceUrl ? (
              <p className={HINT}>Shows as “View the original” on the detail panel. Leave empty to hide the button.</p>
            ) : null}
          </div>
        </fieldset>

        <fieldset className="space-y-5 rounded-2xl border border-[#e7e3da] bg-white p-5 sm:p-6">
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
                maxLength={LIMITS.handle}
                defaultValue={piece?.creator.handle}
                placeholder="studioquiet"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={errors.handle ? true : undefined}
                aria-describedby={errors.handle ? "handle-error" : undefined}
                className={`${errors.handle ? FIELD_ERROR : FIELD} pl-8`}
              />
            </div>
            <FieldError id="handle-error" message={errors.handle} />
            {!errors.handle ? <p className={HINT}>Shown on the card and in the metadata table.</p> : null}
          </div>
          <div>
            <label className={LABEL} htmlFor="avatar">
              Avatar <span className="font-normal text-[#a8a396]">{piece ? "(leave empty to keep)" : "(optional)"}</span>
            </label>
            <div className="flex items-center gap-3">
              {piece?.creator.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={piece.creator.avatar}
                  alt=""
                  width={36}
                  height={36}
                  className="size-9 shrink-0 rounded-full object-cover ring-1 ring-black/[0.06]"
                />
              ) : null}
              <input
                id="avatar"
                name="avatar"
                type="file"
                accept={ACCEPT}
                aria-invalid={errors.avatar ? true : undefined}
                className="block w-full text-[13px] text-[#736f65] file:mr-3 file:rounded-full file:border-0 file:bg-[#16150f] file:px-3.5 file:py-1.5 file:text-[13px] file:font-medium file:text-white"
              />
            </div>
            <FieldError id="avatar-error" message={errors.avatar} />
          </div>
        </fieldset>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <fieldset className="space-y-4 rounded-2xl border border-[#e7e3da] bg-white p-5">
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
              dragging
                ? "ring-2 ring-[#16150f]"
                : errors.artwork
                  ? "ring-[#c2452c]"
                  : "ring-black/[0.06]"
            }`}
          >
            {shownSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shownSrc} alt="" className="absolute inset-0 size-full object-cover" />
            ) : (
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-[13px] leading-relaxed text-[#a8a396]">
                <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" className="text-[#d5cfc2]">
                  <rect x="2" y="2" width="24" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M14 8v9M10 13l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
                Drop a still here or click to choose. Its aspect ratio becomes the card size.
              </span>
            )}
            {shownSrc ? (
              <span className="absolute inset-x-3 bottom-3 rounded-lg bg-black/55 px-3 py-1.5 text-center text-[12px] text-white backdrop-blur-sm">
                {preview ? "Replace" : "Click to replace"}
              </span>
            ) : null}
          </label>
          <input
            ref={artworkRef}
            id="artwork"
            name="artwork"
            type="file"
            accept={ACCEPT}
            required={!piece}
            aria-invalid={errors.artwork ? true : undefined}
            aria-describedby={errors.artwork ? "artwork-error" : "artwork-hint"}
            onChange={(e) => onArtwork(e.target.files?.[0])}
            className="block w-full text-[13px] text-[#736f65] file:mr-3 file:rounded-full file:border-0 file:bg-[#16150f] file:px-3.5 file:py-1.5 file:text-[13px] file:font-medium file:text-white"
          />
          <FieldError id="artwork-error" message={errors.artwork} />
          {!errors.artwork ? (
            <p id="artwork-hint" className={HINT}>
              {shownSize
                ? `${shownSize.width} × ${shownSize.height}${preview ? ` · ${formatBytes(preview.bytes)}` : ""} — sets the masonry span.`
                : "JPG, PNG, WebP or GIF, up to 8 MB."}
            </p>
          ) : null}
        </fieldset>

        <fieldset className="space-y-4 rounded-2xl border border-[#e7e3da] bg-white p-5">
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
              max={LIMITS.slides}
              step={1}
              defaultValue={piece?.slides ?? 1}
              aria-invalid={errors.slides ? true : undefined}
              aria-describedby={errors.slides ? "slides-error" : undefined}
              className={errors.slides ? FIELD_ERROR : FIELD}
            />
            <FieldError id="slides-error" message={errors.slides} />
            {!errors.slides ? <p className={HINT}>How many screens the original has. 1 hides the badge.</p> : null}
          </div>
          <label className="flex items-center gap-2.5 text-[14px] text-[#16150f]">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={piece?.featured}
              className="size-4 rounded border-[#d5cfc2] accent-[#16150f]"
            />
            Feature this piece
          </label>
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
              {piece ? "Saving…" : "Publishing…"}
            </>
          ) : piece ? (
            "Save changes"
          ) : (
            "Publish to gallery"
          )}
        </button>
      </aside>
    </form>
  );
}
