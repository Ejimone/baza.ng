/**
 * Returns a Cloudinary URL with auto-optimisation transforms applied.
 * Safe to call with empty strings or non-Cloudinary URLs — returns url unchanged.
 *
 * @param url   Full Cloudinary image URL (or empty string)
 * @param width Target display width in logical pixels (not points)
 */
export function optimizedUrl(url: string, width: number): string {
  if (!url || !url.includes("cloudinary.com")) return url;
  // Insert w_{width},q_auto,f_auto transform before the version segment
  return url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`);
}
