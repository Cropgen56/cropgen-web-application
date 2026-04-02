import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { get, set, del, keys } from "idb-keyval";

const SATELLITE_API_KEY =
  process.env.REACT_APP_SATELLITE_API || "CROPGEN_230498adklfjadsljf";

/** Python FastAPI base (e.g. …/v4/api — paths like /availability/, /calculate/index). */
function getSatelliteApiBase() {
  const raw = process.env.REACT_APP_API_URL_SATELLITE?.trim();
  const prodFallback = "https://server.cropgenapp.com/v4/api";
  const localPython = "http://127.0.0.1:8001/v4/api";
  const browserHost =
    typeof window !== "undefined" ? window.location.hostname : "";
  const isLocalBrowser =
    browserHost === "localhost" || browserHost === "127.0.0.1";

  // In local browser sessions, always call the Python satellite server directly.
  if (isLocalBrowser) {
    return localPython;
  }

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

const getSixMonthsBeforeDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 6);
  return date.toISOString().split("T")[0];
};

const getTodayDate = () => new Date().toISOString().split("T")[0];

const CACHE_TTL = 4 * 24 * 60 * 60 * 1000;
const TIMESERIES_MAX_POINTS = 36;
const SATELLITE_REQUEST_TIMEOUT_MS = 20000;

const generateCacheKey = (prefix, input) => {
  const inputStr = JSON.stringify(input);
  const hash = inputStr.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
  return `api_cache_${prefix}_${Math.abs(hash)}`;
};

const getSatelliteDatesEffectiveRange = ({ startDate, endDate }) => {
  const today = endDate || getTodayDate();
  const sixMonthsBefore = startDate || getSixMonthsBeforeDate();
  return { startDate: sixMonthsBefore, endDate: today };
};

const getSatelliteDatesRequestKey = ({ geometry, startDate, endDate }) => {
  const { startDate: effectiveStart, endDate: effectiveEnd } =
    getSatelliteDatesEffectiveRange({ startDate, endDate });

  const cacheInput = {
    geometry: geometry,
    startDate: effectiveStart,
    endDate: effectiveEnd,
  };

  return generateCacheKey("satelliteDates", cacheInput);
};

const getIndexDataRequestKey = ({ endDate, geometry, index }) => {
  return generateCacheKey("indexData", { endDate, geometry, index });
};

const getIndexDataForMapRequestKey = ({ endDate, geometry, index }) => {
  return generateCacheKey("indexDataForMap", { endDate, geometry, index });
};

const getIndexTimeSeriesSummaryRequestKey = ({
  startDate,
  endDate,
  geometry,
  index,
}) => {
  return generateCacheKey("indexTimeSeriesSummary", {
    startDate,
    endDate,
    geometry,
    index,
  });
};

const getWaterIndexDataRequestKey = ({
  startDate,
  endDate,
  geometry,
  index,
}) => {
  return generateCacheKey("waterIndexData", {
    startDate,
    endDate,
    geometry,
    index,
  });
};

const initialState = {
  satelliteDates: null,
  latestSatelliteDatesRequestKey: null,
  indexData: null,
  latestIndexDataRequestKey: null,
  indexDataByType: {},
  latestIndexDataByTypeRequestKey: {},
  weatherData: null,
  indexTimeSeriesSummary: null,
  latestIndexTimeSeriesSummaryRequestKey: null,
  waterIndexData: null,
  latestWaterIndexDataRequestKey: null,
  error: null,
  loading: {
    satelliteDates: false,
    indexData: false,
    indexDataByType: {},
    weatherData: false,
    indexTimeSeriesSummary: false,
    waterIndexData: false,
  },
  currentDateRange: {
    startDate: null,
    endDate: null,
  },
};

// ========== Thunks ==========

