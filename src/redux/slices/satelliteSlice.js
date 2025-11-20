import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { formatDateToISO, getOneYearBefore } from "../../utility/formatDate";
import axios from "axios";
import { get, set } from "idb-keyval";
import {
  getTodayAndFifteenDaysAgo,
  getSixMonthsBeforeDate,
} from "../../utility/formatDate";

// Helper function to compare arrays (assuming it's not already defined elsewhere)
function arraysEqual(a, b) {
  return a.length === b.length && a.every((val, index) => val === b[index]);
}

// 4 days in milliseconds
const CACHE_TTL = 4 * 24 * 60 * 60 * 1000;

// 24 hours in milliseconds
const CACHE_TTL_24_HOURS = 24 * 60 * 60 * 1000;

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
  advisory: null,
  indexData: null,
  cropHealth: null,
  SoilMoisture: null,
  NpkData: null,
  cropYield: null,
  indexTimeSeriesSummary: null,
  waterIndexData: null,
  cropGrowthStage: null,
  newNpkData: null,
  soilData: null,
  error: null,
  loading: {
    satelliteDates: false,
    indexData: false,
    cropHealth: false,
    soilMoisture: false,
    npkData: false,
    cropYield: false,
    advisory: false,
    indexTimeSeriesSummary: false,
    waterIndexData: false,
    soilData: false,
    cropGrowthStage: false,
    newNpkData: false,
  },
};

