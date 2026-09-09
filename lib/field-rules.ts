/**
 * Shared copy and URL checks for the public submit form and the desk piece
 * form. Keep messages identical on the client and the server.
 */

export const SOURCE_URL_LIMIT = 500;

const CONTROL_RE =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u00AD\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/;
const HTML_TAG_RE = /<\s*\/?\s*[a-z!]/i;
const HOSTILE_SCHEME_RE = /javascript:|data:text\/html/i;
const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,24}$/i;
const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
const IPV4_RE = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const NUMERIC_HOST_RE = /^(?:\d+|0x[0-9a-f]+)(?:\.(?:\d+|0x[0-9a-f]+))*$/i;
const BLOCKED_TLDS = new Set([
  "local",
  "localhost",
  "internal",
  "onion",
  "test",
  "invalid",
  "example",
  "home",
  "corp",
  "lan",
  "localdomain",
]);
const BAD_EMAIL_TLD_RE = /\.(local|localhost|internal|onion|test|invalid|example|lan)$/i;

export function tidyCopy(value: string, multiline = false): string {
  const nfc = value.normalize("NFC");
  if (multiline) {
    return nfc
      .replace(/[^\S\n]+/g, " ")
      .replace(/ *\n */g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }
  return nfc.replace(/\s+/g, " ").trim();
}

export function copyIssue(value: string, noun: string): string | undefined {
  if (CONTROL_RE.test(value)) return `${noun} cannot contain hidden characters.`;
  if (HTML_TAG_RE.test(value) || /data:text\/html/i.test(value)) {
    return `${noun} cannot contain HTML or script.`;
  }
  if (value && !/\p{L}/u.test(value)) return `${noun} needs at least one letter.`;
  return undefined;
}

export function nameIssue(name: string, max: number): string | undefined {
  const tidy = tidyCopy(name);
  if (!tidy) return "Your name is required.";
  if (tidy.length > max) return `Keep your name under ${max} characters.`;
  const hidden = copyIssue(tidy, "Your name");
  if (hidden) return hidden;
  if (/https?:\/\//i.test(tidy) || /\bwww\./i.test(tidy) || tidy.includes("@")) {
    return "Use your name, not a link or email.";
  }
  const letters = tidy.match(/\p{L}/gu) ?? [];
  if (letters.length < 2) return "Enter a real name.";
  if (!NAME_RE.test(tidy)) return "Use letters, spaces, hyphens or apostrophes only.";
  return undefined;
}

export function submitEmailIssue(email: string, max: number): string | undefined {
  const tidy = email.trim().toLowerCase();
  if (!tidy) return "Email is required.";
  if (tidy.length > max) return "Email is too long.";
  if (tidy.includes("..") || tidy.startsWith(".") || tidy.includes("@.") || tidy.endsWith(".")) {
    return "Enter a valid email address.";
  }
  const domain = tidy.split("@")[1] ?? "";
  if (BAD_EMAIL_TLD_RE.test(domain) || NUMERIC_HOST_RE.test(domain)) {
    return "Enter a valid email address.";
  }
  if (!EMAIL_RE.test(tidy)) return "Enter a valid email address.";
  return undefined;
}

function looksLikeIp(host: string): boolean {
  if (host.includes(":")) return true;
  if (IPV4_RE.test(host)) return true;
  return NUMERIC_HOST_RE.test(host);
}

function blockedHost(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").replace(/\.$/, "").toLowerCase();
  if (!host) return true;
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (looksLikeIp(host)) return true;
  if (!host.includes(".")) return true;
  const tld = host.slice(host.lastIndexOf(".") + 1);
  if (BLOCKED_TLDS.has(tld)) return true;
  return false;
}

/** Empty is fine. Otherwise a public http(s) URL with a real domain. */
export function normaliseSourceUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.length > SOURCE_URL_LIMIT) return null;
  if (CONTROL_RE.test(trimmed) || HTML_TAG_RE.test(trimmed) || HOSTILE_SCHEME_RE.test(trimmed)) {
    return null;
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    if (blockedHost(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export const SOURCE_URL_ERROR = "Enter a full http(s) link, or leave it empty.";
