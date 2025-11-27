import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { get, set } from "idb-keyval";
import { getSixMonthsBeforeDate } from "../../utility/formatDate";

// Helper function to compare arrays (used for polygon closure)
function arraysEqual(a, b) {
  return a.length === b.length && a.every((val, index) => val === b[index]);
}

// Cache TTLs
const CACHE_TTL = 4 * 24 * 60 * 60 * 1000;

const generateCacheKey = (prefix, farmId, input) => {
  if (farmId) {
    return `api_cache_${prefix}_${farmId}`;
  }
  const inputStr = JSON.stringify(input);
  const hash = inputStr.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
  return `api_cache_${prefix}_${hash}`;
};

const initialState = {
  satelliteDates: null,
  indexData: null,
  weatherData: null,
  indexTimeSeriesSummary: null,
  waterIndexData: null,
  error: null,
  loading: {
    satelliteDates: false,
    indexData: false,
    weatherData: false,
    indexTimeSeriesSummary: false,
    waterIndexData: false,
  },
};

// ========== Thunks (kept five) ==========

// 1) fetchSatelliteDates
export const fetchSatelliteDates = createAsyncThunk(
  "satellite/fetchSatelliteDates",
  async ({ geometry }, { rejectWithValue }) => {
    try {
      const cacheKey = generateCacheKey("satelliteDates", null, geometry);
      const cached = await get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }

      if (!geometry) {
        return rejectWithValue("Geometry is missing");
      }

      const today = new Date().toISOString().split("T")[0];
      const sixMonthsBefore = getSixMonthsBeforeDate();
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
        `${process.env.REACT_APP_API_URL_SATELLITE}/v4/api/availability/`,
        payload
      );

      await set(cacheKey, { data: response.data, timestamp: now });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 2) fetchIndexData
export const fetchIndexData = createAsyncThunk(
  "satellite/fetchIndexData",
  async ({ endDate, geometry, index }, { rejectWithValue }) => {
    try {
      const input = { endDate, geometry, index };
      const cacheKey = generateCacheKey("indexData", null, input);
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
        `${process.env.REACT_APP_API_URL_SATELLITE}/v4/api/calculate/index`,
        payload
      );

      await set(cacheKey, { data: response.data, timestamp: now });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 3) fetchWeatherData
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

      // Replace with your actual weather API endpoint
      const response = await axios.get("https://api.weather.com/data");

      await set(cacheKey, { data: response.data, timestamp: now });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 4) fetchIndexTimeSeriesSummary
export const fetchIndexTimeSeriesSummary = createAsyncThunk(
  "satellite/fetchIndexTimeSeriesSummary",
  async ({ startDate, endDate, geometry, index }, { rejectWithValue }) => {
    try {
      const input = { startDate, endDate, geometry, index };
      const cacheKey = generateCacheKey("indexTimeSeriesSummary", null, input);
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
        }
      );

      await set(cacheKey, { data: response.data, timestamp: now });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 5) fetchWaterIndexData
export const fetchWaterIndexData = createAsyncThunk(
  "satellite/fetchWaterIndexData",
  async ({ startDate, endDate, geometry, index }, { rejectWithValue }) => {
    try {
      const input = { startDate, endDate, geometry, index };
      const cacheKey = generateCacheKey("fetchWaterIndexData", null, input);
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
        }
      );

      await set(cacheKey, { data: response.data, timestamp: now });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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
    resetSatelliteState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // fetchSatelliteDates
      .addCase(fetchSatelliteDates.pending, (state) => {
        state.loading.satelliteDates = true;
        state.error = null;
      })
      .addCase(fetchSatelliteDates.fulfilled, (state, action) => {
        state.loading.satelliteDates = false;
        state.satelliteDates = action.payload;
      })
      .addCase(fetchSatelliteDates.rejected, (state, action) => {
        state.loading.satelliteDates = false;
        state.error = action.payload;
      })

      // fetchIndexData
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

      // fetchWeatherData
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

      // fetchIndexTimeSeriesSummary
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

      // fetchWaterIndexData
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
      });
  },
});

export const {
  setSelectedIndex,
  removeSelectedIndexData,
  resetSatelliteState,
} = satelliteSlice.actions;

export default satelliteSlice.reducer;
