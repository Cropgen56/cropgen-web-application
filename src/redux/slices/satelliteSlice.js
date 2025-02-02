import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  satelliteDates: null,
  advisory: null,
  indexData: null,
  cropHealth: null,
  SoilMoisture: null,
  NpkData: null,
  cropYield: null,
  error: null,
  loading: {
    satelliteDates: false,
    indexData: false,
    cropHealth: false,
    soilMoisture: false,
    npkData: false,
    cropYield: false,
    advisory: false,
  },
};

// Async thunk for fetching dates and true color data
export const fetchSatelliteDates = createAsyncThunk(
  "satellite/fetchSatelliteDates",
  async (geometry, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL_SATELLITE}/get-true-color-data`,
        {
          geometry,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

// Async thunk for fetching vegetation index data
export const fetchIndexData = createAsyncThunk(
  "satellite/fetchIndexData",
  async ({ startDate, endDate, geometry, index }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL_SATELLITE}/get-index-data`,
        {
          start_date: startDate,
          end_date: endDate,
          geometry,
          index,
          dataset: "HARMONIZED",
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

// Async thunk for calculate AI Yield
export const calculateAiYield = createAsyncThunk(
  "satellite/calculateAiYield",
  async (farmDetails, { rejectWithValue }) => {
    const convertToCoordinates = (fields) => {
      return fields.map(({ lat, lng }) => [lng, lat]);
    };
    const field = farmDetails?.field;
    const coordinates = convertToCoordinates(field);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL_SATELLITE}/ai-yield`,
        {
          crop_name: farmDetails?.cropName,
          crop_growth_stage: "Harvesting",
          geometry: [coordinates],
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

// Async  thun for fetch crop health
export const fetchCropHealth = createAsyncThunk(
  "satellite/cropHealth",
  async (farmDetails, { rejectWithValue }) => {
    const convertToCoordinates = (fields) => {
      return fields.map(({ lat, lng }) => [lng, lat]);
    };
    const field = farmDetails?.field;
    const coordinates = convertToCoordinates(field);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL_SATELLITE}/crop-health`,
        {
          geometry: [coordinates],
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

// Async thunk for calculate AI Yield
export const fetchSoilMoisture = createAsyncThunk(
  "satellite/fetchSoilMoisture",
  async (farmDetails, { rejectWithValue }) => {
    const { field } = farmDetails || {};

    const coordinates = [field.map(({ lat, lng }) => [lat, lng])];
    const payload = { coordinates };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL_SATELLITE}/get-soil-data`,
        payload
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

// Async thunk for NPK API
export const fetcNpkData = createAsyncThunk(
  "satellite/fetchNpkData",
  async (farmDetails, { rejectWithValue }) => {
    const convertToCoordinates = (fields) => {
      return fields.map(({ lat, lng }) => [lng, lat]);
    };

    const { field, cropName, sowingDate } = farmDetails || {};

    if (!field || !cropName || !sowingDate) {
      throw new Error("Invalid farm details provided for fetching NPK data.");
    }

    const coordinates = convertToCoordinates(field);

    const payload = {
      crop_name: cropName,
      sowing_date: sowingDate,
      geometry: {
        type: "Polygon",
        coordinates: coordinates,
      },
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL_SATELLITE}/calculate_npk`,
        payload
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

// Async thunk for NPK API
export const genrateAdvisory = createAsyncThunk(
  "satellite/genrateAdvisory",
  async ({ farmDetails, SoilMoisture, NpkData }, { rejectWithValue }) => {
    const weatherData = JSON.parse(
      localStorage.getItem("weatherData")
    ).currentConditions;

    const {
      cropName,
      sowingDate,
      variety,
      typeOfIrrigation: irrigation_type,
    } = farmDetails || {};

    const payload = {
      crop_name: cropName,
      sowing_date: sowingDate,
      bbch_stage: NpkData?.Crop_Growth_Stage,
      variety,
      irrigation_type,
      humidity: Math.round(weatherData?.humidity),
      temp: Math.round(weatherData?.temp),
      rain: weatherData?.precipprob,
      soil_temp: Math.round(
        SoilMoisture?.data?.Soil_Temperature?.Soil_Temperature_max || 0
      ),
      soil_moisture: Math.round(
        SoilMoisture?.data?.Soil_Moisture?.Soil_Moisture_max || 0
      ),
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL_SATELLITE}/generate-advisory-crop`,
        payload
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
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
    resetState: () => initialState,
    removeSelectedIndexData: (state) => {
      state.indexData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Satellite Dates
      .addCase(fetchSatelliteDates.pending, (state) => {
        state.loading.satelliteDates = true;
        state.error = null;
      })
      .addCase(fetchSatelliteDates.fulfilled, (state, action) => {
        state.loading.satelliteDates = false;
        state.satelliteDates = action.payload.last_six_months_metadata;
      })
      .addCase(fetchSatelliteDates.rejected, (state, action) => {
        state.loading.satelliteDates = false;
        state.error = action.payload;
      })

      // Fetch Index Data
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

      // Fetch Crop Health
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

      // Fetch Soil Moisture
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

      // Fetch NPK Data
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

      // Calculate AI Yield
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

      // Generate Advisory
      .addCase(genrateAdvisory.pending, (state) => {
        state.loading.advisory = true;
        state.error = null;
      })
      .addCase(genrateAdvisory.fulfilled, (state, action) => {
        state.loading.advisory = false;
        state.advisory = action.payload.Advisory;
      })
      .addCase(genrateAdvisory.rejected, (state, action) => {
        state.loading.advisory = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedIndex, resetState, removeSelectedIndexData } =
  satelliteSlice.actions;

export default satelliteSlice.reducer;
