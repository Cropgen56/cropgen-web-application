import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { get, set } from "idb-keyval";
import { SATELLITE_API_KEY, SATELLITE_API_URL } from "../../config/envUrls";
import {
  buildAlertsFromVraRates,
  buildZonesFromVraRates,
} from "../../components/dashboard/mapview/zoning/vraZoningMapper";
import { toApiPolygon } from "../../utils/farmGeometry";

const SATELLITE_REQUEST_TIMEOUT_MS = 360000;
const SATELLITE_BASE_URL = SATELLITE_API_URL;

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

  return toApiPolygon({ type: "Polygon", coordinates: [ring] });
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
      include_prescription_geojson: false,
      n_zones: 5,
      auto_region: true,
      soc_method: "published",
    },
    satelliteAxiosConfig(),
  );
  return response.data;
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

      const start_date = daysBefore(end_date, 365);
      const result = await analyzeVraRaw({
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
        if (imgs.SOC) slot.activeLayer = "SOC";
        else if (imgs.N) slot.activeLayer = "N";
        else if (imgs.OVERVIEW) slot.activeLayer = "Combined";
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
