import { getCatalogPosts } from "./catalog";
import { readJson, writeJson } from "./store";
import { CATEGORIES, type Post } from "./types";

const FILE = "submissions.json";

export const SUBMISSION_STATUSES = ["pending", "approved", "rejected"] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export type Submission = {
  id: string;
  status: SubmissionStatus;
  submittedAt: string;
  reviewedAt: string;
  rejectReason: string;
  pieceId: string;
  submitterName: string;
  submitterEmail: string;
  title: string;
  description: string;
  concept: string;
  category: Post["category"];
  creator: Post["creator"];
  media: Post["media"];
  slides: number;
  sourceUrl: string;
};

function isStatus(value: unknown): value is SubmissionStatus {
  return (SUBMISSION_STATUSES as readonly string[]).includes(String(value));
}

function isSubmission(value: unknown): value is Submission {
  if (!value || typeof value !== "object") return false;
  const s = value as Partial<Submission>;
  return (
    typeof s.id === "string" &&
    isStatus(s.status) &&
    typeof s.submittedAt === "string" &&
    typeof s.submitterName === "string" &&
    typeof s.submitterEmail === "string" &&
    typeof s.title === "string" &&
    typeof s.description === "string" &&
    (CATEGORIES as readonly string[]).includes(s.category ?? "") &&
    typeof s.creator?.handle === "string" &&
    typeof s.creator?.avatar === "string" &&
    typeof s.media?.src === "string" &&
    typeof s.media?.width === "number" &&
    typeof s.media?.height === "number"
  );
}

export function parseSubmissions(raw: unknown): Submission[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isSubmission).map((s) => ({
    ...s,
    concept: typeof s.concept === "string" ? s.concept : "",
    slides: typeof s.slides === "number" && s.slides > 0 ? Math.floor(s.slides) : 1,
    sourceUrl: typeof s.sourceUrl === "string" ? s.sourceUrl : "",
    reviewedAt: typeof s.reviewedAt === "string" ? s.reviewedAt : "",
    rejectReason: typeof s.rejectReason === "string" ? s.rejectReason : "",
    pieceId: typeof s.pieceId === "string" ? s.pieceId : "",
  }));
}

export async function getSubmissions(): Promise<Submission[]> {
  return parseSubmissions(await readJson<unknown>(FILE, []));
}

export async function getSubmission(id: string): Promise<Submission | undefined> {
  return (await getSubmissions()).find((s) => s.id === id);
}

export async function saveSubmissions(rows: Submission[]): Promise<void> {
  await writeJson(FILE, rows);
}

export async function getPendingSubmissions(): Promise<Submission[]> {
  return (await getSubmissions()).filter((s) => s.status === "pending");
}

export function hasPendingDuplicate(rows: Submission[], email: string, title: string): boolean {
  const e = email.trim().toLowerCase();
  const t = title.trim().toLowerCase();
  return rows.some((s) => s.status === "pending" && s.submitterEmail.toLowerCase() === e && s.title.toLowerCase() === t);
}

export async function countPending(): Promise<number> {
  return (await getPendingSubmissions()).length;
}

/** Ids that a new submission or an approval must not collide with. */
export async function takenPieceIds(): Promise<Set<string>> {
  const [catalog, rows] = await Promise.all([getCatalogPosts(), getSubmissions()]);
  const taken = new Set(catalog.map((p) => p.id));
  for (const row of rows) {
    if (row.status === "pending") taken.add(row.id);
    if (row.status === "approved" && row.pieceId) taken.add(row.pieceId);
  }
  return taken;
}

export function postFromSubmission(row: Submission, pieceId: string, publishedAt: string): Post {
  return {
    id: pieceId,
    title: row.title,
    description: row.description,
    concept: row.concept,
    category: row.category,
    creator: row.creator,
    media: row.media,
    slides: row.slides,
    sourceUrl: row.sourceUrl,
    featured: false,
    publishedAt,
  };
}
