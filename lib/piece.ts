import { CATEGORIES, type Category, type Post } from "./types";

/**
 * Pure validation for the piece form. Shared by the server action and the
 * client form, so both sides agree on every message.
 */

export const LIMITS = {
  title: 80,
  description: 300,
  handle: 40,
  slides: 99,
} as const;

export type PieceFields = {
  title: string;
  description: string;
  category: string;
  handle: string;
  sourceUrl: string;
  slides: string;
  featured: boolean;
};

export type PieceErrors = Partial<Record<keyof PieceFields | "artwork" | "avatar", string>>;

export type ParsedPiece = Pick<
  Post,
  "title" | "description" | "category" | "slides" | "sourceUrl" | "featured"
> & { handle: string };

export type PieceResult = { ok: true; value: ParsedPiece } | { ok: false; fields: PieceErrors };

const HANDLE_RE = /^[a-z0-9][a-z0-9._-]*$/i;

export function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72)
      .replace(/-+$/, "") || "piece"
  );
}

export function uniqueId(title: string, taken: Set<string>): string {
  const base = slugify(title);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export function parseCategory(value: string): Category | null {
  return (CATEGORIES as readonly string[]).includes(value) ? (value as Category) : null;
}

/** Empty is fine (the detail panel hides the button). Otherwise http(s) only. */
export function normaliseSourceUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function validatePiece(fields: PieceFields): PieceErrors {
  const errors: PieceErrors = {};

  if (!fields.title) errors.title = "Title is required.";
  else if (fields.title.length > LIMITS.title) errors.title = `Keep the title under ${LIMITS.title} characters.`;

  if (!fields.description) errors.description = "Description is required.";
  else if (fields.description.length > LIMITS.description) {
    errors.description = `Description must be ${LIMITS.description} characters or fewer.`;
  }

  if (!parseCategory(fields.category)) errors.category = "Pick a category the gallery already understands.";

  const handle = fields.handle.replace(/^@/, "");
  if (!handle) errors.handle = "Designer handle is required.";
  else if (handle.length > LIMITS.handle) errors.handle = `Keep the handle under ${LIMITS.handle} characters.`;
  else if (!HANDLE_RE.test(handle)) errors.handle = "Letters, numbers, dots, dashes and underscores only.";

  if (normaliseSourceUrl(fields.sourceUrl) === null) errors.sourceUrl = "Enter a full http(s) link, or leave it empty.";

  const slides = fields.slides.trim() === "" ? 1 : Number(fields.slides);
  if (!Number.isInteger(slides) || slides < 1 || slides > LIMITS.slides) {
    errors.slides = `Frames must be a whole number from 1 to ${LIMITS.slides}.`;
  }

  return errors;
}

export function pieceFromFields(fields: PieceFields): PieceResult {
  const errors = validatePiece(fields);
  if (Object.keys(errors).length > 0) return { ok: false, fields: errors };
  return {
    ok: true,
    value: {
      title: fields.title,
      description: fields.description,
      category: parseCategory(fields.category) as Category,
      handle: fields.handle.replace(/^@/, ""),
      sourceUrl: normaliseSourceUrl(fields.sourceUrl) ?? "",
      slides: fields.slides.trim() === "" ? 1 : Number(fields.slides),
      featured: fields.featured,
    },
  };
}
