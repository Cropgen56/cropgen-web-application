import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { get, set, del, keys } from "idb-keyval";
import { SATELLITE_API_KEY, SATELLITE_API_URL } from "../../config/envUrls";
import { DEFAULT_SATELLITE } from "../../constants/satelliteIndices";
import { toApiPolygon } from "../../utils/farmGeometry";

const SATELLITE_BASE_URL = SATELLITE_API_URL;

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

const resolveSatellite = (satellite) => satellite || DEFAULT_SATELLITE;

const getSatelliteDatesRequestKey = ({
  geometry,
  startDate,
  endDate,
  satellite,
}) => {
  const { startDate: effectiveStart, endDate: effectiveEnd } =
    getSatelliteDatesEffectiveRange({ startDate, endDate });

  const cacheInput = {
    geometry: geometry,
    startDate: effectiveStart,
    endDate: effectiveEnd,
    satellite: resolveSatellite(satellite),
  };

  return generateCacheKey("satelliteDates", cacheInput);
};

const getIndexDataRequestKey = ({ endDate, geometry, index, satellite }) => {
  return generateCacheKey("indexData", {
    endDate,
    geometry,
    index,
    satellite: resolveSatellite(satellite),
  });
};

const getIndexDataForMapRequestKey = ({
  endDate,
  geometry,
  index,
  satellite,
}) => {
  return generateCacheKey("indexDataForMap", {
    endDate,
    geometry,
    index,
    satellite: resolveSatellite(satellite),
  });
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
  selectedSatellite: DEFAULT_SATELLITE,
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
  async (
    { geometry, startDate, endDate, satellite },
    { getState, rejectWithValue },
  ) => {
    try {
      const today = endDate || getTodayDate();
      const sixMonthsBefore = startDate || getSixMonthsBeforeDate();
      const resolvedSatellite = resolveSatellite(
        satellite ?? getState()?.satellite?.selectedSatellite,
      );

      if (!geometry || geometry.length === 0) {
        return rejectWithValue("Geometry is missing");
      }

      const cacheInput = {
        geometry: geometry,
        startDate: sixMonthsBefore,
        endDate: today,
        satellite: resolvedSatellite,
      };
      const cacheKey = generateCacheKey("satelliteDates", cacheInput);

      const cached = await get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_TTL) {
        if (
          cached.metadata?.startDate === sixMonthsBefore &&
          cached.metadata?.endDate === today &&
          cached.metadata?.satellite === resolvedSatellite
        ) {
          return cached.data;
        }
      }

      const payload = {
        geometry: toApiPolygon(geometry),
        start_date: sixMonthsBefore,
        end_date: today,
        provider: "both",
        satellite: resolvedSatellite,
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
          satellite: resolvedSatellite,
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
  async (
    { endDate, geometry, index, satellite },
    { getState, rejectWithValue },
  ) => {
    try {
      const resolvedSatellite = resolveSatellite(
        satellite ?? getState()?.satellite?.selectedSatellite,
      );
      const input = {
        endDate,
        geometry,
        index,
        satellite: resolvedSatellite,
      };
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
        geometry: toApiPolygon(geometry),
        date: endDate,
        index_name: index,
        provider: "both",
        satellite: resolvedSatellite,
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
  async (
    { endDate, geometry, index, satellite },
    { getState, rejectWithValue },
  ) => {
    try {
      const resolvedSatellite = resolveSatellite(
        satellite ?? getState()?.satellite?.selectedSatellite,
      );
      const input = {
        endDate,
        geometry,
        index,
        satellite: resolvedSatellite,
      };
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
        geometry: toApiPolygon(geometry),
        date: endDate,
        index_name: index,
        provider: "both",
        satellite: resolvedSatellite,
        width: 800,
        height: 800,
        supersample: 1,
        smooth: false,
        gaussian_sigma: 1,
      };

      const response = await axios.post(
        `${SATELLITE_BASE_URL}/calculate/index`,
        payload,
        {
          headers: { "x-api-key": SATELLITE_API_KEY },
          timeout: 90000,
        },
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
      const effectiveStartDate = startDate || getSixMonthsBeforeDate();
      const effectiveEndDate = endDate || getTodayDate();
      const input = {
        startDate: effectiveStartDate,
        endDate: effectiveEndDate,
        geometry,
        index,
      };
      const cacheKey = generateCacheKey("indexTimeSeriesSummary", input);
      const cached = await get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }

      if (!geometry || !index) {
        return rejectWithValue("Missing required parameters");
      }

      const response = await axios.post(
        `${SATELLITE_BASE_URL}/timeseries/vegetation/vegetation`,
        {
          geometry: toApiPolygon(geometry),
          start_date: effectiveStartDate,
          end_date: effectiveEndDate,
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
      const effectiveStartDate = startDate || getSixMonthsBeforeDate();
      const effectiveEndDate = endDate || getTodayDate();
      const input = {
        startDate: effectiveStartDate,
        endDate: effectiveEndDate,
        geometry,
        index,
      };
      const cacheKey = generateCacheKey("fetchWaterIndexData", input);
      const cached = await get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }

      if (!geometry || !index) {
        return rejectWithValue("Missing required parameters");
      }

      const response = await axios.post(
        `${SATELLITE_BASE_URL}/timeseries/water/water`,
        {
          geometry: toApiPolygon(geometry),
          start_date: effectiveStartDate,
          end_date: effectiveEndDate,
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
    setSelectedSatellite: (state, action) => {
      const next = resolveSatellite(action.payload);
      if (state.selectedSatellite === next) return;
      state.selectedSatellite = next;
      state.satelliteDates = null;
      state.indexData = null;
      state.indexDataByType = {};
      state.loading.indexDataByType = {};
      state.latestIndexDataByTypeRequestKey = {};
      state.latestSatelliteDatesRequestKey = null;
      state.latestIndexDataRequestKey = null;
      state.currentDateRange = { startDate: null, endDate: null };
      state.error = null;
    },
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
  setSelectedSatellite,
  setSelectedIndex,
  removeSelectedIndexData,
  clearIndexDataByType,
  resetSatelliteState,
  clearSatelliteDates,
} = satelliteSlice.actions;

export default satelliteSlice.reducer;
