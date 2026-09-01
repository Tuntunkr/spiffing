"use client";

import { useState } from "react";

type Props = {
  /** "header" is the wide inline form; "panel" is the stacked detail-view one. */
  variant?: "header" | "panel";
};

export default function SubscribeForm({ variant = "header" }: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "pending" | "done">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || state === "pending") return;
    setState("pending");
    // No mailing-list provider is wired up; swap this for your own endpoint.
    await new Promise((r) => setTimeout(r, 500));
    setState("done");
    setEmail("");
    setTimeout(() => setState("idle"), 2600);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full items-center gap-2 rounded-full border border-[#e7e3da] bg-white p-1 pl-4 transition-colors focus-within:border-[#c9c3b6]"
    >
      <label htmlFor={`email-${variant}`} className="sr-only">
        Email address
      </label>
      <input
        id={`email-${variant}`}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Get the weekly edit"
        className="ios-no-focus-zoom min-w-0 flex-1 bg-transparent text-[14px] text-[#16150f] outline-none placeholder:text-[#9c988d]"
      />
      <button
        type="submit"
        disabled={state === "pending"}
        className="focus-ring shrink-0 rounded-full bg-[#16150f] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-black disabled:cursor-wait disabled:opacity-60"
      >
        {state === "done" ? "Thanks" : "Subscribe"}
      </button>
    </form>
  );
}
