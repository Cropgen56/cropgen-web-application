import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { get, set } from "idb-keyval";
import { getReactAppUrl } from "../../config/envUrls";
import {
  buildAlertsFromVraRates,
  buildZonesFromVraRates,
} from "../../components/dashboard/mapview/zoning/vraZoningMapper";

const SATELLITE_API_KEY =
  process.env.REACT_APP_SATELLITE_API || "CROPGEN_230498adklfjadsljf";
const SATELLITE_REQUEST_TIMEOUT_MS = 120000;

/** Python FastAPI base (e.g. …/v4/api — paths like /availability/, /soc/analysis, /vra/analysis). */
function getSatelliteApiBase() {
  const raw = getReactAppUrl("REACT_APP_API_URL_SATELLITE");
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

const satelliteAxiosConfig = () => ({
  headers: { "x-api-key": SATELLITE_API_KEY },
  timeout: SATELLITE_REQUEST_TIMEOUT_MS,
});

const CACHE_TTL = 4 * 24 * 60 * 60 * 1000;

const generateCacheKey = (prefix, input) => {
  const inputStr = JSON.stringify(input);
  const hash = inputStr.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
  return `api_cache_${prefix}_${Math.abs(hash)}`;
};

// ========== Pure helpers (geometry / crop / dates / errors) ==========

const VRA_CROPS = new Set([
  "wheat",
  "rice",
  "maize",
  "soybean",
  "sugarcane",
  "cotton",
  "onion",
  "potato",
  "tomato",
  "banana",
  "groundnut",
  "jowar",
  "bajra",
  "chili",
  "turmeric",
  "ginger",
  "mustard",
  "lentil",
  "gram",
]);

/** cropgen field points are always [{lat,lng}, ...] (never bare [lat,lng] arrays). */
export function fieldPointsToGeoJsonPolygon(fieldPoints) {
  if (!Array.isArray(fieldPoints) || fieldPoints.length < 3) {
    throw new Error("Field geometry requires at least 3 points");
  }

  const ring = fieldPoints.map((pt) => {
    const lat = Number(pt?.lat);
    const lng = Number(pt?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new Error(`Invalid coordinate: ${JSON.stringify(pt)}`);
    }
    return [lng, lat];
  });

  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push([first[0], first[1]]);
  }

  return { type: "Polygon", coordinates: [ring] };
}

export function normalizeVraCrop(cropName) {
  if (!cropName || typeof cropName !== "string") return "wheat";
  const key = cropName.trim().toLowerCase();
  if (VRA_CROPS.has(key)) return key;
  if (key.includes("onion")) return "onion";
  if (key.includes("wheat")) return "wheat";
  if (key.includes("rice") || key.includes("paddy")) return "rice";
  if (key.includes("maize") || key.includes("corn")) return "maize";
  if (key.includes("cotton")) return "cotton";
  if (key.includes("soy")) return "soybean";
  if (key.includes("sugar")) return "sugarcane";
  if (key.includes("potato")) return "potato";
  if (key.includes("tomato")) return "tomato";
  if (key.includes("chili") || key.includes("chilli")) return "chili";
  if (key.includes("groundnut") || key.includes("peanut")) return "groundnut";
  return "default";
}

export function daysBefore(isoDate, days) {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() - days);
    return fallback.toISOString().split("T")[0];
  }
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

/** Default end date ~21 days ago — Sentinel-2 scenes lag real-time. */
export function defaultAnalysisEndDate() {
  return daysBefore(new Date().toISOString().split("T")[0], 21);
}

export function formatApiError(err) {
  const detail = err?.response?.data?.detail ?? err?.response?.data?.message;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d) => d?.msg || d?.message || JSON.stringify(d))
      .join("; ");
  }
  if (detail && typeof detail === "object") return JSON.stringify(detail);
  return err?.message || "Satellite analysis failed";
}

