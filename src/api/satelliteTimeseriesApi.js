import axios from "axios";
import { SATELLITE_API_KEY, SATELLITE_API_URL } from "../config/envUrls";
import { toApiPolygon } from "../utils/farmGeometry";

const DEFAULT_CACHE_TTL_MS = 4 * 24 * 60 * 60 * 1000; // 4 days
const DEFAULT_TIMEOUT_MS = 20000;
const DEFAULT_MAX_ITEMS = 24; // smaller payload than 36 -> usually faster

const SATELLITE_BASE_URL = SATELLITE_API_URL;

// Simple in-memory cache (fast) with TTL. Keyed by endpoint+payload.
const memCache = new Map();
function makeCacheKey(endpoint, payload) {
  return `${endpoint}::${JSON.stringify(payload)}`;
}

function getCached(key, ttlMs) {
  const hit = memCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.timestamp > ttlMs) return null;
  return hit.data;
}

function setCached(key, data) {
  memCache.set(key, { data, timestamp: Date.now() });
}

async function postTimeseries({
  endpoint,
  startDate,
  endDate,
  geometry,
  index,
  maxItems = DEFAULT_MAX_ITEMS,
  ttlMs = DEFAULT_CACHE_TTL_MS,
  signal,
}) {
  if (!startDate || !endDate || !geometry || !index) {
    throw new Error("Missing required parameters");
  }

  const payload = {
    geometry: toApiPolygon(geometry),
    start_date: startDate,
    end_date: endDate,
    index: index,
    provider: "both",
    satellite: "s2",
    max_items: maxItems,
  };

  const cacheKey = makeCacheKey(endpoint, payload);
  const cached = getCached(cacheKey, ttlMs);
  if (cached) return { data: cached, fromCache: true };

  const response = await axios.post(`${SATELLITE_BASE_URL}${endpoint}`, payload, {
    headers: { "x-api-key": SATELLITE_API_KEY },
    timeout: DEFAULT_TIMEOUT_MS,
    signal,
  });

  setCached(cacheKey, response.data);
  return { data: response.data, fromCache: false };
}

export async function fetchVegetationTimeseries(params) {
  return postTimeseries({
    ...params,
    endpoint: "/timeseries/vegetation/vegetation",
  });
}

export async function fetchWaterTimeseries(params) {
  return postTimeseries({
    ...params,
    endpoint: "/timeseries/water/water",
  });
}

