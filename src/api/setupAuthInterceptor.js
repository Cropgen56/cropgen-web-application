import { isTokenValid } from "../utility/token";

/**
 * On 401 with Bearer auth: try one silent refresh, retry request, logout only if still invalid.
 */
export function attachAuthResponseInterceptor(axiosInstance, getStore, onForceLogout) {
  let refreshPromise = null;

  const runRefresh = async () => {
    const store = getStore?.();
    if (!store) return false;
    const { refreshAccessToken } = await import("../redux/slices/authSlice");
    try {
      await store.dispatch(refreshAccessToken()).unwrap();
      return true;
    } catch {
      return false;
    }
  };

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config;
      const authHeader =
        original?.headers?.Authorization || original?.headers?.authorization;
      const hadBearer =
        typeof authHeader === "string" && authHeader.startsWith("Bearer ");

      if (
        error.response?.status !== 401 ||
        !hadBearer ||
        original?._authRetry
      ) {
        return Promise.reject(error);
      }

      original._authRetry = true;

      if (!refreshPromise) {
        refreshPromise = runRefresh().finally(() => {
          refreshPromise = null;
        });
      }

      const refreshed = await refreshPromise;
      const store = getStore?.();
      const token = store?.getState()?.auth?.token;

      if (refreshed && token) {
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(original);
      }

      if (!isTokenValid(token)) {
        onForceLogout?.();
      }

      return Promise.reject(error);
    },
  );
}
