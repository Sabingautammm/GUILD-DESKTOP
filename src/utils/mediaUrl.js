// Resolve uploaded-file URLs that may be stored as relative paths (legacy
// rows) to a fully loadable URL. The backend now stores absolute URLs, but
// older uploads still have "/uploads/..." relative paths that resolve against
// the frontend origin and 404 there — so prefix them with the API origin.
const API_ORIGIN = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export function resolveMediaUrl(url) {
  if (!url) return "";
  if (/^(https?:)?\/\//.test(url) || url.startsWith("data:")) return url;
  if (url.startsWith("/uploads")) return `${API_ORIGIN}${url}`;
  return url;
}
