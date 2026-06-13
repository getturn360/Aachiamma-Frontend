// client/src/api/axios.js
import axios from "axios";
import { getAxiosBaseURL } from "../config/api";

const api = axios.create({
  baseURL: getAxiosBaseURL(),
  withCredentials: true,
});

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

export default api;
