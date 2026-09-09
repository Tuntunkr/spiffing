"use client";

import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useEffect } from "react";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

function eventFromLink(href: string, dataset: DOMStringMap): string | null {
  if (dataset.track) return dataset.track;
  if (href.includes("/feed.xml") || href.includes("/rss.xml")) return ANALYTICS_EVENTS.rss_click;
  return null;
}

function AnalyticsClicks() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const el = (event.target as Element | null)?.closest?.("a,button");
      if (!(el instanceof HTMLElement)) return;
      const href = el instanceof HTMLAnchorElement ? el.href : "";
      const named = eventFromLink(href, el.dataset);
      if (named) {
        track(named as typeof ANALYTICS_EVENTS.rss_click, {
          href: href || undefined,
          label: el.getAttribute("aria-label") || el.textContent?.trim().slice(0, 80) || undefined,
        });
        return;
      }
      if (el.dataset.category) {
        track(ANALYTICS_EVENTS.category_click, { category: el.dataset.category });
        return;
      }
      if (el.dataset.filter) {
        track(ANALYTICS_EVENTS.filter_used, { filter: el.dataset.filter });
        return;
      }
      if (el instanceof HTMLAnchorElement && el.target === "_blank") {
        const url = new URL(el.href, window.location.origin);
        if (url.origin !== window.location.origin) {
          track(ANALYTICS_EVENTS.outbound_click, { href: url.href });
          track(ANALYTICS_EVENTS.external_link_click, { href: url.href });
        }
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}

export default function Analytics() {
  return (
    <>
      <VercelAnalytics />
      <SpeedInsights />
      <AnalyticsClicks />
    </>
  );
}
