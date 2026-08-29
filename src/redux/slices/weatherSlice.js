import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { findAoiForField } from "../../utils/farmGeometry";

const OBSERVE_EARTH_KEY = process.env.REACT_APP_OBSERVE_EARTH_KEY;
const OBSERVE_EARTH_BASE = "https://observearth.com/api";

if (!OBSERVE_EARTH_KEY && process.env.NODE_ENV !== "test") {
  console.error(
    "REACT_APP_OBSERVE_EARTH_KEY is not set — AOI/weather requests will fail.",
  );
}

/**
 * Module-scoped (not per-component) lock so simultaneous callers — e.g.
 * Dashboard/Weather/SmartAdvisory/FarmReport all mount useAoiManagement
 * independently for the same field — await one shared in-flight request
 * instead of each firing its own POST and creating duplicate AOIs upstream.
 * Keyed by AOI name (= farm field id).
 */
const createAoiInFlight = new Map();

export const createAOI = createAsyncThunk(
  "weather/createAOI",
  async (payload, { rejectWithValue, dispatch, getState }) => {
    const existing = createAoiInFlight.get(payload.name);
    if (existing) {
      return existing;
    }

    const run = (async () => {
      const url = `${OBSERVE_EARTH_BASE}/geometry/`;

      try {
        // Always resolve against a fresh, fully-paginated fetch before
        // deciding to create — stale/partial state here is what caused
        // the same field to get a new AOI created on nearly every visit.
        await dispatch(fetchAOIs()).unwrap();
        const state = getState();
        const existingAOI = findAoiForField(state.weather.aois, payload.name);
        if (existingAOI) {
          return existingAOI.id;
        }

        const response = await axios.post(url, payload, {
          headers: {
            "X-API-Key": OBSERVE_EARTH_KEY,
            "Content-Type": "application/json",
          },
        });

        await dispatch(fetchAOIs()).unwrap();

        return response.data.id;
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || error.response?.data?.error || "";
        const errorText =
          typeof errorMessage === "string"
            ? errorMessage
            : JSON.stringify(errorMessage);
        const isSizeLimit = errorText.toLowerCase().includes("hectare");
        const isDuplicate =
          !isSizeLimit &&
          (error.response?.status === 409 ||
            error.response?.status === 400 ||
            errorText.toLowerCase().includes("already exists") ||
            errorText.toLowerCase().includes("duplicate"));

        if (isDuplicate) {
          await dispatch(fetchAOIs()).unwrap();
          const state = getState();
          const existingAOI = findAoiForField(
            state.weather.aois,
            payload.name,
          );
          if (existingAOI) {
            return existingAOI.id;
          }
        }

        throw error.response?.data || new Error("Failed to create AOI");
      }
    })();

    createAoiInFlight.set(payload.name, run);
    try {
      return await run;
    } catch (error) {
      return rejectWithValue(error);
    } finally {
      createAoiInFlight.delete(payload.name);
    }
  },
);

export const fetchAOIs = createAsyncThunk(
  "weather/fetchAOIs",
  async (_, { rejectWithValue }) => {
    let url = `${OBSERVE_EARTH_BASE}/geometry/?detail=false&page_size=200`;
    const aoisData = [];

    try {
      // Follow pagination fully — the account has more AOIs than one page
      // (default page size 50), and the old single-page fetch meant older
      // AOIs were invisible to the "does this field already have one?"
      // check, so they kept getting silently recreated.
      let guard = 0;
      while (url && guard < 100) {
        const response = await axios.get(url, {
          headers: { "X-API-Key": OBSERVE_EARTH_KEY },
        });

        if (Array.isArray(response.data)) {
          aoisData.push(...response.data);
          break;
        }

        aoisData.push(...(response.data.results || []));
        url = response.data.next || null;
        guard += 1;
      }

      return aoisData;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch AOIs");
    }
  },
);

export const fetchForecastData = createAsyncThunk(
  "weather/fetchForecastData",
  async ({ geometry_id }, { rejectWithValue }) => {
    const url = `${OBSERVE_EARTH_BASE}/weather/forecast/?geometry_id=${geometry_id}`;
    try {
      const response = await axios.get(url, {
        headers: { "X-API-Key": OBSERVE_EARTH_KEY },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch forecast data",
      );
    }
  },
);

export const fetchHistoricalWeather = createAsyncThunk(
  "weather/fetchHistoricalWeather",
  async ({ geometry_id, start_date, end_date }, { rejectWithValue }) => {
    const url = `${OBSERVE_EARTH_BASE}/weather/historical/?geometry_id=${geometry_id}&start_date=${start_date}&end_date=${end_date}`;
    try {
      const response = await axios.get(url, {
        headers: { "X-API-Key": OBSERVE_EARTH_KEY },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch historical weather data",
      );
    }
  },
);

const initialState = {
  forecastData: null,
  historicalWeather: null,
  loading: false,
  error: null,
  aoiId: null,
  aois: [],
  historicalLoading: false,
  historicalError: null,
  dateRange: {
    startDate: "",
    endDate: "",
  },
};

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
    clearHistoricalWeather: (state) => {
      state.historicalWeather = null;
      state.historicalError = null;
    },
    resetWeatherState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAOI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAOI.fulfilled, (state, action) => {
        state.aoiId = action.payload;
        state.loading = false;
      })
      .addCase(createAOI.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(fetchAOIs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAOIs.fulfilled, (state, action) => {
        state.aois = action.payload;
        state.loading = false;
      })
      .addCase(fetchAOIs.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(fetchForecastData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchForecastData.fulfilled, (state, action) => {
        const geometryId = action.meta?.arg?.geometry_id;
        if (geometryId) {
          state.forecastData = {
            ...(state.forecastData || {}),
            [geometryId]: action.payload,
          };
        } else {
          state.forecastData = action.payload;
        }
        state.loading = false;
      })
      .addCase(fetchForecastData.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      // NEW: Handle historical weather states
      .addCase(fetchHistoricalWeather.pending, (state) => {
        state.historicalLoading = true;
        state.historicalError = null;
      })
      .addCase(fetchHistoricalWeather.fulfilled, (state, action) => {
        state.historicalLoading = false;
        state.historicalWeather = action.payload;
      })
      .addCase(fetchHistoricalWeather.rejected, (state, action) => {
        state.historicalLoading = false;
        state.historicalError = action.payload;
      });
  },
});

export const { setDateRange, clearHistoricalWeather, resetWeatherState } =
  weatherSlice.actions;

export const selectAOIs = (state) => state.weather.aois || [];
export const selectAOIByName = (name) => (state) =>
  findAoiForField(state.weather.aois, name);

/** Get forecast data for a geometry. Handles both keyed (by geometry_id) and flat store shapes. */
export const selectForecastForGeometry = (geometryId) => (state) => {
  const fd = state.weather?.forecastData;
  if (!fd) return null;
  if (geometryId && fd[geometryId]) return fd[geometryId];
  if (fd.current || fd.forecast) return fd;
  return null;
};

export default weatherSlice.reducer;
