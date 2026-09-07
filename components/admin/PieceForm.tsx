"use client";

import { useActionState, useEffect, useState } from "react";
import type { ActionState } from "@/app/admin/actions";
import { CATEGORIES, type Post } from "@/lib/types";

const FIELD =
  "w-full rounded-xl border border-[#e7e3da] bg-white px-3.5 py-2.5 text-[15px] text-[#16150f] outline-none transition-colors placeholder:text-[#a8a396] focus:border-[#16150f]";
const LABEL = "mb-1.5 block text-[13px] font-medium text-[#16150f]";
const HINT = "mt-1.5 text-[12px] leading-relaxed text-[#a8a396]";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  piece?: Post;
  defaultCategory?: string;
};

export default function PieceForm({ action, piece, defaultCategory }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [preview, setPreview] = useState(piece?.media.src ?? "");
  const [size, setSize] = useState({
    width: piece?.media.width ?? 0,
    height: piece?.media.height ?? 0,
  });
  const [descLen, setDescLen] = useState(piece?.description.length ?? 0);

  useEffect(() => {
    setPreview(piece?.media.src ?? "");
    setSize({
      width: piece?.media.width ?? 0,
      height: piece?.media.height ?? 0,
    });
    setDescLen(piece?.description.length ?? 0);
  }, [piece]);

  const onArtwork = (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    const img = new Image();
    img.onload = () => setSize({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = url;
  };

  const initialCategory =
    piece?.category ??
    (defaultCategory && (CATEGORIES as readonly string[]).includes(defaultCategory)
      ? defaultCategory
      : CATEGORIES[0]);

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
      {piece ? <input type="hidden" name="id" value={piece.id} /> : null}
      <input type="hidden" name="width" value={size.width || 1600} />
      <input type="hidden" name="height" value={size.height || 1200} />

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
              className={FIELD}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <p className={HINT}>Same chips as the gallery: Web, Branding, Product, Motion…</p>
          </div>

          <div>
            <label className={LABEL} htmlFor="title">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              defaultValue={piece?.title}
              placeholder="Ledger — pricing"
              className={`${FIELD} display`}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="description">
              Description
              <span className="ml-2 font-normal tabular-nums text-[#a8a396]">{descLen}/300</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              maxLength={300}
              rows={4}
              defaultValue={piece?.description}
              onChange={(e) => setDescLen(e.target.value.length)}
              placeholder="What the piece is, in one or two sentences."
              className={`${FIELD} resize-y leading-relaxed`}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="sourceUrl">
              Original URL
            </label>
            <input
              id="sourceUrl"
              name="sourceUrl"
              type="url"
              defaultValue={piece?.sourceUrl}
              placeholder="https://"
              className={FIELD}
            />
            <p className={HINT}>Opens from “View the original” on the detail panel.</p>
          </div>
        </fieldset>

        <fieldset className="space-y-5 rounded-2xl border border-[#e7e3da] bg-white p-5 sm:p-6">
          <legend className="display px-1 text-[15px] font-semibold">Designer</legend>
          <div>
            <label className={LABEL} htmlFor="handle">
              Handle
            </label>
            <input
              id="handle"
              name="handle"
              required
              defaultValue={piece?.creator.handle}
              placeholder="studioquiet"
              className={FIELD}
            />
            <p className={HINT}>Shown on the card and in the metadata table. No @.</p>
          </div>
          <div>
            <label className={LABEL} htmlFor="avatar">
              Avatar {piece ? "(leave empty to keep)" : "(optional)"}
            </label>
            <input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              className="block w-full text-[13px] text-[#736f65] file:mr-3 file:rounded-full file:border-0 file:bg-[#16150f] file:px-3.5 file:py-1.5 file:text-[13px] file:font-medium file:text-white"
            />
          </div>
        </fieldset>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <fieldset className="space-y-4 rounded-2xl border border-[#e7e3da] bg-white p-5">
          <legend className="display px-1 text-[15px] font-semibold">Artwork</legend>
          <label
            htmlFor="artwork"
            className="relative block aspect-[4/5] cursor-pointer overflow-hidden rounded-xl bg-[#f1efe9] ring-1 ring-inset ring-black/[0.06]"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="absolute inset-0 size-full object-cover" />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center px-6 text-center text-[13px] leading-relaxed text-[#a8a396]">
                Drop a still here. Its aspect ratio becomes the card size.
              </span>
            )}
          </label>
          <input
            id="artwork"
            name="artwork"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            required={!piece}
            onChange={(e) => onArtwork(e.target.files?.[0])}
            className="block w-full text-[13px] text-[#736f65] file:mr-3 file:rounded-full file:border-0 file:bg-[#16150f] file:px-3.5 file:py-1.5 file:text-[13px] file:font-medium file:text-white"
          />
          {size.width > 0 ? (
            <p className={HINT}>
              {size.width} × {size.height} — used for the masonry span.
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
              min={1}
              step={1}
              defaultValue={piece?.slides ?? 1}
              className={FIELD}
            />
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
          className="focus-ring inline-flex h-11 w-full items-center justify-center rounded-full bg-[#16150f] text-[15px] font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {pending ? "Saving…" : piece ? "Update piece" : "Publish to gallery"}
        </button>
      </aside>
    </form>
  );
}