function extractAvailableDates(availability) {
  const items = Array.isArray(availability?.items) ? availability.items : [];
  return items
    .map((it) =>
      String(
        it?.date ||
          it?.datetime ||
          it?.acquisition_date ||
          it?.properties?.datetime ||
          "",
      ).slice(0, 10),
    )
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort();
}

/** Pick best end_date from availability items, preferring preferredDate. */
export function resolveAnalysisEndDate(availability, preferredDate) {
  const dates = extractAvailableDates(availability);
  if (!dates.length) return preferredDate || defaultAnalysisEndDate();
  if (preferredDate && dates.includes(preferredDate)) return preferredDate;
  if (preferredDate) {
    const onOrBefore = dates.filter((d) => d <= preferredDate);
    if (onOrBefore.length) return onOrBefore[onOrBefore.length - 1];
  }
  return dates[dates.length - 1];
}

async function fetchAvailabilityRaw({ geometry, start_date, end_date }) {
  const response = await axios.post(
    `${SATELLITE_BASE_URL}/availability/`,
    { geometry, start_date, end_date, provider: "both", satellite: "s2" },
    satelliteAxiosConfig(),
  );
  return response.data;
}

async function analyzeVraRaw({ geometry, start_date, end_date, crop }) {
  const response = await axios.post(
    `${SATELLITE_BASE_URL}/vra/analysis`,
    {
      geometry,
      start_date,
      end_date,
      crop: normalizeVraCrop(crop),
      include_images: true,
      provider: "both",
      satellite: "s2",
    },
    satelliteAxiosConfig(),
  );
  return response.data;
}

async function analyzeSocRaw({ geometry, start_date, end_date }) {
  const response = await axios.post(
    `${SATELLITE_BASE_URL}/soc/analysis`,
    { geometry, start_date, end_date, provider: "both", satellite: "s2" },
    satelliteAxiosConfig(),
  );
  return response.data;
}

function normalizeSocResponse(soc) {
  if (!soc || typeof soc !== "object") return null;
  const image =
    typeof soc.image_base64 === "string" && soc.image_base64.length
      ? soc.image_base64
      : null;
  return {
    date: soc.date || soc.metadata?.capture_date || null,
    cloud_cover: soc.cloud_cover ?? soc.metadata?.cloud_cover ?? null,
    image_base64: image,
    soc_stats: soc.soc_stats || null,
    metadata: soc.metadata || null,
  };
}

/** Runs SOC + VRA together, tolerant of either failing independently. */
async function runSocAndVraAnalysis({ geometry, start_date, end_date, crop }) {
  const [socSettled, vraSettled] = await Promise.allSettled([
    analyzeSocRaw({ geometry, start_date, end_date }),
    analyzeVraRaw({ geometry, start_date, end_date, crop }),
  ]);

  const socRaw = socSettled.status === "fulfilled" ? socSettled.value : null;
  const vra = vraSettled.status === "fulfilled" ? vraSettled.value : null;
  const soc = normalizeSocResponse(socRaw);

  if (!soc && !vra) {
    const err =
      (vraSettled.status === "rejected" && vraSettled.reason) ||
      (socSettled.status === "rejected" && socSettled.reason);
    throw err || new Error("SOC and VRA analysis both failed");
  }

  const images = { ...(vra?.images || {}) };
  if (soc?.image_base64) images.soc_map_b64 = soc.image_base64;

  const soc_stats = soc?.soc_stats || vra?.soc_stats || null;

  return {
    date: soc?.date || vra?.date || end_date,
    crop: vra?.crop || normalizeVraCrop(crop),
    cloud_cover: soc?.cloud_cover ?? vra?.cloud_cover ?? null,
    vra_rates: vra?.vra_rates || null,
    soc_stats,
    images: Object.keys(images).length ? images : null,
    text_report: vra?.text_report || null,
    metadata: {
      ...(vra?.metadata || {}),
      soc_metadata: soc?.metadata || null,
      mean_indices: soc?.metadata?.mean_indices || null,
      collection:
        soc?.metadata?.collection || vra?.metadata?.collection || null,
      res_m: soc?.metadata?.res_m ?? vra?.metadata?.res_m ?? null,
      capture_date:
        soc?.metadata?.capture_date || soc?.date || vra?.date || null,
      soc_ok: Boolean(soc),
      vra_ok: Boolean(vra),
      soc_error:
        socSettled.status === "rejected"
          ? formatApiError(socSettled.reason)
          : null,
      vra_error:
        vraSettled.status === "rejected"
          ? formatApiError(vraSettled.reason)
          : null,
    },
  };
}

