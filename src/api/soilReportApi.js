import api from "./api";

export const generateSoilReportAPI = async (payload) => {
  const response = await api.post("/api/soil-health/report", payload, {
    timeout: 180000,
  });
  return response.data;
};
