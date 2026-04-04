/**
 * Vegetation + water index timeseries — shared by dashboard components (direct fetch)
 * and satelliteSlice thunks (legacy dispatch). Uses same idb cache + satellite base URL.
 */
import axios from "axios";
import { get, set } from "idb-keyval";

const SATELLITE_API_KEY =
  process.env.REACT_APP_SATELLITE_API || "CROPGEN_230498adklfjadsljf";

function getSatelliteApiBase() {
  const raw = process.env.REACT_APP_API_URL_SATELLITE?.trim();
  const prodFallback = "https://server.cropgenapp.com/v4/api";
  const localPython = "http://127.0.0.1:8001/v4/api";

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

  if (process.env.NODE_ENV === "development") {
    return localPython;
  }

  return prodFallback;
}

const SATELLITE_BASE_URL = getSatelliteApiBase();

function arraysEqual(a, b) {
  return a.length === b.length && a.every((val, index) => val === b[index]);
}

const CACHE_TTL = 4 * 24 * 60 * 60 * 1000;
const TIMESERIES_MAX_POINTS = 36;
const SATELLITE_REQUEST_TIMEOUT_MS = 20000;

function generateCacheKey(prefix, input) {
  const inputStr = JSON.stringify(input);
  const hash = inputStr.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
  return `api_cache_${prefix}_${Math.abs(hash)}`;
}

function buildPolygonCoordinates(geometry) {
  const coordinates = geometry?.map(({ lat, lng }) => {
    if (typeof lat !== "number" || typeof lng !== "number") {
      throw new Error(`Invalid coordinate: lat=${lat}, lng=${lng}`);
    }
    return [lng, lat];
  });

  if (
    coordinates.length > 0 &&
    !arraysEqual(coordinates[0], coordinates[coordinates.length - 1])
  ) {
    coordinates.push(coordinates[0]);
  }

  return coordinates;
}

/**
 * @returns {Promise<object>} API JSON payload
 */
export async function fetchVegetationTimeSeriesSummary({
  startDate,
  endDate,
  geometry,
  index,
}) {
  const input = { startDate, endDate, geometry, index };
  const cacheKey = generateCacheKey("indexTimeSeriesSummary", input);
  const cached = await get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  if (!startDate || !endDate || !geometry || !index) {
    throw new Error("Missing required parameters");
  }

  const coordinates = buildPolygonCoordinates(geometry);

  const response = await axios.post(
    `${SATELLITE_BASE_URL}/timeseries/vegetation/vegetation`,
    {
      geometry: {
        type: "Polygon",
        coordinates: [coordinates],
      },
      start_date: startDate,
      end_date: endDate,
      index,
      provider: "both",
      satellite: "s2",
      max_items: TIMESERIES_MAX_POINTS,
    },
    {
      headers: { "x-api-key": SATELLITE_API_KEY },
      timeout: SATELLITE_REQUEST_TIMEOUT_MS,
    },
  );

  await set(cacheKey, { data: response.data, timestamp: now });
  return response.data;
}

/**
 * @returns {Promise<object>} API JSON payload
 */
export async function fetchWaterIndexTimeSeries({
  startDate,
  endDate,
  geometry,
  index,
}) {
  const input = { startDate, endDate, geometry, index };
  const cacheKey = generateCacheKey("fetchWaterIndexData", input);
  const cached = await get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  if (!startDate || !endDate || !geometry || !index) {
    throw new Error("Missing required parameters");
  }

  const coordinates = buildPolygonCoordinates(geometry);

  const response = await axios.post(
    `${SATELLITE_BASE_URL}/timeseries/water/water`,
    {
      geometry: {
        type: "Polygon",
        coordinates: [coordinates],
      },
      start_date: startDate,
      end_date: endDate,
      index,
      provider: "both",
      satellite: "s2",
      max_items: TIMESERIES_MAX_POINTS,
    },
    {
      headers: { "x-api-key": SATELLITE_API_KEY },
      timeout: SATELLITE_REQUEST_TIMEOUT_MS,
    },
  );

  await set(cacheKey, { data: response.data, timestamp: now });
  return response.data;
}