// ========== State shape ==========

export const DEFAULT_ZONING_FIELD_STATE = Object.freeze({
  zones: [],
  selectedZoneId: null,
  alerts: [],
  analysisDate: null,
  activeNutrient: "N",
  activeLayer: "SOC",
  vraResult: null,
  socStats: null,
  vraRates: null,
  images: null,
  textReport: null,
  hasGenerated: false,
  availableDates: [],
});

const initialState = {
  byField: {},
  loading: { availability: false, analysis: false },
  error: null,
  latestAvailabilityRequestKey: null,
  latestAnalysisRequestKey: null,
};

function ensureFieldSlot(state, fieldId) {
  if (!state.byField[fieldId]) {
    state.byField[fieldId] = { ...DEFAULT_ZONING_FIELD_STATE };
  }
  return state.byField[fieldId];
}

function rebuildZonesForField(fieldSlot, fieldBoundary) {
  const nextZones = buildZonesFromVraRates(
    fieldSlot.vraRates,
    fieldSlot.activeNutrient,
    fieldBoundary,
  );
  const nextAlerts = buildAlertsFromVraRates(
    fieldSlot.vraRates,
    fieldSlot.activeNutrient,
  );
  fieldSlot.zones = nextZones;
  fieldSlot.alerts = nextAlerts;
  const exists = nextZones.some((z) => z.id === fieldSlot.selectedZoneId);
  fieldSlot.selectedZoneId = exists
    ? fieldSlot.selectedZoneId
    : (nextZones[0]?.id ?? null);
}

// ========== Thunks ==========

/** Prefetch availability so the date picker can use real Sentinel-2 scenes. Cached (4-day TTL). */
export const fetchZoningAvailability = createAsyncThunk(
  "zoning/fetchZoningAvailability",
  async ({ fieldId, geometry }, { rejectWithValue }) => {
    try {
      const end_date = defaultAnalysisEndDate();
      const start_date = daysBefore(end_date, 180);
      const cacheKey = generateCacheKey("zoningAvailability", {
        fieldId,
        start_date,
        end_date,
      });

      const cached = await get(cacheKey);
      const now = Date.now();
      let availability;
      if (cached && now - cached.timestamp < CACHE_TTL) {
        availability = cached.data;
      } else {
        availability = await fetchAvailabilityRaw({
          geometry,
          start_date,
          end_date,
        });
        await set(cacheKey, { data: availability, timestamp: now });
      }

      const availableDates = extractAvailableDates(availability);
      const bestDate = resolveAnalysisEndDate(availability, end_date);
      return { fieldId, availableDates, bestDate };
    } catch (error) {
      return rejectWithValue({ fieldId, error: formatApiError(error) });
    }
  },
);

/** Runs the combined SOC+VRA "Generate Zones" analysis. Not cached — always fresh. */
export const runZoningAnalysis = createAsyncThunk(
  "zoning/runZoningAnalysis",
  async (
    { fieldId, fieldPoints, fieldBoundary, cropName, analysisDate },
    { rejectWithValue },
  ) => {
    try {
      const geometry = fieldPointsToGeoJsonPolygon(fieldPoints);
      const crop = normalizeVraCrop(cropName);

      let end_date = analysisDate || defaultAnalysisEndDate();
      try {
        const today = defaultAnalysisEndDate();
        const availability = await fetchAvailabilityRaw({
          geometry,
          start_date: daysBefore(end_date, 180),
          end_date: end_date > today ? today : end_date,
        });
        end_date = resolveAnalysisEndDate(availability, end_date);
      } catch {
        // Keep user-selected / default end_date
      }

      const start_date = daysBefore(end_date, 60);
      const result = await runSocAndVraAnalysis({
        geometry,
        start_date,
        end_date,
        crop,
      });

      return { fieldId, result, fieldBoundary };
    } catch (error) {
      return rejectWithValue({ fieldId, error: formatApiError(error) });
    }
  },
);

