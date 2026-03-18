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

if (typeof window !== "undefined") {
  // helpful debug info in browser console
  try {
    console.info("[api] baseURL =", baseURL);
  } catch (e) {}
}

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// ref-count to support concurrent requests without hiding loader too early
let pendingRequests = 0;

function startLoading(message = null) {
  pendingRequests += 1;
  try {
    // keep existing payload shape ({ value: boolean, message })
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

// Request interceptor: start loader automatically.
// Callers can pass:
//   api.get(url, { _loadingMessage: 'Loading...' })
// or set header 'x-loading-message' in the request options.
api.interceptors.request.use(
  (config) => {
    const msg =
      config._loadingMessage ||
      (config.headers && config.headers["x-loading-message"]) ||
      null;
    startLoading(msg);
    return config;
  },
  (error) => {
    stopLoading();
    return Promise.reject(error);
  }
);

// Response interceptor: stop loader on success or error.
api.interceptors.response.use(
  (response) => {
    stopLoading();
    return response;
  },
  (error) => {
    stopLoading();
    // small hint if backend route not found
    try {
      if (error?.response?.status === 404 && error?.response?.data?.message) {
        console.warn("[api] response 404:", error.response.data.message);
      }
    } catch (e) {}
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