export const fetchSatelliteDates = createAsyncThunk(
  "satellite/fetchSatelliteDates",
  async ({ geometry, startDate, endDate }, { rejectWithValue }) => {
    try {
      const today = endDate || getTodayDate();
      const sixMonthsBefore = startDate || getSixMonthsBeforeDate();

      if (!geometry || geometry.length === 0) {
        return rejectWithValue("Geometry is missing");
      }

      const cacheInput = {
        geometry: geometry,
        startDate: sixMonthsBefore,
        endDate: today,
      };
      const cacheKey = generateCacheKey("satelliteDates", cacheInput);

      const cached = await get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_TTL) {
        if (
          cached.metadata?.startDate === sixMonthsBefore &&
          cached.metadata?.endDate === today
        ) {
          return cached.data;
        }
      }

      const payload = {
        geometry: {
          type: "Polygon",
          coordinates: [geometry],
        },
        start_date: sixMonthsBefore,
        end_date: today,
        provider: "both",
        satellite: "s2",
      };

      const response = await axios.post(
        `${SATELLITE_BASE_URL}/availability/`,
        payload,
        { headers: { "x-api-key": SATELLITE_API_KEY } },
      );

      await set(cacheKey, {
        data: response.data,
        timestamp: now,
        metadata: {
          startDate: sixMonthsBefore,
          endDate: today,
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchIndexData = createAsyncThunk(
  "satellite/fetchIndexData",
  async ({ endDate, geometry, index }, { rejectWithValue }) => {
    try {
      const input = { endDate, geometry, index };
      const cacheKey = generateCacheKey("indexData", input);
      const cached = await get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }

      if (!endDate || !geometry || !index) {
        return rejectWithValue("Missing required parameters");
      }

      const payload = {
        geometry: {
          type: "Polygon",
          coordinates: geometry,
        },
        date: endDate,
        index_name: index,
        provider: "both",
        satellite: "s2",
        width: 800,
        height: 800,
        supersample: 1,
        smooth: false,
        gaussian_sigma: 1,
      };

      const response = await axios.post(
        `${SATELLITE_BASE_URL}/calculate/index`,
        payload,
        { headers: { "x-api-key": SATELLITE_API_KEY } },
      );

      await set(cacheKey, { data: response.data, timestamp: now });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchIndexDataForMap = createAsyncThunk(
  "satellite/fetchIndexDataForMap",
  async ({ endDate, geometry, index }, { rejectWithValue }) => {
    try {
      const input = { endDate, geometry, index };
      const cacheKey = generateCacheKey("indexDataForMap", input);
      const cached = await get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_TTL) {
        return { index, data: cached.data };
      }

      if (!endDate || !geometry || !index) {
        return rejectWithValue({ index, error: "Missing required parameters" });
      }

      const payload = {
        geometry: {
          type: "Polygon",
          coordinates: geometry,
        },
        date: endDate,
        index_name: index,
        provider: "both",
        satellite: "s2",
        width: 800,
        height: 800,
        supersample: 1,
        smooth: false,
        gaussian_sigma: 1,
      };

      const response = await axios.post(
        `${SATELLITE_BASE_URL}/calculate/index`,
        payload,
        { headers: { "x-api-key": SATELLITE_API_KEY } },
      );

      await set(cacheKey, { data: response.data, timestamp: now });
      return { index, data: response.data };
    } catch (error) {
      return rejectWithValue({
        index,
        error: error.response?.data || error.message,
      });
    }
  },
);

export const fetchWeatherData = createAsyncThunk(
  "satellite/fetchWeatherData",
  async (_, { rejectWithValue }) => {
    try {
      const cacheKey = "weatherData";
      const cached = await get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }

      const response = await axios.get("https://api.weather.com/data");

      await set(cacheKey, { data: response.data, timestamp: now });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchIndexTimeSeriesSummary = createAsyncThunk(
  "satellite/fetchIndexTimeSeriesSummary",
  async ({ startDate, endDate, geometry, index }, { rejectWithValue }) => {
    try {
      const input = { startDate, endDate, geometry, index };
      const cacheKey = generateCacheKey("indexTimeSeriesSummary", input);
      const cached = await get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }

      if (!startDate || !endDate || !geometry || !index) {
        return rejectWithValue("Missing required parameters");
      }

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

      const response = await axios.post(
        `${SATELLITE_BASE_URL}/timeseries/vegetation/vegetation`,
        {
          geometry: {
            type: "Polygon",
            coordinates: [coordinates],
          },
          start_date: startDate,
          end_date: endDate,
          index: index,
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
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchWaterIndexData = createAsyncThunk(
  "satellite/fetchWaterIndexData",
  async ({ startDate, endDate, geometry, index }, { rejectWithValue }) => {
    try {
      const input = { startDate, endDate, geometry, index };
      const cacheKey = generateCacheKey("fetchWaterIndexData", input);
      const cached = await get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }

      if (!startDate || !endDate || !geometry || !index) {
        return rejectWithValue("Missing required parameters");
      }

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

      const response = await axios.post(
        `${SATELLITE_BASE_URL}/timeseries/water/water`,
        {
          geometry: {
            type: "Polygon",
            coordinates: [coordinates],
          },
          start_date: startDate,
          end_date: endDate,
          index: index,
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
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const clearSatelliteDatesCache = createAsyncThunk(
  "satellite/clearSatelliteDatesCache",
  async () => {
    try {
      const allKeys = await keys();
      const satelliteKeys = allKeys.filter((key) =>
        key.toString().includes("satelliteDates"),
      );
      await Promise.all(satelliteKeys.map((key) => del(key)));
      return true;
    } catch (error) {
      return false;
    }
  },
);

// ========== Slice ==========
const satelliteSlice = createSlice({
  name: "satellite",
  initialState,
  reducers: {
    setSelectedIndex: (state, action) => {
      state.selectedIndex = action.payload;
    },
    removeSelectedIndexData: (state) => {
      state.indexData = null;
    },
    clearIndexDataByType: (state) => {
      state.indexDataByType = {};
      state.loading.indexDataByType = {};
      state.latestIndexDataByTypeRequestKey = {};
    },
    resetSatelliteState: () => initialState,
    clearSatelliteDates: (state) => {
      state.satelliteDates = null;
      state.currentDateRange = { startDate: null, endDate: null };
      state.latestSatelliteDatesRequestKey = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSatelliteDates.pending, (state, action) => {
        const requestKey = getSatelliteDatesRequestKey(action.meta.arg ?? {});
        state.loading.satelliteDates = true;
        state.error = null;
        state.latestSatelliteDatesRequestKey = requestKey;
      })
      .addCase(fetchSatelliteDates.fulfilled, (state, action) => {
        const requestKey = getSatelliteDatesRequestKey(action.meta.arg);
        if (requestKey !== state.latestSatelliteDatesRequestKey) return;

        state.loading.satelliteDates = false;
        state.satelliteDates = action.payload;
        state.currentDateRange = {
          startDate: action.meta.arg.startDate,
          endDate: action.meta.arg.endDate,
        };
      })
      .addCase(fetchSatelliteDates.rejected, (state, action) => {
        const requestKey = getSatelliteDatesRequestKey(action.meta.arg ?? {});
        if (requestKey !== state.latestSatelliteDatesRequestKey) return;

        state.loading.satelliteDates = false;
        state.error = action.payload;
      })

      .addCase(fetchIndexData.pending, (state, action) => {
        const requestKey = getIndexDataRequestKey(action.meta.arg ?? {});
        state.loading.indexData = true;
        state.error = null;
        state.latestIndexDataRequestKey = requestKey;
      })
      .addCase(fetchIndexData.fulfilled, (state, action) => {
        const requestKey = getIndexDataRequestKey(action.meta.arg);
        if (requestKey !== state.latestIndexDataRequestKey) return;

        state.loading.indexData = false;
        state.indexData = action.payload;
      })
      .addCase(fetchIndexData.rejected, (state, action) => {
        const requestKey = getIndexDataRequestKey(action.meta.arg ?? {});
        if (requestKey !== state.latestIndexDataRequestKey) return;

        state.loading.indexData = false;
        state.error = action.payload;
      })

      .addCase(fetchIndexDataForMap.pending, (state, action) => {
        const index = action.meta.arg.index;
        const requestKey = getIndexDataForMapRequestKey(action.meta.arg);
        state.loading.indexDataByType[index] = true;
        state.error = null;
        state.latestIndexDataByTypeRequestKey[index] = requestKey;
      })
      .addCase(fetchIndexDataForMap.fulfilled, (state, action) => {
        const { index, data } = action.payload;
        const requestKey = getIndexDataForMapRequestKey(action.meta.arg);
        if (requestKey !== state.latestIndexDataByTypeRequestKey?.[index]) {
          return;
        }

        state.loading.indexDataByType[index] = false;
        state.indexDataByType[index] = data;
      })
      .addCase(fetchIndexDataForMap.rejected, (state, action) => {
        const index = action.meta.arg?.index;
        const requestKey = getIndexDataForMapRequestKey(action.meta.arg ?? {});
        if (
          index &&
          requestKey !== state.latestIndexDataByTypeRequestKey?.[index]
        ) {
          return;
        }
        if (index) {
          state.loading.indexDataByType[index] = false;
        }
        state.error = action.payload?.error || action.payload;
      })

      .addCase(fetchWeatherData.pending, (state) => {
        state.loading.weatherData = true;
        state.error = null;
      })
      .addCase(fetchWeatherData.fulfilled, (state, action) => {
        state.loading.weatherData = false;
        state.weatherData = action.payload;
      })
      .addCase(fetchWeatherData.rejected, (state, action) => {
        state.loading.weatherData = false;
        state.error = action.payload;
      })

      .addCase(fetchIndexTimeSeriesSummary.pending, (state, action) => {
        const requestKey = getIndexTimeSeriesSummaryRequestKey(
          action.meta.arg ?? {},
        );
        state.loading.indexTimeSeriesSummary = true;
        state.error = null;
        state.latestIndexTimeSeriesSummaryRequestKey = requestKey;
      })
      .addCase(fetchIndexTimeSeriesSummary.fulfilled, (state, action) => {
        const requestKey = getIndexTimeSeriesSummaryRequestKey(
          action.meta.arg ?? {},
        );
        if (requestKey !== state.latestIndexTimeSeriesSummaryRequestKey) return;

        state.loading.indexTimeSeriesSummary = false;
        state.indexTimeSeriesSummary = action.payload;
      })
      .addCase(fetchIndexTimeSeriesSummary.rejected, (state, action) => {
        const requestKey = getIndexTimeSeriesSummaryRequestKey(
          action.meta.arg ?? {},
        );
        if (requestKey !== state.latestIndexTimeSeriesSummaryRequestKey) return;

        state.loading.indexTimeSeriesSummary = false;
        state.error = action.payload;
      })

      .addCase(fetchWaterIndexData.pending, (state, action) => {
        const requestKey = getWaterIndexDataRequestKey(action.meta.arg ?? {});
        state.loading.waterIndexData = true;
        state.error = null;
        state.latestWaterIndexDataRequestKey = requestKey;
      })
      .addCase(fetchWaterIndexData.fulfilled, (state, action) => {
        const requestKey = getWaterIndexDataRequestKey(action.meta.arg ?? {});
        if (requestKey !== state.latestWaterIndexDataRequestKey) return;

        state.loading.waterIndexData = false;
        state.waterIndexData = action.payload;
      })
      .addCase(fetchWaterIndexData.rejected, (state, action) => {
        const requestKey = getWaterIndexDataRequestKey(action.meta.arg ?? {});
        if (requestKey !== state.latestWaterIndexDataRequestKey) return;

        state.loading.waterIndexData = false;
        state.error = action.payload;
      })

      .addCase(clearSatelliteDatesCache.fulfilled, (state) => {
        state.satelliteDates = null;
      });
  },
});

export const {
  setSelectedIndex,
  removeSelectedIndexData,
  clearIndexDataByType,
  resetSatelliteState,
  clearSatelliteDates,
} = satelliteSlice.actions;

export default satelliteSlice.reducer;
