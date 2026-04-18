import axios from "axios";

const LOCATION_BASE_URL =
  process.env.REACT_APP_LOCATION_API_URL || "http://localhost:3001";

export async function getCountries() {
  const res = await axios.get(`${LOCATION_BASE_URL}/api/countries`);
  return res.data?.data || [];
}

/** Optional list for onboarding; falls back in UI if the endpoint is missing. */
export async function getLanguages() {
  const res = await axios.get(`${LOCATION_BASE_URL}/api/languages`);
  const raw = res.data?.data ?? res.data;
  return Array.isArray(raw) ? raw : [];
}

export async function getStatesByCountry(countryCode) {
  const res = await axios.get(`${LOCATION_BASE_URL}/api/states/${countryCode}`);
  return res.data?.data || [];
}

export async function searchCitiesByState(stateCode, query = "") {
  const res = await axios.get(`${LOCATION_BASE_URL}/api/cities`, {
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
    const res = await axios.get(`${LOCATION_BASE_URL}/api/cities/all`, {
      params: { state: stateCode, page, limit },
    });
    const data = Array.isArray(res.data?.data) ? res.data.data : [];
    collected.push(...data);
    totalPages = Number(res.data?.pagination?.totalPages || 1);
    page += 1;
  } while (page <= totalPages);

  return collected;
}
