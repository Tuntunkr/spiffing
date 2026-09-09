"use client";

import { useEffect } from "react";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

export default function SearchTracker({ q, results }: { q: string; results: number }) {
  useEffect(() => {
    if (!q) return;
    track(ANALYTICS_EVENTS.search, { search_term: q.slice(0, 80), results });
  }, [q, results]);
  return null;
}
