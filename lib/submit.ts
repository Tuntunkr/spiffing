import { nameIssue, submitEmailIssue, tidyCopy } from "./field-rules";
import { LIMITS, validatePiece, type PieceErrors, type PieceFields } from "./piece";

export const SUBMIT_LIMITS = {
  ...LIMITS,
  name: 80,
  email: 120,
} as const;

export const SUBMIT_MIN = {
  title: 3,
  description: 12,
  handle: 3,
} as const;

const RESERVED_HANDLES = new Set([
  "admin",
  "administrator",
  "desk",
  "help",
  "inbox",
  "official",
  "root",
  "spiffing",
  "support",
  "system",
]);

const LINK_IN_COPY_RE = /\bhttps?:\/\/|\bwww\./i;
const REPEAT_RE = /(.)\1{7,}/u;

export type SubmitFields = PieceFields & {
  name: string;
  email: string;
};

export type SubmitErrors = PieceErrors & {
  name?: string;
  email?: string;
};

export function submitFieldsFromFormData(data: FormData): SubmitFields {
  const str = (k: string) => String(data.get(k) ?? "").trim();
  return {
    title: str("title"),
    description: str("description"),
    concept: str("concept"),
    category: str("category"),
    handle: str("handle"),
    sourceUrl: str("sourceUrl"),
    slides: str("slides"),
    featured: false,
    name: str("name"),
    email: str("email").toLowerCase(),
  };
}

function spamCopyIssue(value: string, noun: string, allowLink: boolean): string | undefined {
  if (!allowLink && LINK_IN_COPY_RE.test(value)) {
    return `${noun} cannot contain a link. Put the original URL in its own field.`;
  }
  if (REPEAT_RE.test(value)) return `${noun} looks like spam — ease off the repeated characters.`;
  return undefined;
}

function publicHandleIssue(handle: string): string | undefined {
  const tidy = handle.replace(/^@/, "").trim();
  if (!tidy) return undefined;
  if (tidy.length < SUBMIT_MIN.handle) return `Handle must be at least ${SUBMIT_MIN.handle} characters.`;
  if (RESERVED_HANDLES.has(tidy.toLowerCase())) return "That handle is reserved.";
  if (!/[a-z]/i.test(tidy)) return "Handle needs at least one letter.";
  if (tidy.includes("..") || /[._-]$/.test(tidy)) {
    return "Letters, numbers, dots, dashes and underscores only.";
  }
  return undefined;
}

export function validateSubmit(fields: SubmitFields): SubmitErrors {
  const errors: SubmitErrors = validatePiece({ ...fields, featured: false });
  const title = tidyCopy(fields.title);
  const description = tidyCopy(fields.description, true);
  const concept = tidyCopy(fields.concept, true);

  if (title && !errors.title && title.length < SUBMIT_MIN.title) {
    errors.title = "Give the piece a clearer title.";
  }
  if (description && !errors.description && description.length < SUBMIT_MIN.description) {
    errors.description = "Say a bit more about the piece — at least a short sentence.";
  }
  if (title && description && !errors.title && !errors.description && title.toLowerCase() === description.toLowerCase()) {
    errors.description = "Description should say more than the title.";
  }

  if (title && !errors.title) {
    const spam = spamCopyIssue(title, "Title", false);
    if (spam) errors.title = spam;
  }
  if (description && !errors.description) {
    const spam = spamCopyIssue(description, "Description", true);
    if (spam) errors.description = spam;
  }
  if (concept && !errors.concept) {
    const spam = spamCopyIssue(concept, "Concept", true);
    if (spam) errors.concept = spam;
  }

  if (!errors.handle) {
    const handle = publicHandleIssue(fields.handle);
    if (handle) errors.handle = handle;
  }

  const name = nameIssue(fields.name, SUBMIT_LIMITS.name);
  if (name) errors.name = name;

  const email = submitEmailIssue(fields.email, SUBMIT_LIMITS.email);
  if (email) errors.email = email;

  return errors;
}
