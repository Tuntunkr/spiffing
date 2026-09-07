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
export const TYPE_ERROR = "Use a JPG, PNG, WebP or GIF.";
export const SIZE_ERROR = "Image must be under 8 MB.";
