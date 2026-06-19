/**
 * Single source of truth for API host / base URL.
 *
 * Vite: VITE_API_BASE or VITE_API_URL (e.g. http://localhost:5000)
 * Runtime override: window.REACT_APP_API_BASE_URL
 * Production build without env: Fly backend (see PRODUCTION_API_DEFAULT)
 * Dev fallback: "" (same-origin /api/... via Vite proxy)
 */

/** Used when VITE_API_BASE is not set at build time (e.g. Vercel env missing). */
const PRODUCTION_API_DEFAULT = "https://aachiamma-backend.fly.dev";

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

  const fromEnv = normalizeApiHost(buildBase || runtimeBase);
  if (fromEnv) return fromEnv;

  try {
    if (typeof import.meta !== "undefined" && import.meta.env?.PROD) {
      return PRODUCTION_API_DEFAULT;
    }
  } catch {
    // ignore
  }

  return "";
}

/** Axios instance baseURL — empty in dev uses same-origin /api/... paths (Vite proxy). */
export function getAxiosBaseURL() {
  const host = getApiHost();
  return host || "";
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
