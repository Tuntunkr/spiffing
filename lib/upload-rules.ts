/**
 * Upload rules shared by the browser (pre-flight checks) and the server (the
 * real ones). Raster only: SVG can carry script, and the desk is the one
 * place untrusted files enter the site.
 */
export const ALLOWED_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);
export const ACCEPT = Array.from(ALLOWED_TYPES.keys()).join(",");
export const MAX_BYTES = 8 * 1024 * 1024;
export const MIN_PUBLIC_EDGE = 400;
export const MIN_AVATAR_EDGE = 64;
export const MAX_EDGE = 8000;
export const MAX_ASPECT = 6;
export const TYPE_ERROR = "Use a JPG, PNG, WebP or GIF.";
export const SIZE_ERROR = "Image must be under 8 MB.";
export const SMALL_ERROR = `Artwork must be at least ${MIN_PUBLIC_EDGE}px on the long side.`;
export const HUGE_ERROR = `Artwork must be ${MAX_EDGE}px or smaller on each side.`;
export const THIN_ERROR = "Artwork is too thin — use a normal still, not a strip.";
export const AVATAR_SMALL_ERROR = `Avatar must be at least ${MIN_AVATAR_EDGE}px on the long side.`;

function frameError(width: number, height: number, minEdge: number, small: string): string | undefined {
  if (!width || !height) return "Could not read the image size.";
  if (width > MAX_EDGE || height > MAX_EDGE) return HUGE_ERROR;
  if (Math.max(width, height) < minEdge) return small;
  return undefined;
}

/** Public submissions only. Desk uploads stay free of this floor. */
export function publicImageSizeError(width: number, height: number): string | undefined {
  const basic = frameError(width, height, MIN_PUBLIC_EDGE, SMALL_ERROR);
  if (basic) return basic;
  const long = Math.max(width, height);
  const short = Math.min(width, height);
  if (short > 0 && long / short > MAX_ASPECT) return THIN_ERROR;
  return undefined;
}

export function publicAvatarSizeError(width: number, height: number): string | undefined {
  return frameError(width, height, MIN_AVATAR_EDGE, AVATAR_SMALL_ERROR);
}
