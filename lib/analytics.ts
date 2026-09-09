export const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim() ?? "";

export const ANALYTICS_EVENTS = {
  search: "search",
  category_click: "category_click",
  piece_view: "piece_view",
  outbound_click: "outbound_click",
  image_open: "image_open",
  filter_used: "filter_used",
  rss_click: "rss_click",
  external_link_click: "external_link_click",
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: string, event: string, params?: AnalyticsPayload) => void;
  }
}

/** Client-only. Never send emails, names, or other PII. */
export function track(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  if (typeof window === "undefined") return;
  const clean: AnalyticsPayload = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === "") continue;
    clean[key] = value;
  }
  window.gtag?.("event", event, clean);
  window.dispatchEvent(new CustomEvent("spiffing:track", { detail: { event, ...clean } }));
}
