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

// Weather slice
const weatherSlice = createSlice({
  name: "weather",
  initialState: {
    weatherData: null,
    forecastData: null,
    currentWeather: null,
    loading: false,
    error: null,
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
      });
  },
});

export default weatherSlice.reducer;
