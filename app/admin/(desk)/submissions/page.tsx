import type { Metadata } from "next";
import Link from "next/link";
import EmptyShelf from "@/components/EmptyShelf";
import Notice from "@/components/admin/Notice";
import { getSubmissions, type SubmissionStatus } from "@/lib/submissions";

export const metadata: Metadata = { title: "Inbox" };

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const CHIP =
  "focus-ring inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[14px] transition-colors duration-150";

const STATUSES: { label: string; value: SubmissionStatus | "all" }[] = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "All", value: "all" },
];

function inboxHref(status: string): string {
  return status === "pending" ? "/admin/submissions" : `/admin/submissions?status=${status}`;
}

export default async function SubmissionsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const raw = one(sp.status);
  const status: SubmissionStatus | "all" =
    raw === "approved" || raw === "rejected" || raw === "all" ? raw : "pending";

  const all = await getSubmissions();
  const list = status === "all" ? all : all.filter((row) => row.status === status);
  const counts = {
    all: all.length,
    pending: all.filter((r) => r.status === "pending").length,
    approved: all.filter((r) => r.status === "approved").length,
    rejected: all.filter((r) => r.status === "rejected").length,
  };

  const notice = sp.approved
    ? { param: "approved", message: "Approved. It is live on its category shelf." }
    : sp.rejected
      ? { param: "rejected", message: "Rejected. It will not appear on the gallery." }
      : null;

  return (
    <main>
      {notice ? <Notice {...notice} /> : null}

      <div>
        <p className="text-[12px] uppercase tracking-[0.14em] text-[#a8a396]">Review</p>
        <h1 className="display mt-1.5 text-[30px] font-semibold leading-[1.05] sm:text-[36px]">Inbox</h1>
        <p className="mt-2 max-w-[48ch] text-[15px] leading-relaxed text-[#736f65]">
          Public submissions wait here. Check the piece, then approve it onto the matching category shelf or
          reject it.
        </p>
      </div>

      <dl className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[1.15rem] border border-[#e7e3da] bg-white px-5 py-4">
          <dt className="text-[12px] uppercase tracking-[0.12em] text-[#a8a396]">Waiting</dt>
          <dd className="display mt-1 text-[28px] font-semibold tabular-nums leading-none">{counts.pending}</dd>
        </div>
        <div className="rounded-[1.15rem] border border-[#e7e3da] bg-white px-5 py-4">
          <dt className="text-[12px] uppercase tracking-[0.12em] text-[#a8a396]">Approved</dt>
          <dd className="display mt-1 text-[28px] font-semibold tabular-nums leading-none">{counts.approved}</dd>
        </div>
        <div className="rounded-[1.15rem] border border-[#e7e3da] bg-white px-5 py-4">
          <dt className="text-[12px] uppercase tracking-[0.12em] text-[#a8a396]">Rejected</dt>
          <dd className="display mt-1 text-[28px] font-semibold tabular-nums leading-none">{counts.rejected}</dd>
        </div>
      </dl>

      <div className="mt-8 overflow-hidden rounded-[1.25rem] border border-[#e7e3da] bg-white shadow-[0_20px_50px_-36px_rgba(22,21,15,0.35)]">
        <div className="flex flex-col gap-3 border-b border-[#e7e3da] bg-[#faf9f7]/70 px-4 py-3.5 sm:px-5">
          <nav aria-label="Filter by status" className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max items-center gap-2">
              {STATUSES.map((item) => {
                const active = status === item.value;
                const n = item.value === "all" ? counts.all : counts[item.value];
                return (
                  <Link
                    key={item.value}
                    href={inboxHref(item.value)}
                    aria-current={active ? "page" : undefined}
                    className={`${CHIP} ${
                      active
                        ? "bg-[#16150f] text-white"
                        : "border border-[#e7e3da] bg-white text-[#736f65] hover:border-[#d5cfc2] hover:text-[#16150f]"
                    }`}
                  >
                    {item.label}
                    <span className={`text-[12px] tabular-nums ${active ? "text-white/55" : "text-[#a8a396]"}`}>
                      {n}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {list.length === 0 ? (
          <div className="px-4 py-6 sm:px-6">
            <EmptyShelf
              title={status === "pending" ? "Nothing waiting" : `Nothing ${status === "all" ? "submitted" : status} yet`}
              body={
                status === "pending"
                  ? "When someone uses Submit in the header, the piece lands here for you to check."
                  : "Switch the filter to see the rest of the inbox."
              }
            />
          </div>
        ) : (
          <table className="w-full text-left text-[14px]">
            <caption className="sr-only">
              {list.length} {list.length === 1 ? "submission" : "submissions"}
            </caption>
            <thead className="hidden border-b border-[#e7e3da] text-[11px] uppercase tracking-[0.1em] text-[#a8a396] sm:table-header-group">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">
                  Piece
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Category
                </th>
                <th scope="col" className="hidden px-3 py-3 font-medium lg:table-cell">
                  From
                </th>
                <th scope="col" className="hidden px-3 py-3 font-medium md:table-cell">
                  Sent
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="px-5 py-3 text-right font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7e3da]">
              {list.map((row) => (
                <tr key={row.id} className="group transition-colors hover:bg-[#faf9f7]">
                  <td className="px-4 py-3.5 sm:px-5">
                    <div className="flex items-center gap-3.5">
                      <Link href={`/admin/submissions/${row.id}`} className="focus-ring shrink-0 rounded-xl">
                        {row.media.src ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={row.media.src}
                            alt=""
                            width={64}
                            height={64}
                            loading="lazy"
                            className="size-16 rounded-xl object-cover ring-1 ring-inset ring-black/[0.06]"
                          />
                        ) : (
                          <span className="flex size-16 items-center justify-center rounded-xl bg-[#f1efe9] text-[11px] text-[#a8a396]">
                            Gone
                          </span>
                        )}
                      </Link>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/submissions/${row.id}`}
                          className="focus-ring display block truncate text-[16px] font-medium text-[#16150f]"
                        >
                          {row.title}
                        </Link>
                        <p className="mt-0.5 truncate text-[13px] text-[#a8a396]">@{row.creator.handle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-3 py-3.5 sm:table-cell">
                    <span className="inline-flex h-7 items-center rounded-full border border-[#e7e3da] bg-[#faf9f7] px-2.5 text-[12px] text-[#736f65]">
                      {row.category}
                    </span>
                  </td>
                  <td className="hidden px-3 py-3.5 text-[#736f65] lg:table-cell">
                    <span className="block truncate">{row.submitterName}</span>
                    <span className="block truncate text-[12px] text-[#a8a396]">{row.submitterEmail}</span>
                  </td>
                  <td className="hidden px-3 py-3.5 tabular-nums text-[#736f65] md:table-cell">
                    <time dateTime={row.submittedAt}>
                      {new Date(row.submittedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        timeZone: "UTC",
                      })}
                    </time>
                  </td>
                  <td className="hidden px-3 py-3.5 sm:table-cell">
                    <StatusPill status={row.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right sm:px-5">
                    <Link
                      href={`/admin/submissions/${row.id}`}
                      className="focus-ring inline-flex h-8 items-center rounded-full bg-[#16150f] px-3 text-[13px] font-medium text-white hover:opacity-85"
                    >
                      {row.status === "pending" ? "Review" : "Open"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

function StatusPill({ status }: { status: SubmissionStatus }) {
  if (status === "pending") {
    return (
      <span className="inline-flex h-7 items-center rounded-full border border-[#e7e3da] px-2.5 text-[12px] text-[#736f65]">
        Pending
      </span>
    );
  }
  if (status === "approved") {
    return (
      <span className="inline-flex h-7 items-center rounded-full bg-[#eef6ea] px-2.5 text-[12px] font-medium text-[#2f5d28]">
        Approved
      </span>
    );
  }
  return (
    <span className="inline-flex h-7 items-center rounded-full bg-[#f8ece8] px-2.5 text-[12px] font-medium text-[#c2452c]">
      Rejected
    </span>
  );
}
