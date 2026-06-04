import api from "./api";
import { API_BASE_URL } from "../config/envUrls";

function resolveSoilReportUrl() {
  const apiBase = API_BASE_URL;
  const devTargetRaw = String(process.env.REACT_APP_DEV_PROXY_TARGET || "").trim();
  const devTarget = devTargetRaw
    ? devTargetRaw.replace("127.0.0.1", "localhost")
    : "";
  const path = "/api/soil-health/report";

  if (/^https?:\/\//i.test(apiBase)) {
    return `${apiBase.replace(/\/$/, "")}${path}`;
  }

  if (apiBase.startsWith("/") && /^https?:\/\//i.test(devTarget)) {
    return `${devTarget.replace(/\/$/, "")}${apiBase}${path}`;
  }

  return path;
}

export const generateSoilReportAPI = async (payload) => {
  const response = await api.post(resolveSoilReportUrl(), payload, {
    timeout: 120000,
  });
  return response.data;
};
