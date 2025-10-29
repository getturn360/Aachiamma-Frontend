// client/src/api/axios.js
import axios from "axios";
import store from "../store/store";
import { setLoading } from "../store/common-slice";

let baseURL = import.meta.env.VITE_API_BASE || "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// ref-count to support concurrent requests without hiding loader too early
let pendingRequests = 0;

function startLoading(message = null) {
  pendingRequests += 1;
  // setLoading expects { value, message } in many projects; adjust if your slice differs
  try {
    store.dispatch(setLoading({ value: true, message }));
  } catch (e) {
    // fail-safe: if store or action not available, swallow error to avoid breaking requests
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
    // in case request creation fails
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
    return Promise.reject(error);
  }
);

/**
 * === NEW: attach Authorization header automatically from localStorage ===
 * Reads `localStorage.auth_token` (if present) and sets:
 *   api.defaults.headers.common['Authorization'] = `Bearer ${token}`
 *
 * Also listens to `storage` events so other tabs/login flows update header.
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
