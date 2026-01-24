import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_SMART_ADVISORY;

export const runSmartAdvisory = createAsyncThunk(
  "smartAdvisory/runSmartAdvisory",
  async ({ fieldId, geometryId, targetDate, language, token }, thunkAPI) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/advisory/${fieldId}/advisory/run`,
        { geometryId, targetDate, language },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchSmartAdvisory = createAsyncThunk(
  "smartAdvisory/fetchSmartAdvisory",
  async ({ fieldId }, thunkAPI) => {
    try {
      const res = await axios.get(`${BASE_URL}/farm-advisory/${fieldId}`);

      return res.data;
    } catch (err) {
      console.error("Fetch Smart Advisory API Error:", err);
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

const smartAdvisorySlice = createSlice({
  name: "smartAdvisory",
  initialState: {
    loading: false,
    advisory: null,
    error: null,
  },
  reducers: {
    clearSmartAdvisory(state) {
      state.advisory = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Run Advisory
      .addCase(runSmartAdvisory.pending, (state) => {
        state.loading = true;
      })
      .addCase(runSmartAdvisory.fulfilled, (state, action) => {
        state.loading = false;
        state.advisory = action.payload;
      })
      .addCase(runSmartAdvisory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Advisory
      .addCase(fetchSmartAdvisory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSmartAdvisory.fulfilled, (state, action) => {
  state.loading = false;

  const advisories = action.payload?.advisories ?? [];

  if (advisories.length === 0) {
    state.advisory = null;
    return;
  }

  // ✅ pick latest advisory by createdAt
  const latestAdvisory = advisories.reduce((latest, current) => {
    return new Date(current.createdAt) > new Date(latest.createdAt)
      ? current
      : latest;
  });

  state.advisory = latestAdvisory;
}).addCase(fetchSmartAdvisory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSmartAdvisory } = smartAdvisorySlice.actions;
export default smartAdvisorySlice.reducer;
