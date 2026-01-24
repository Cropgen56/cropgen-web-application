import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { get, set, del, keys } from "idb-keyval";

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

const generateCacheKey = (prefix, input) => {
  const inputStr = JSON.stringify(input);
  const hash = inputStr.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
  return `api_cache_${prefix}_${Math.abs(hash)}`;
};

const initialState = {
  satelliteDates: null,
  indexData: null,
  indexDataByType: {},
  weatherData: null,
  indexTimeSeriesSummary: null,
  waterIndexData: null,
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
        provider: "aws",
        satellite: "s2",
      };

      const response = await axios.post(
        `https://server.cropgenapp.com/v4/api/availability/`,
        payload,
        {
          headers: {
            "x-api-key": "CROPGEN_230498adklfjadsljf",
          },
        }
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
  }
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
        provider: "aws",
        satellite: "s2",
        width: 800,
        height: 800,
        supersample: 1,
        smooth: false,
        gaussian_sigma: 1,
      };

      const response = await axios.post(
        `https://server.cropgenapp.com/v4/api/calculate/index`,
        payload,
        {
          headers: {
            "x-api-key": "CROPGEN_230498adklfjadsljf",
          },
        }
      );

      await set(cacheKey, { data: response.data, timestamp: now });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
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
        provider: "aws",
        satellite: "s2",
        width: 800,
        height: 800,
        supersample: 1,
        smooth: false,
        gaussian_sigma: 1,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL_SATELLITE}/v4/api/calculate/index`,
        payload,
        {
          headers: {
            "x-api-key": "CROPGEN_230498adklfjadsljf",
          },
        }
      );

      await set(cacheKey, { data: response.data, timestamp: now });
      return { index, data: response.data };
    } catch (error) {
      return rejectWithValue({
        index,
        error: error.response?.data || error.message,
      });
    }
  }
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
  }
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
        `${process.env.REACT_APP_API_URL_SATELLITE}/v4/api/timeseries/vegetation/vegetation`,
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
          max_items: 200,
        },
        {
          headers: {
            "x-api-key": "CROPGEN_230498adklfjadsljf",
          },
        }
      );

      await set(cacheKey, { data: response.data, timestamp: now });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
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
        `${process.env.REACT_APP_API_URL_SATELLITE}/v4/api/timeseries/water/water`,
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
          max_items: 200,
        },
        {
          headers: {
            "x-api-key": "CROPGEN_230498adklfjadsljf",
          },
        }
      );

      await set(cacheKey, { data: response.data, timestamp: now });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const clearSatelliteDatesCache = createAsyncThunk(
  "satellite/clearSatelliteDatesCache",
  async () => {
    try {
      const allKeys = await keys();
      const satelliteKeys = allKeys.filter((key) =>
        key.toString().includes("satelliteDates")
      );
      await Promise.all(satelliteKeys.map((key) => del(key)));
      return true;
    } catch (error) {
      return false;
    }
  }
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
    },
    resetSatelliteState: () => initialState,
    clearSatelliteDates: (state) => {
      state.satelliteDates = null;
      state.currentDateRange = { startDate: null, endDate: null };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSatelliteDates.pending, (state) => {
        state.loading.satelliteDates = true;
        state.error = null;
      })
      .addCase(fetchSatelliteDates.fulfilled, (state, action) => {
        state.loading.satelliteDates = false;
        state.satelliteDates = action.payload;
        state.currentDateRange = {
          startDate: action.meta.arg.startDate,
          endDate: action.meta.arg.endDate,
        };
      })
      .addCase(fetchSatelliteDates.rejected, (state, action) => {
        state.loading.satelliteDates = false;
        state.error = action.payload;
      })

      .addCase(fetchIndexData.pending, (state) => {
        state.loading.indexData = true;
        state.error = null;
      })
      .addCase(fetchIndexData.fulfilled, (state, action) => {
        state.loading.indexData = false;
        state.indexData = action.payload;
      })
      .addCase(fetchIndexData.rejected, (state, action) => {
        state.loading.indexData = false;
        state.error = action.payload;
      })

      .addCase(fetchIndexDataForMap.pending, (state, action) => {
        const index = action.meta.arg.index;
        state.loading.indexDataByType[index] = true;
        state.error = null;
      })
      .addCase(fetchIndexDataForMap.fulfilled, (state, action) => {
        const { index, data } = action.payload;
        state.loading.indexDataByType[index] = false;
        state.indexDataByType[index] = data;
      })
      .addCase(fetchIndexDataForMap.rejected, (state, action) => {
        const index = action.meta.arg?.index;
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

      .addCase(fetchIndexTimeSeriesSummary.pending, (state) => {
        state.loading.indexTimeSeriesSummary = true;
        state.error = null;
      })
      .addCase(fetchIndexTimeSeriesSummary.fulfilled, (state, action) => {
        state.loading.indexTimeSeriesSummary = false;
        state.indexTimeSeriesSummary = action.payload;
      })
      .addCase(fetchIndexTimeSeriesSummary.rejected, (state, action) => {
        state.loading.indexTimeSeriesSummary = false;
        state.error = action.payload;
      })

      .addCase(fetchWaterIndexData.pending, (state) => {
        state.loading.waterIndexData = true;
        state.error = null;
      })
      .addCase(fetchWaterIndexData.fulfilled, (state, action) => {
        state.loading.waterIndexData = false;
        state.waterIndexData = action.payload;
      })
      .addCase(fetchWaterIndexData.rejected, (state, action) => {
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