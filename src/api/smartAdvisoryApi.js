import axios from "axios";

let store;

export const attachSmartAdvisoryStore = (reduxStore) => {
  store = reduxStore;
};

const smartAdvisoryApi = axios.create({
  baseURL: process.env.REACT_APP_SMART_ADVISORY || "/v2/api",
  withCredentials: true,
  timeout: 30000,
});

smartAdvisoryApi.interceptors.request.use((config) => {
  const token = store?.getState()?.auth?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
