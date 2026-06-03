/**
 * Single source of truth for API host / base URL.
 *
 * Vite: VITE_API_BASE or VITE_API_URL (e.g. http://localhost:5000)
 * Runtime override: window.REACT_APP_API_BASE_URL
 * Fallback: "/api" (relative — Vite dev proxy or same-origin)
 */

export function normalizeApiHost(url) {
  if (!url) return "";
  return String(url).replace(/\/+$/, "");
}

export function getApiHost() {
  let buildBase = "";
  try {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      buildBase =
        import.meta.env.VITE_API_BASE ||
        import.meta.env.VITE_API_URL ||
        "";
    }
  } catch {
    buildBase = "";
  }

  let runtimeBase = "";
  try {
    if (typeof window !== "undefined" && window.REACT_APP_API_BASE_URL) {
      runtimeBase = String(window.REACT_APP_API_BASE_URL);
    }
  } catch {
    runtimeBase = "";
  }

  return normalizeApiHost(buildBase || runtimeBase);
}

/** Axios instance baseURL */
export function getAxiosBaseURL() {
  const host = getApiHost();
  return host || "/api";
}

/** Normalize path to start with /api */
export function normalizeApiPath(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return p.startsWith("/api") ? p : `/api${p}`;
}

/** Full URL for fetch() or window.open — respects env host */
export function apiUrl(path) {
  const normalized = normalizeApiPath(path);
  const host = getApiHost();
  return host ? `${host}${normalized}` : normalized;
}
