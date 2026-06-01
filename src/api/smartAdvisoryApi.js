import axios from "axios";
import { attachAuthResponseInterceptor } from "./setupAuthInterceptor.js";

let store;
let onUnauthorized = null;

export const attachSmartAdvisoryStore = (reduxStore, unauthorizedHandler) => {
  store = reduxStore;
  onUnauthorized = unauthorizedHandler ?? null;
};

const smartAdvisoryApi = axios.create({
  baseURL: process.env.REACT_APP_SMART_ADVISORY || "/v2/api",
  withCredentials: true,
  timeout: 30000,
});

smartAdvisoryApi.interceptors.request.use((config) => {
  config.headers["X-Client-App"] = "cropgen_web";
  const token = store?.getState()?.auth?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

attachAuthResponseInterceptor(
  smartAdvisoryApi,
  () => store,
  () => onUnauthorized?.(),
);

export const updateAdvisoryActivityProgressAPI = async ({
  advisoryId,
  activityType,
  progress,
}) => {
  const response = await smartAdvisoryApi.patch(
    `/advisory/${advisoryId}/activities/${activityType}/progress`,
    { progress }
  );
  return response.data;
};

export default smartAdvisoryApi;
