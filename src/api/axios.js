// client/src/api/axios.js
import axios from "axios";
import store from "../store/store";
import { setLoading } from "../store/common-slice";

/**
 * Robust base resolution:
 * 1) Vite build-time: import.meta.env.VITE_API_BASE
 * 2) Runtime override: window.REACT_APP_API_BASE_URL
 * 3) Fallback to relative "/api"
 */
function normalizeBase(url) {
  if (!url) return "";
  return String(url).replace(/\/+$/, "");
}

let buildBase = "";
try {
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) {
    buildBase = String(import.meta.env.VITE_API_BASE);
  }
} catch (e) {
  buildBase = "";
}

let runtimeBase = "";
try {
  if (typeof window !== "undefined" && window.REACT_APP_API_BASE_URL) {
    runtimeBase = String(window.REACT_APP_API_BASE_URL);
  }
} catch (e) {
  runtimeBase = "";
}

const resolvedBase = normalizeBase(buildBase || runtimeBase || "");
const baseURL = resolvedBase || "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// ref-count to support concurrent requests without hiding loader too early
let pendingRequests = 0;

function startLoading(message = null) {
  pendingRequests += 1;
  try {
    store.dispatch(setLoading({ value: true, message }));
  } catch (e) {
    // fail-safe
  }
}

function stopLoading() {
  pendingRequests = Math.max(0, pendingRequests - 1);
  if (pendingRequests === 0) {
    try {
      store.dispatch(setLoading({ value: false, message: null }));
    } catch (e) {
      // ignore
    }
  }
}

api.interceptors.request.use(
  (config) => {
    const msg =
      config._loadingMessage ||
      (config.headers && config.headers["x-loading-message"]) ||
      null;
    const skipLoader = !!config.skipGlobalLoader;
    if (!skipLoader) startLoading(msg);
    return config;
  },
  (error) => {
    if (!error?.config || !error.config.skipGlobalLoader) stopLoading();
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const cfg = response && response.config;
    const skipLoader = !!(cfg && cfg.skipGlobalLoader);
    if (!skipLoader) stopLoading();
    return response;
  },
  (error) => {
    if (!error?.config || !error.config.skipGlobalLoader) stopLoading();
    return Promise.reject(error);
  }
);

/**
 * Attach Authorization header automatically from localStorage
 * and listen to storage changes so other tabs update header.
 */
try {
  let raw = null;
  try {
    raw = localStorage.getItem("auth_token");
  } catch (e) {
    raw = null;
  }

  if (raw) {
    const token = raw.startsWith('"') && raw.endsWith('"') ? raw.slice(1, -1) : raw;
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  try {
    window.addEventListener("storage", (ev) => {
      if (ev.key === "auth_token") {
        const v = ev.newValue;
        if (v) {
          const t = v.startsWith('"') && v.endsWith('"') ? v.slice(1, -1) : v;
          api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
        } else {
          try {
            delete api.defaults.headers.common["Authorization"];
          } catch (e) {}
        }
      }
    });
  } catch (e) {
    // ignore in non-window env
  }
} catch (e) {
  // ignore any localStorage access error
}

export default api;
