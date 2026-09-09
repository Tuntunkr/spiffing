"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clientAddress } from "@/lib/admin";
import { tidyCopy } from "@/lib/field-rules";
import { pieceFromFields, uniqueId } from "@/lib/piece";
import { formatWait, recordSubmission, submitLockRemaining } from "@/lib/submit-attempts";
import { getSubmissions, hasPendingDuplicate, saveSubmissions, takenPieceIds, type Submission } from "@/lib/submissions";
import { submitFieldsFromFormData, validateSubmit, type SubmitErrors } from "@/lib/submit";
import { publicAvatarSizeError, publicImageSizeError } from "@/lib/upload-rules";
import { inspectImage, removeUpload, saveUpload } from "@/lib/uploads";

export type SubmitState = { error?: string; fields?: SubmitErrors };

const DEFAULT_AVATAR = "/creators/creator-1.svg";

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function fileOrNull(formData: FormData, key: string): File | null {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function message(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export async function submitPiece(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  // Honeypot: bots filling a hidden field get a fake success so they stop retrying.
  if (readText(formData, "website")) redirect("/submit/thanks");

  const fields = submitFieldsFromFormData(formData);
  const { name, email } = fields;
  const artwork = fileOrNull(formData, "artwork");
  const avatarFile = fileOrNull(formData, "avatar");

  const errors = validateSubmit(fields);
  if (!artwork) errors.artwork = "Upload the artwork so the card can size itself.";
  if (Object.keys(errors).length > 0) return { fields: errors };

  const parsed = pieceFromFields(fields);
  if (!parsed.ok) return { fields: parsed.fields };

  const existing = await getSubmissions();
  if (hasPendingDuplicate(existing, email, parsed.value.title)) {
    return { fields: { title: "You already have this piece waiting in the inbox." } };
  }

  const ip = await clientAddress();
  const wait = await submitLockRemaining(email, ip);
  if (wait > 0) {
    return { error: `Too many submissions. Try again in ${formatWait(wait)}.` };
  }

  const taken = await takenPieceIds();
  const id = uniqueId(parsed.value.title, taken);

  let media: Submission["media"];
  try {
    const bytes = Buffer.from(await artwork!.arrayBuffer());
    const info = inspectImage(bytes, artwork!.type);
    const sizeErr = publicImageSizeError(info.width, info.height);
    if (sizeErr) return { fields: { artwork: sizeErr } };
    media = await saveUpload(new File([bytes], artwork!.name, { type: artwork!.type }), id);
  } catch (error) {
    return { fields: { artwork: message(error, "Could not save the artwork.") } };
  }

  let avatar = DEFAULT_AVATAR;
  if (avatarFile) {
    try {
      const bytes = Buffer.from(await avatarFile.arrayBuffer());
      const info = inspectImage(bytes, avatarFile.type);
      const sizeErr = publicAvatarSizeError(info.width, info.height);
      if (sizeErr) {
        await removeUpload(media.src);
        return { fields: { avatar: sizeErr } };
      }
      avatar = (await saveUpload(new File([bytes], avatarFile.name, { type: avatarFile.type }), `${id}-avatar`)).src;
    } catch (error) {
      await removeUpload(media.src);
      return { fields: { avatar: message(error, "Could not save the avatar.") } };
    }
  }

  const row: Submission = {
    id,
    status: "pending",
    submittedAt: new Date().toISOString(),
    reviewedAt: "",
    rejectReason: "",
    pieceId: "",
    submitterName: tidyCopy(name),
    submitterEmail: email,
    title: parsed.value.title,
    description: parsed.value.description,
    concept: parsed.value.concept,
    category: parsed.value.category,
    creator: { handle: parsed.value.handle, avatar },
    media,
    slides: parsed.value.slides,
    sourceUrl: parsed.value.sourceUrl,
  };

  try {
    await saveSubmissions([row, ...existing]);
    await recordSubmission(email, ip);
  } catch (error) {
    await removeUpload(media.src);
    if (avatar !== DEFAULT_AVATAR) await removeUpload(avatar);
    return { error: message(error, "Could not save the submission.") };
  }

  revalidatePath("/admin", "layout");
  redirect("/submit/thanks");
}
