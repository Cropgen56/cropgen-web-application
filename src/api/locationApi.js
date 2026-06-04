import axios from "axios";
import { buildFallbackCountries } from "../utility/countryFallback";
import { getReactAppUrl } from "../config/envUrls";

const LOCATION_BASE_URL = getReactAppUrl(
  "REACT_APP_LOCATION_API_URL",
  "http://localhost:3001",
);

const locationClient = axios.create({
  baseURL: LOCATION_BASE_URL,
  timeout: 12000,
});

export async function getCountries() {
  try {
    const res = await locationClient.get("/api/countries");
    const data = res.data?.data;
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[locationApi] Countries API unavailable, using local list.",
        err?.message || err,
      );
    }
  }
  return buildFallbackCountries();
}

/** Optional list for onboarding; falls back in UI if the endpoint is missing. */
export async function getLanguages() {
  try {
    const res = await locationClient.get("/api/languages");
    const raw = res.data?.data ?? res.data;
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export async function getStatesByCountry(countryCode) {
  const res = await locationClient.get(`/api/states/${countryCode}`);
  return res.data?.data || [];
}

export async function searchCitiesByState(stateCode, query = "") {
  const res = await locationClient.get("/api/cities", {
    params: { state: stateCode, q: query },
  });
  return res.data?.data || [];
}

export async function getCitiesByState(stateCode) {
  const collected = [];
  let page = 1;
  const limit = 200;
  let totalPages = 1;

  do {
    const res = await locationClient.get("/api/cities/all", {
      params: { state: stateCode, page, limit },
    });
    const data = Array.isArray(res.data?.data) ? res.data.data : [];
    collected.push(...data);
    totalPages = Number(res.data?.pagination?.totalPages || 1);
    page += 1;
  } while (page <= totalPages);

  return collected;
}
