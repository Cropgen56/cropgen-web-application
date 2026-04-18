import axios from "axios";

const DEFAULT_CACHE_TTL_MS = 4 * 24 * 60 * 60 * 1000; // 4 days
const DEFAULT_TIMEOUT_MS = 20000;
const DEFAULT_MAX_ITEMS = 24; // smaller payload than 36 -> usually faster

const SATELLITE_API_KEY =
  process.env.REACT_APP_SATELLITE_API || "CROPGEN_230498adklfjadsljf";

function getSatelliteApiBase() {
  const raw = process.env.REACT_APP_API_URL_SATELLITE?.trim();
  const prodFallback = "https://server.cropgenapp.com/v4/api";
  const localPython = "http://127.0.0.1:8001/v4/api";
  const browserHost =
    typeof window !== "undefined" ? window.location.hostname : "";
  const isLocalBrowser =
    browserHost === "localhost" || browserHost === "127.0.0.1";

  if (raw) {
    if (/(localhost|127\.0\.0\.1):7070/.test(raw)) {
      return prodFallback;
    }
    if (
      /127\.0\.0\.1:8001\/api\/?$/.test(raw) ||
      /localhost:8001\/api\/?$/.test(raw)
    ) {
      return localPython;
    }
    let base = raw.replace(/\/$/, "");
    if (/\/v1\/api$/.test(base)) {
      base = base.replace(/\/v1\/api$/, "/v4/api");
    }
    return base;
  }

  if (isLocalBrowser || process.env.NODE_ENV === "development") {
    return localPython;
  }

  return prodFallback;
}

const SATELLITE_BASE_URL = getSatelliteApiBase();

function arraysEqual(a, b) {
  return a.length === b.length && a.every((val, index) => val === b[index]);
}

function normalizeLatLngGeometryToLngLatRing(geometry) {
  const coordinates = geometry?.map(({ lat, lng }) => {
    if (typeof lat !== "number" || typeof lng !== "number") {
      throw new Error(`Invalid coordinate: lat=${lat}, lng=${lng}`);
    }
    return [lng, lat];
  });

  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    throw new Error("Geometry is missing");
  }

  if (!arraysEqual(coordinates[0], coordinates[coordinates.length - 1])) {
    coordinates.push(coordinates[0]);
  }

  return coordinates;
}

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

  const ring = normalizeLatLngGeometryToLngLatRing(geometry);
  const payload = {
    geometry: { type: "Polygon", coordinates: [ring] },
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