// ========== Slice ==========

const zoningSlice = createSlice({
  name: "zoning",
  initialState,
  reducers: {
    setActiveNutrient: (state, action) => {
      const { fieldId, nutrient, fieldBoundary } = action.payload;
      const slot = ensureFieldSlot(state, fieldId);
      slot.activeNutrient = nutrient;
      if (["N", "P", "K"].includes(nutrient)) {
        slot.activeLayer = nutrient;
      }
      if (slot.vraRates) rebuildZonesForField(slot, fieldBoundary);
    },
    setActiveLayer: (state, action) => {
      const { fieldId, layer } = action.payload;
      ensureFieldSlot(state, fieldId).activeLayer = layer;
    },
    setSelectedZoneId: (state, action) => {
      const { fieldId, zoneId } = action.payload;
      ensureFieldSlot(state, fieldId).selectedZoneId = zoneId;
    },
    setZones: (state, action) => {
      const { fieldId, zones } = action.payload;
      ensureFieldSlot(state, fieldId).zones = zones;
    },
    setAnalysisDate: (state, action) => {
      const { fieldId, date } = action.payload;
      ensureFieldSlot(state, fieldId).analysisDate = date;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchZoningAvailability.pending, (state, action) => {
        state.loading.availability = true;
        state.latestAvailabilityRequestKey = JSON.stringify(action.meta.arg);
      })
      .addCase(fetchZoningAvailability.fulfilled, (state, action) => {
        const { fieldId, availableDates, bestDate } = action.payload;
        if (
          JSON.stringify(action.meta.arg) !== state.latestAvailabilityRequestKey
        ) {
          return;
        }
        state.loading.availability = false;
        const slot = ensureFieldSlot(state, fieldId);
        slot.availableDates = availableDates;
        if (!slot.analysisDate) slot.analysisDate = bestDate;
      })
      .addCase(fetchZoningAvailability.rejected, (state) => {
        state.loading.availability = false;
      })

      .addCase(runZoningAnalysis.pending, (state, action) => {
        state.loading.analysis = true;
        state.error = null;
        state.latestAnalysisRequestKey = JSON.stringify(action.meta.arg);
      })
      .addCase(runZoningAnalysis.fulfilled, (state, action) => {
        const { fieldId, result, fieldBoundary } = action.payload;
        if (
          JSON.stringify(action.meta.arg) !== state.latestAnalysisRequestKey
        ) {
          return;
        }
        state.loading.analysis = false;
        const slot = ensureFieldSlot(state, fieldId);
        slot.vraResult = result;
        slot.socStats = result?.soc_stats || null;
        slot.vraRates = result?.vra_rates || null;
        slot.images = result?.images || null;
        slot.textReport = result?.text_report || null;
        slot.hasGenerated = true;
        if (result?.date) slot.analysisDate = result.date;

        rebuildZonesForField(slot, fieldBoundary);

        const imgs = result?.images || {};
        if (imgs.soc_map_b64) slot.activeLayer = "SOC";
        else if (imgs.vra_n_b64) slot.activeLayer = "N";
        else if (imgs.combined_b64) slot.activeLayer = "Combined";
      })
      .addCase(runZoningAnalysis.rejected, (state, action) => {
        if (
          JSON.stringify(action.meta.arg) !== state.latestAnalysisRequestKey
        ) {
          return;
        }
        state.loading.analysis = false;
        state.error = action.payload?.error || "Zoning analysis failed";
      });
  },
});

export const {
  setActiveNutrient,
  setActiveLayer,
  setSelectedZoneId,
  setZones,
  setAnalysisDate,
} = zoningSlice.actions;

export default zoningSlice.reducer;
