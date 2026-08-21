/**
 * Single source of truth for Cropgen API hosts.
 *
 * Flip all Node/cropgen-server URLs with:
 *   REACT_APP_API_TARGET=production | local
 *
 * Satellite (Python) is independent and usually stays production:
 *   REACT_APP_SATELLITE_TARGET=production | local
 *
 * Any REACT_APP_* URL still set in .env overrides the matching preset.
 */

export function getReactAppUrl(key, fallback = "") {
  const raw = process.env[key];
  const cleaned = String(raw ?? "")
    .split("#")[0]
    .trim();
  return cleaned || fallback;
}

const PROD_SERVER = "https://server.cropgenapp.com";
const LOCAL_SERVER = "http://127.0.0.1:7070";
const PROD_SATELLITE = `${PROD_SERVER}/v4/api`;
const LOCAL_SATELLITE = "http://127.0.0.1:8001/v4/api";
const PROD_LOCATION = "https://location.cropgenapp.com";

const TARGETS = {
  production: {
    api: `${PROD_SERVER}/v1`,
    smartAdvisory: `${PROD_SERVER}/v2/api`,
    agent: PROD_SERVER,
    location: PROD_LOCATION,
    site: "https://www.cropgenapp.com",
  },
  local: {
    api: `${LOCAL_SERVER}/v1`,
    smartAdvisory: `${LOCAL_SERVER}/v2/api`,
    agent: LOCAL_SERVER,
    location: PROD_LOCATION,
    site: "http://localhost:3000",
  },
};

function readTarget(key, fallback) {
  const raw = getReactAppUrl(key, fallback).toLowerCase();
  return raw === "local" ? "local" : "production";
}

function overrideOr(envKey, value) {
  return getReactAppUrl(envKey) || value;
}

function stripSlash(url) {
  return String(url || "").replace(/\/$/, "");
}

/** Node server is not the Python satellite service — never send v4 traffic to :7070. */
function normalizeSatelliteUrl(raw) {
  if (!raw) return PROD_SATELLITE;
  if (/(localhost|127\.0\.0\.1):7070/.test(raw)) return PROD_SATELLITE;
  if (
    /127\.0\.0\.1:8001\/api\/?$/.test(raw) ||
    /localhost:8001\/api\/?$/.test(raw)
  ) {
    return LOCAL_SATELLITE;
  }
  let base = stripSlash(raw);
  if (/\/v1\/api$/.test(base)) {
    base = base.replace(/\/v1\/api$/, "/v4/api");
  }
  return base;
}

export const API_TARGET = readTarget("REACT_APP_API_TARGET", "production");
export const SATELLITE_TARGET = readTarget(
  "REACT_APP_SATELLITE_TARGET",
  "production",
);

const preset = TARGETS[API_TARGET];
const satellitePreset =
  SATELLITE_TARGET === "local" ? LOCAL_SATELLITE : PROD_SATELLITE;

export const API_BASE_URL = stripSlash(
  overrideOr("REACT_APP_API_URL", preset.api),
);
export const SMART_ADVISORY_URL = stripSlash(
  overrideOr("REACT_APP_SMART_ADVISORY", preset.smartAdvisory),
);
export const SATELLITE_API_URL = normalizeSatelliteUrl(
  overrideOr("REACT_APP_API_URL_SATELLITE", satellitePreset),
);
export const SATELLITE_API_KEY = getReactAppUrl(
  "REACT_APP_SATELLITE_API",
  "CROPGEN_230498adklfjadsljf",
);
export const AGENT_URL = stripSlash(
  overrideOr(
    "REACT_APP_CROPGEN_AGENT_URL",
    getReactAppUrl("REACT_APP_AGENT_URL", preset.agent),
  ),
);
export const LOCATION_API_URL = stripSlash(
  overrideOr("REACT_APP_LOCATION_API_URL", preset.location),
);
export const SITE_URL = stripSlash(
  overrideOr("REACT_APP_SITE_URL", preset.site),
);
export const SOCKET_IO_PATH = getReactAppUrl(
  "REACT_APP_SOCKET_IO_PATH",
  "/v3/socket.io",
).replace(/\/+$/, "");
export const S3_BUCKET_URL = stripSlash(
  getReactAppUrl(
    "REACT_APP_S3_BUCKET_URL",
    "https://cropgen-assets.s3.ap-south-1.amazonaws.com",
  ),
);

if (process.env.NODE_ENV === "development") {
  // eslint-disable-next-line no-console
  console.info("[cropgen env]", {
    API_TARGET,
    SATELLITE_TARGET,
    API_BASE_URL,
    SMART_ADVISORY_URL,
    SATELLITE_API_URL,
    AGENT_URL,
    LOCATION_API_URL,
    SITE_URL,
  });
}