// get the sattelite dates
export const fetchSatelliteDates = createAsyncThunk(
  "satellite/fetchSatelliteDates",
  async ({ geometry, selectedFieldsDetials }, { rejectWithValue }) => {
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

export const fetchIndexData = createAsyncThunk(
  "satellite/fetchIndexData",
  async ({ endDate, geometry, index }, { rejectWithValue }) => {
    try {
      const input = { endDate, geometry, index };
      const cacheKey = generateCacheKey("indexData", null, input);
      const cached = await get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_TTL) {
        // console.log("return the cache", cached);

        return cached.data;
        // return { [index]: cached.data };
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
        // smooth: true,
        smooth: false,
        gaussian_sigma: 1,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL_SATELLITE}/v4/api/calculate/index`,
        payload
      );

      // console.log("cache new data");
      await set(cacheKey, { data: response.data, timestamp: now });

      return response.data;
      // return { [index]: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const calculateAiYield = createAsyncThunk(
  "satellite/calculateAiYield",
  async ({ cropDetials, cropGrowthStage }, { rejectWithValue }) => {
    try {
      const farmId = cropDetials?._id;
      const cacheKey = generateCacheKey("aiYield", farmId);
      const cached = await get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }

      const { field, cropName } = cropDetials || {};

      if (!field || !cropName) {
        return rejectWithValue(
          "Invalid farm details: field or cropName missing"
        );
      }

      const coordinates = field.map(({ lat, lng }) => {
        if (typeof lat !== "number" || typeof lng !== "number") {
          throw new Error(`Invalid coordinate: lat=${lat}, lng=${lng}`);
        }
        return [lng, lat];
      });

      const response = await axios.post(
        `https://server.cropgenapp.com/v2/api/ai-yield`,
        {
          crop_name: cropName,
          bbch_stage: cropGrowthStage,
          geometry: [coordinates],
        }
      );

      await set(cacheKey, { data: response.data, timestamp: now });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCropHealth = createAsyncThunk(
  "satellite/cropHealth",
  async (farmDetails, { rejectWithValue }) => {
    try {
      const farmId = farmDetails?._id;
      const cacheKey = generateCacheKey("cropHealth", farmId);
      const cached = await get(cacheKey);
      const now = Date.now();

      if (
        !farmDetails?.bypassCache &&
        cached &&
        now - cached.timestamp < CACHE_TTL
      ) {
        return cached.data;
      }

      const { field } = farmDetails || {};
      if (!field) {
        return rejectWithValue("Invalid farm details: field missing");
      }

      const coordinates = field.map(({ lat, lng }) => {
        if (typeof lat !== "number" || typeof lng !== "number") {
          throw new Error(`Invalid coordinate: lat=${lat}, lng=${lng}`);
        }
        return [lng, lat];
      });

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL_SATELLITE}/crop-health`,
        { geometry: [coordinates] }
      );

      // console.log("new cache corp health");

      await set(cacheKey, { data: response.data, timestamp: now });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSoilMoisture = createAsyncThunk(
  "satellite/fetchSoilMoisture",
  async (farmDetails, { rejectWithValue }) => {
    try {
      const farmId = farmDetails?._id;
      const cacheKey = generateCacheKey("soilMoisture", farmId);
      const cached = await get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }

      const { field } = farmDetails || {};
      if (!field) {
        return rejectWithValue("Invalid farm details: field missing");
      }

      const coordinates = [
        field.map(({ lat, lng }) => {
          if (typeof lat !== "number" || typeof lng !== "number") {
            throw new Error(`Invalid coordinate: lat=${lat}, lng=${lng}`);
          }
          return [lat, lng];
        }),
      ];

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL_SATELLITE}/get-soil-data`,
        { coordinates }
      );

      await set(cacheKey, { data: response.data, timestamp: now });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetcNpkData = createAsyncThunk(
  "satellite/fetchNpkData",
  async (farmDetails, { rejectWithValue }) => {
    try {
      const farmId = farmDetails?._id;
      const cacheKey = generateCacheKey("npkData", farmId);
      const cached = await get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }

      const { field, cropName, sowingDate } = farmDetails || {};
      if (!field || !cropName || !sowingDate) {
        return rejectWithValue(
          "Invalid farm details: field, cropName, or sowingDate missing"
        );
      }

      const coordinates = field.map(({ lat, lng }) => {
        if (typeof lat !== "number" || typeof lng !== "number") {
          throw new Error(`Invalid coordinate: lat=${lat}, lng=${lng}`);
        }
        return [lng, lat];
      });

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL_SATELLITE}/calculate_npk`,
        {
          crop_name: cropName,
          sowing_date: formatDateToISO(sowingDate, sowingDate),
          geometry: {
            type: "Polygon",
            coordinates: coordinates,
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

export const genrateAdvisory = createAsyncThunk(
  "satellite/genrateAdvisory",
  async ({ farmDetails, currenWeather, bbchData }, { rejectWithValue }) => {
    try {
      const farmId = farmDetails?._id;
      const cacheKey = generateCacheKey("advisory", farmId);
      const cached = await get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }

      const { cropName, sowingDate, variety, typeOfIrrigation, typeOfFarming } =
        farmDetails || {};
      if (!cropName || !sowingDate) {
        return rejectWithValue(
          "Invalid farm details: cropName or sowingDate missing"
        );
      }

      const payload = {
        crop_name: cropName,
        sowing_date: formatDateToISO(sowingDate),
        bbch_stage: bbchData?.bbch || "BBCH 00",
        variety,
        irrigation_type: typeOfIrrigation,
        type_of_farming: typeOfFarming,
        humidity: Math.round(currenWeather?.relative_humidity || 0),
        temp: Math.round(currenWeather?.temp || 0),
        rain: Math.round(currenWeather?.rain || 0),
        soil_temp: Math.round(currenWeather?.soil_temperature_5cm || 0),
        soil_moisture: Math.round(currenWeather?.soil_moisture_5cm || 0),
        language: "en",
      };

      const response = await axios.post(
        `https://server.cropgenapp.com/v1/api/crop/generate-advisory`,
        payload
      );

      await set(cacheKey, { data: response.data, timestamp: now });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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

      // Replace with your actual weather API endpoint
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
      const cacheKey = generateCacheKey("indexTimeSeriesSummary", null, input);
      const cached = await get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_TTL) {
        return cached;
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

      // Ensure the polygon is closed by appending the first coordinate at the end if it's not already the same
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

export const fetchWaterIndexData = createAsyncThunk(
  "satellite/fetchWaterIndexData",
  async ({ startDate, endDate, geometry, index }, { rejectWithValue }) => {
    try {
      const input = { startDate, endDate, geometry, index };
      const cacheKey = generateCacheKey("fetchWaterIndexData", null, input);
      const cached = await get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_TTL) {
        return cached;
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

      // Ensure the polygon is closed by appending the first coordinate at the end if it's not already the same
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

export const fetchSoilData = createAsyncThunk(
  "satellite/fetchSoilData",
  async ({ farmDetails }, { rejectWithValue }) => {
    try {
      const farmId = farmDetails?._id;
      const cacheKey = generateCacheKey("soilData", farmId);
      const cached = await get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }

      const { today, fifteenDaysAgo } = getTodayAndFifteenDaysAgo();

      const { field } = farmDetails || {};
      if (!field) {
        return rejectWithValue("Invalid farm details: field missing");
      }

      const coordinates = [
        field.map(({ lat, lng }) => {
          if (typeof lat !== "number" || typeof lng !== "number") {
            throw new Error(`Invalid coordinate: lat=${lat}, lng=${lng}`);
          }
          return [lat, lng];
        }),
      ];

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL_SATELLITE}/get-soil-stats`,
        {
          coordinates: coordinates,
          start_date: fifteenDaysAgo,
          end_date: today,
        }
      );

      await set(cacheKey, { data: response.data, timestamp: now });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for getting farm fields for a user
export const getTheCropGrowthStage = createAsyncThunk(
  "satellite/getTheCropGrowthStage",
  async (payload, { rejectWithValue }) => {
    try {
      const cacheKey = generateCacheKey("cropGrowthStage", null, payload);
      const cached = await get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_TTL_24_HOURS) {
        return cached.data;
      }
      const response = await axios.post(
        "https://server.cropgenapp.com/v2/api/bbch-stage",
        payload
      );

      await set(cacheKey, { data: response.data, timestamp: now });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch crop growth stage"
      );
    }
  }
);

// Async thunk for getting farm field NPK data
export const getNpkData = createAsyncThunk(
  "satellite/getNpkData",
  async (payload, { rejectWithValue }) => {
    try {
      const cacheKey = generateCacheKey("newNpkData", null, payload);
      const cached = await get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_TTL_24_HOURS) {
        return cached.data;
      }

      const response = await axios.post(
        "https://server.cropgenapp.com/v2/api/calculate-npk",
        payload
      );

      await set(cacheKey, { data: response.data, timestamp: now });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch NPK data"
      );
    }
  }
);

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
      // fetch satellite dates
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
      // fetch index data
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

      // fetch the crop health data
      .addCase(fetchCropHealth.pending, (state) => {
        state.loading.cropHealth = true;
        state.error = null;
      })
      .addCase(fetchCropHealth.fulfilled, (state, action) => {
        state.loading.cropHealth = false;
        state.cropHealth = action.payload;
      })
      .addCase(fetchCropHealth.rejected, (state, action) => {
        state.loading.cropHealth = false;
        state.error = action.payload;
      })

      // fetch the soil moisture data
      .addCase(fetchSoilMoisture.pending, (state) => {
        state.loading.soilMoisture = true;
        state.error = null;
      })
      .addCase(fetchSoilMoisture.fulfilled, (state, action) => {
        state.loading.soilMoisture = false;
        state.SoilMoisture = action.payload;
      })
      .addCase(fetchSoilMoisture.rejected, (state, action) => {
        state.loading.soilMoisture = false;
        state.error = action.payload;
      })
      // fetch the npk data
      .addCase(fetcNpkData.pending, (state) => {
        state.loading.npkData = true;
        state.error = null;
      })
      .addCase(fetcNpkData.fulfilled, (state, action) => {
        state.loading.npkData = false;
        state.NpkData = action.payload;
      })
      .addCase(fetcNpkData.rejected, (state, action) => {
        state.loading.npkData = false;
        state.error = action.payload;
      })

      // fetch the or calculate the ai yeild data
      .addCase(calculateAiYield.pending, (state) => {
        state.loading.cropYield = true;
        state.error = null;
      })
      .addCase(calculateAiYield.fulfilled, (state, action) => {
        state.loading.cropYield = false;
        state.cropYield = action.payload;
      })
      .addCase(calculateAiYield.rejected, (state, action) => {
        state.loading.cropYield = false;
        state.error = action.payload;
      })

      //fetch the advisory
      .addCase(genrateAdvisory.pending, (state) => {
        state.loading.advisory = true;
        state.error = null;
      })
      .addCase(genrateAdvisory.fulfilled, (state, action) => {
        state.loading.advisory = false;
        state.advisory = action.payload.advisory;
      })
      .addCase(genrateAdvisory.rejected, (state, action) => {
        state.loading.advisory = false;
        state.error = action.payload;
      })
      // featch weather data
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
      // fetch index time series summary
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
      }) // fetch index time series summary
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
      // fetch soil data
      .addCase(fetchSoilData.pending, (state) => {
        state.loading.soilData = true;
        state.error = null;
      })
      .addCase(fetchSoilData.fulfilled, (state, action) => {
        state.loading.soilData = false;
        state.soilData = action.payload.data;
      })
      .addCase(fetchSoilData.rejected, (state, action) => {
        state.loading.soilData = false;
        state.error = action.payload;
      })
      // fetch the crop growth stage
      .addCase(getTheCropGrowthStage.pending, (state) => {
        state.loading.cropGrowthStage = true;
        state.error = null;
      })
      .addCase(getTheCropGrowthStage.fulfilled, (state, action) => {
        state.loading.cropGrowthStage = false;
        state.cropGrowthStage = action.payload; // This stores the full response
      })
      .addCase(getTheCropGrowthStage.rejected, (state, action) => {
        state.loading.cropGrowthStage = false;

        state.error = action.payload;
      })

      // fetch the crop npk data
      .addCase(getNpkData.pending, (state) => {
        state.loading.newNpkData = true;
        state.error = null;
      })
      .addCase(getNpkData.fulfilled, (state, action) => {
        state.loading.newNpkData = false;
        state.newNpkData = action.payload;
      })
      .addCase(getNpkData.rejected, (state, action) => {
        state.loading.newNpkData = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedIndex,
  resetState,
  removeSelectedIndexData,
  resetSatelliteState,
} = satelliteSlice.actions;

export default satelliteSlice.reducer;
