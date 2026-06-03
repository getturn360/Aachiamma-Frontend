// client/src/api/axios.js
import axios from "axios";
import { getAxiosBaseURL } from "../config/api";

const api = axios.create({
  baseURL: getAxiosBaseURL(),
  withCredentials: true,
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
}

export function clearAuthToken() {
  try {
    delete api.defaults.headers.common.Authorization;
  } catch {
    // ignore
  }
}

function readStoredToken() {
  try {
    const raw = localStorage.getItem("auth_token");
    if (!raw) return null;
    return raw.startsWith('"') && raw.endsWith('"') ? raw.slice(1, -1) : raw;
  } catch {
    return null;
  }
}

let interceptorsAttached = false;

/**
 * Attach global loading interceptors after Redux store is ready.
 * Called from main.jsx to avoid circular imports (store → slices → api → store).
 */
export function setupApiInterceptors(store, setLoadingAction) {
  if (interceptorsAttached || !store || !setLoadingAction) return;
  interceptorsAttached = true;

  let pendingRequests = 0;

  function startLoading(message = null) {
    pendingRequests += 1;
    try {
      store.dispatch(setLoadingAction({ value: true, message }));
    } catch {
      // fail-safe
    }
  }

  function stopLoading() {
    pendingRequests = Math.max(0, pendingRequests - 1);
    if (pendingRequests === 0) {
      try {
        store.dispatch(setLoadingAction({ value: false, message: null }));
      } catch {
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
}

try {
  const token = readStoredToken();
  if (token) setAuthToken(token);

  if (typeof window !== "undefined") {
    window.addEventListener("storage", (ev) => {
      if (ev.key === "auth_token") {
        if (ev.newValue) {
          const t =
            ev.newValue.startsWith('"') && ev.newValue.endsWith('"')
              ? ev.newValue.slice(1, -1)
              : ev.newValue;
          setAuthToken(t);
        } else {
          clearAuthToken();
        }
      }
    });
  }
} catch {
  // ignore localStorage errors
}

export default api;
