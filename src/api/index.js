import axios from "axios";
import { refreshAccessToken, logout } from "../redux/slices/authSlice";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:7070/v1/api",
  withCredentials: true,
  timeout: 30000,
});

let store;

export const setStore = (storeInstance) => {
  store = storeInstance;
};

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const result = await store.dispatch(refreshAccessToken()).unwrap();
        if (result?.accessToken) {
          api.defaults.headers.Authorization = `Bearer ${result.accessToken}`;
          onRefreshed(result.accessToken);
          originalRequest.headers.Authorization = `Bearer ${result.accessToken}`;
          return api(originalRequest);
        }
        throw new Error("No access token in refresh response");
      } catch (err) {
        store.dispatch(logout());
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
