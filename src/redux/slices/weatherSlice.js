import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk for fetching current weather data
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

// Async thunk for creating an AOI
export const createAOI = createAsyncThunk(
  "weather/createAOI",
  async (payload, { rejectWithValue, dispatch }) => {
    const apiKey = "5b97d3f0-a01a-490b-aad1-3bfa848309f2";
    const url = "https://observearth.com/api/geometry/";
    try {
      const response = await axios.post(url, payload, {
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/json",
        },
      });
      dispatch(fetchAOIs());
      return response.data.id;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to create AOI");
    }
  }
);

// Async thunk for fetching all AOIs
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
      console.error("Error fetching AOIs:", error);
      return rejectWithValue(error.response?.data || "Failed to fetch AOIs");
    }
  }
);

// create the forcast thunk here

// Weather slice
const weatherSlice = createSlice({
  name: "weather",
  initialState: {
    weatherData: null,
    forecastData: null,
    currentWeather: null,
    loading: false,
    error: null,
    aoiId: null,
    aois: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    // Fetch current weather
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
      // Create AOI
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
      // Fetch AOIs
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
      });
  },
});

export default weatherSlice.reducer;
