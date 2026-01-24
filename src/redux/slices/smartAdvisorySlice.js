import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_SMART_ADVISORY;

/* =====================================================
   SMART ADVISORY APIs
===================================================== */

export const runSmartAdvisory = createAsyncThunk(
  "smartAdvisory/runSmartAdvisory",
  async ({ fieldId, geometryId, targetDate, language, token }, thunkAPI) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/advisory/${fieldId}/advisory/run`,
        { geometryId, targetDate, language },
        {
          headers: { Authorization: `Bearer ${token}` },
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
      const res = await axios.get(`${BASE_URL}/farm-advisory/v2/${fieldId}?latest=true`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchActivities = createAsyncThunk(
  "smartAdvisory/fetchActivities",
  async (
    { farmerId, fieldId, advisoryId, status, startDate, endDate },
    thunkAPI
  ) => {
    try {
      if (!farmerId) throw new Error("farmerId is required");

      const params = {
        farmerId,
        ...(fieldId && { fieldId }),
        ...(advisoryId && { advisoryId }),
        ...(status && { status }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      };

      const res = await axios.get(`${BASE_URL}/activity`, { params });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const generateActivities = createAsyncThunk(
  "smartAdvisory/generateActivities",
  async ({ farmerId, fieldId, advisoryId }, thunkAPI) => {
    try {
      if (!farmerId || !fieldId || !advisoryId) {
        throw new Error("Missing required fields");
      }

      const res = await axios.post(`${BASE_URL}/activity/generate`, {
        farmerId,
        fieldId,
        advisoryId,
      });

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);


/* =====================================================
   SLICE
===================================================== */

const smartAdvisorySlice = createSlice({
  name: "smartAdvisory",
  initialState: {
    /* advisory */
    loading: false,
    advisory: null,
    error: null,

    /* activities */
    activities: [],
    activitiesLoading: false,
    activitiesError: null,
  },

  reducers: {
    clearSmartAdvisory(state) {
      state.advisory = null;
      state.error = null;
    },
    clearActivities(state) {
      state.activities = [];
      state.activitiesError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      /* ---------- Run Advisory ---------- */
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

      /* ---------- Fetch Advisory ---------- */
      .addCase(fetchSmartAdvisory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSmartAdvisory.fulfilled, (state, action) => {
        state.loading = false;
        state.advisory = action.payload?.advisories[0]
      })
      .addCase(fetchSmartAdvisory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- Fetch Activities ---------- */
      .addCase(fetchActivities.pending, (state) => {
        state.activitiesLoading = true;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.activitiesLoading = false;
        state.activities = action.payload?.activities ?? [];
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.activitiesLoading = false;
        state.activitiesError = action.payload;
      })


     /* ---------- Generate task Activities ---------- */
      .addCase(generateActivities.pending, (state) => {
         state.activitiesLoading = true;
})
.addCase(generateActivities.fulfilled, (state) => {
  state.activitiesLoading = false;
})
.addCase(generateActivities.rejected, (state, action) => {
  state.activitiesLoading = false;
  state.activitiesError = action.payload;
});

  },
});

export const {
  clearSmartAdvisory,
  clearActivities,
} = smartAdvisorySlice.actions;

export default smartAdvisorySlice.reducer;
