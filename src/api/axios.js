// client/src/api/axios.js
import axios from "axios";
import { getAxiosBaseURL } from "../config/api";
import { secureMediaDeep } from "../lib/media-url";

const api = axios.create({
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  config.baseURL = getAxiosBaseURL();
  return config;
});

// Upgrade http:// media URLs (e.g. Cloudinary) so HTTPS pages don't log Mixed Content
api.interceptors.response.use((response) => {
  if (response?.data) {
    response.data = secureMediaDeep(response.data);
  }
  return response;
});

let interceptorsAttached = false;

function shouldAttemptRefresh(url, config) {
  if ((config?._refreshAttempts || 0) >= 2) return false;
  const u = url || "";
  if (u.includes("/api/auth/login")) return false;
  if (u.includes("/api/auth/refresh")) return false;
  return true;
}

function handleSessionExpired(store, logoutAction) {
  try {
    store.dispatch(logoutAction());
  } catch {
    // fail-safe
  }
}

/**
 * Attach global loading interceptors after Redux store is ready.
 * Called from main.jsx to avoid circular imports (store → slices → api → store).
 */
export function setupApiInterceptors(store, setLoadingAction, logoutAction, setUserAction) {
  if (interceptorsAttached || !store || !setLoadingAction) return;
  interceptorsAttached = true;

  let pendingRequests = 0;
  let isRefreshing = false;
  let refreshQueue = [];

  function processRefreshQueue(error) {
    refreshQueue.forEach(({ resolve, reject, config }) => {
      if (error) {
        reject(error);
      } else {
        resolve(api(config));
      }
    });
    refreshQueue = [];
  }

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
    async (error) => {
      const originalConfig = error?.config;
      if (!originalConfig || !originalConfig.skipGlobalLoader) stopLoading();

      const status = error?.response?.status;
      const url = originalConfig?.url || "";

      if (
        status === 401 &&
        logoutAction &&
        originalConfig &&
        shouldAttemptRefresh(url, originalConfig)
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            refreshQueue.push({ resolve, reject, config: originalConfig });
          });
        }

        originalConfig._refreshAttempts = (originalConfig._refreshAttempts || 0) + 1;
        isRefreshing = true;

        try {
          const refreshResponse = await api.post(
            "/api/auth/refresh",
            {},
            { skipGlobalLoader: true, _refreshAttempts: 2 }
          );

          if (refreshResponse?.data?.success) {
            const user = refreshResponse.data.user;
            if (user && setUserAction) {
              try {
                store.dispatch(setUserAction(user));
              } catch {
                // fail-safe
              }
            }
            processRefreshQueue(null);
            const retryConfig = { ...originalConfig };
            return api(retryConfig);
          }

          const refreshErr = new Error("Token refresh failed");
          processRefreshQueue(refreshErr);
          handleSessionExpired(store, logoutAction);
          return Promise.reject(refreshErr);
        } catch (refreshError) {
          processRefreshQueue(refreshError);
          handleSessionExpired(store, logoutAction);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
}

export default api;
