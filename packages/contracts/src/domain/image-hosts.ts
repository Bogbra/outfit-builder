// Single source of truth for which image hosts the app trusts — used both
// to validate product image URLs at write time (product.ts) and to
// configure which hosts next/image is allowed to load from
// (apps/web/next.config.ts). Keeping one list means a host can't be
// accepted by validation but then fail to render (or vice versa).
export const ALLOWED_IMAGE_HOSTS = [
  "images.unsplash.com",
  "picsum.photos",
  "fastly.picsum.photos",
  "cdn.fashn.ai",
  "media.fashn.ai",
] as const;

export function isAllowedImageUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return url.protocol === "https:" && (ALLOWED_IMAGE_HOSTS as readonly string[]).includes(url.hostname);
}
