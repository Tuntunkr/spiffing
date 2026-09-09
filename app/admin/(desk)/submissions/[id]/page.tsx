import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApproveButton, RejectButton } from "@/components/admin/ReviewButtons";
import { FIELD, HINT, LABEL } from "@/components/admin/form";
import { approveSubmission, rejectSubmission } from "../../../review-actions";
import { getSubmission } from "@/lib/submissions";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const row = await getSubmission(id);
  return { title: row ? `Review ${row.title}` : "Review" };
}

export default async function ReviewSubmissionPage({ params }: Props) {
  const { id } = await params;
  const row = await getSubmission(id);
  if (!row) notFound();

  const pending = row.status === "pending";

  return (
    <main>
      <p className="text-[13px] text-[#a8a396]">
        <Link href="/admin/submissions" className="focus-ring hover:text-[#16150f]">
          Inbox
        </Link>
        <span aria-hidden="true"> / </span>
        Review
      </p>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12px] uppercase tracking-[0.14em] text-[#a8a396]">
            {row.status === "pending" ? "Waiting" : row.status === "approved" ? "Approved" : "Rejected"}
          </p>
          <h1 className="display mt-1.5 text-[30px] font-semibold leading-[1.05] sm:text-[36px]">{row.title}</h1>
          <p className="mt-2 text-[14px] text-[#736f65]">
            {row.category} · @{row.creator.handle}
            {row.pieceId ? (
              <>
                {" · live at "}
                <Link
                  href={`/posts/${row.pieceId}`}
                  className="focus-ring font-mono text-[13px] text-[#16150f] underline decoration-[#d5cfc2] underline-offset-4"
                >
                  /posts/{row.pieceId}
                </Link>
              </>
            ) : null}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <section className="space-y-4 rounded-[1.25rem] border border-[#e7e3da] bg-white p-5 sm:p-6">
            <h2 className="display text-[15px] font-semibold">Submitted by</h2>
            <dl className="grid gap-3 text-[14px] sm:grid-cols-2">
              <div>
                <dt className="text-[12px] uppercase tracking-[0.1em] text-[#a8a396]">Name</dt>
                <dd className="mt-1 text-[#16150f]">{row.submitterName}</dd>
              </div>
              <div>
                <dt className="text-[12px] uppercase tracking-[0.1em] text-[#a8a396]">Email</dt>
                <dd className="mt-1">
                  <a href={`mailto:${row.submitterEmail}`} className="focus-ring text-[#16150f] underline decoration-[#d5cfc2] underline-offset-4">
                    {row.submitterEmail}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[12px] uppercase tracking-[0.1em] text-[#a8a396]">Sent</dt>
                <dd className="mt-1 tabular-nums text-[#736f65]">
                  <time dateTime={row.submittedAt}>
                    {new Date(row.submittedAt).toLocaleString("en-GB", { timeZone: "UTC" })} UTC
                  </time>
                </dd>
              </div>
            </dl>
          </section>

          <section className="space-y-4 rounded-[1.25rem] border border-[#e7e3da] bg-white p-5 sm:p-6">
            <h2 className="display text-[15px] font-semibold">Copy</h2>
            <p className="text-[15px] leading-relaxed text-[#16150f]">{row.description}</p>
            {row.concept ? (
              <p className="text-[14px] leading-relaxed text-[#736f65]">{row.concept}</p>
            ) : (
              <p className="text-[13px] text-[#a8a396]">No concept note. Description will be used on the piece page.</p>
            )}
            {row.sourceUrl ? (
              <p className="text-[13px]">
                <a
                  href={row.sourceUrl}
                  className="focus-ring text-[#16150f] underline decoration-[#d5cfc2] underline-offset-4"
                  rel="noreferrer"
                  target="_blank"
                >
                  {row.sourceUrl}
                </a>
              </p>
            ) : null}
          </section>

          {row.status === "rejected" && row.rejectReason ? (
            <section className="rounded-[1.25rem] border border-[#efd6cf] bg-[#fdf6f4] p-5 text-[14px] text-[#c2452c] sm:p-6">
              <h2 className="display text-[15px] font-semibold text-[#c2452c]">Reject reason</h2>
              <p className="mt-2 leading-relaxed">{row.rejectReason}</p>
            </section>
          ) : null}

          {pending ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <form action={approveSubmission} className="rounded-[1.25rem] border border-[#e7e3da] bg-white p-5">
                <input type="hidden" name="id" value={row.id} />
                <p className="display text-[15px] font-semibold">Looks right</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[#736f65]">
                  Publishes it on the {row.category} shelf. You can still edit it from Pieces afterwards.
                </p>
                <div className="mt-4">
                  <ApproveButton />
                </div>
              </form>
              <form action={rejectSubmission} className="rounded-[1.25rem] border border-[#e7e3da] bg-white p-5">
                <input type="hidden" name="id" value={row.id} />
                <p className="display text-[15px] font-semibold">Does not hold up</p>
                <label className={`${LABEL} mt-3`} htmlFor="reason">
                  Reason <span className="font-normal text-[#a8a396]">(optional)</span>
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  maxLength={300}
                  rows={3}
                  className={`${FIELD} resize-y`}
                  placeholder="Kept for the desk record. Not sent to the submitter."
                />
                <p className={HINT}>Artwork is deleted. The row stays in Rejected.</p>
                <div className="mt-4">
                  <RejectButton />
                </div>
              </form>
            </div>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <div className="overflow-hidden rounded-[1.25rem] border border-[#e7e3da] bg-white">
            {row.media.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.media.src} alt="" className="aspect-[4/5] w-full object-cover" />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center bg-[#f1efe9] text-[13px] text-[#a8a396]">
                Artwork removed
              </div>
            )}
            <div className="border-t border-[#e7e3da] px-4 py-3 text-[12px] text-[#736f65]">
              {row.media.width} × {row.media.height}
              {row.slides > 1 ? ` · ${row.slides} frames` : ""}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
