import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchweatherData = createAsyncThunk(
  "weather/fetchweatherData",
  async ({ latitude, longitude }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${latitude},${longitude}?key=NAJUNXK89Y3ZLPJL3NYH6BS4E`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch weather data"
      );
    }
  }
);

export const createAOI = createAsyncThunk(
  "weather/createAOI",
  async (payload, { rejectWithValue, dispatch, getState }) => {
    const apiKey = "5b97d3f0-a01a-490b-aad1-3bfa848309f2";
    const url = "https://observearth.com/api/geometry/";
    
    try {
      const state = getState();
      const existingAOI = state.weather.aois?.find(
        (aoi) => aoi.name === payload.name
      );
      
      if (existingAOI) {
        return existingAOI.id;
      }

      const response = await axios.post(url, payload, {
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/json",
        },
      });
      
      await dispatch(fetchAOIs()).unwrap();
      
      return response.data.id;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || '';
      const isDuplicate = 
        error.response?.status === 409 || 
        error.response?.status === 400 ||
        errorMessage.toLowerCase().includes('already exists') ||
        errorMessage.toLowerCase().includes('duplicate');
      
      if (isDuplicate) {
        await dispatch(fetchAOIs()).unwrap();
        const state = getState();
        const existingAOI = state.weather.aois?.find(
          (aoi) => aoi.name === payload.name
        );
        if (existingAOI) {
          return existingAOI.id;
        }
      }
      
      return rejectWithValue(error.response?.data || "Failed to create AOI");
    }
  }
);

export const fetchAOIs = createAsyncThunk(
  "weather/fetchAOIs",
  async (_, { rejectWithValue }) => {
    const apiKey = "5b97d3f0-a01a-490b-aad1-3bfa848309f2";
    const url = "https://observearth.com/api/geometry/?detail=false";
    try {
      const response = await axios.get(url, {
        headers: {
          "X-API-Key": apiKey,
        },
      });

      const aoisData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      return aoisData;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch AOIs");
    }
  }
);

export const fetchForecastData = createAsyncThunk(
  "weather/fetchForecastData",
  async ({ geometry_id }, { rejectWithValue }) => {
    const apiKey = "5b97d3f0-a01a-490b-aad1-3bfa848309f2";
    const url = `https://observearth.com/api/weather/forecast/?geometry_id=${geometry_id}`;
    try {
      const response = await axios.get(url, {
        headers: {
          "X-API-Key": apiKey,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch forecast data"
      );
    }
  }
);


export const fetchHistoricalWeather = createAsyncThunk(
  "weather/fetchHistoricalWeather",
  async ({ geometry_id, start_date, end_date }, { rejectWithValue }) => {
    const apiKey = "5b97d3f0-a01a-490b-aad1-3bfa848309f2";
    const url = `https://observearth.com/api/weather/historical/?geometry_id=${geometry_id}&start_date=${start_date}&end_date=${end_date}`;
    try {
      const response = await axios.get(url, {
        headers: {
          "X-API-Key": apiKey,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch historical weather data"
      );
    }
  }
);

const weatherSlice = createSlice({
  name: "weather",
  initialState: {
    weatherData: null,
    forecastData: null,
    historicalWeather: null,
    currentWeather: null,
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
  },
  reducers: {
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
    clearHistoricalWeather: (state) => {
      state.historicalWeather = null;
      state.historicalError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchweatherData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchweatherData.fulfilled, (state, action) => {
        state.currentWeather = action.payload.currentConditions;
        state.loading = false;
      })
      .addCase(fetchweatherData.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
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
        state.forecastData = action.payload;
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

export const { setDateRange, clearHistoricalWeather } = weatherSlice.actions;

export const selectAOIs = (state) => state.weather.aois || [];
export const selectAOIByName = (name) => (state) => 
  state.weather.aois?.find(aoi => aoi.name === name) || null;

export default weatherSlice.reducer;