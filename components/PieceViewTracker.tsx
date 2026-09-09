"use client";

import { useEffect } from "react";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

export default function PieceViewTracker({
  id,
  title,
  category,
}: {
  id: string;
  title: string;
  category: string;
}) {
  useEffect(() => {
    track(ANALYTICS_EVENTS.piece_view, { piece_id: id, title, category });
  }, [id, title, category]);
  return null;
}
