import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import api from "../../api/api";
import { updateAdvisoryActivityProgressAPI } from "../../api/smartAdvisoryApi";

const BASE_URL = process.env.REACT_APP_SMART_ADVISORY;

/* =====================================================
   FETCH SMART ADVISORY
===================================================== */
export const fetchSmartAdvisory = createAsyncThunk(
  "smartAdvisory/fetchSmartAdvisory",
  async ({ fieldId }, thunkAPI) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/advisory/${fieldId}?latest=true`,
      );

      return {
        exists: res.data?.exists ?? false,
        advisory: res.data?.advisories?.[0] || null,
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const updateAdvisoryActivityProgress = createAsyncThunk(
  "smartAdvisory/updateActivityProgress",
  async ({ advisoryId, activityType, progress }, thunkAPI) => {
    try {
      const data = await updateAdvisoryActivityProgressAPI({
        advisoryId,
        activityType,
        progress,
      });
      return data.advisory;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Failed to update progress"
      );
    }
  }
);

/* =====================================================
   SEND WHATSAPP ADVISORY (UNCHANGED)
===================================================== */
export const sendFarmAdvisoryWhatsApp = createAsyncThunk(
  "smartAdvisory/sendFarmAdvisoryWhatsApp",
  async ({ phone, farmAdvisoryId, language }, thunkAPI) => {
    try {
      const res = await api.post("/api/whatsapp/send-farm-advisory", {
        phone,
        farmAdvisoryId,
        language,
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  },
);

/* =====================================================
   SLICE
===================================================== */
const smartAdvisorySlice = createSlice({
  name: "smartAdvisory",
  initialState: {
    loading: false,

    advisory: null,
    exists: false, // 🔑 NEW (for polling & instant update)
    error: null,

    whatsappSending: false,
    whatsappSuccess: false,
    whatsappError: null,

    progressUpdating: null,
    progressError: null,
  },

  reducers: {
    clearSmartAdvisory(state) {
      state.advisory = null;
      state.exists = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ---------- Fetch Advisory ---------- */
      .addCase(fetchSmartAdvisory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSmartAdvisory.fulfilled, (state, action) => {
        state.loading = false;
        state.exists = action.payload.exists;
        state.advisory = action.payload.advisory;
      })
      .addCase(fetchSmartAdvisory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateAdvisoryActivityProgress.pending, (state, action) => {
        state.progressUpdating = action.meta.arg.activityType;
        state.progressError = null;
      })
      .addCase(updateAdvisoryActivityProgress.fulfilled, (state, action) => {
        state.progressUpdating = null;
        state.advisory = action.payload;
        state.exists = true;
      })
      .addCase(updateAdvisoryActivityProgress.rejected, (state, action) => {
        state.progressUpdating = null;
        state.progressError = action.payload;
      })

      /* ---------- WhatsApp ---------- */
      .addCase(sendFarmAdvisoryWhatsApp.pending, (state) => {
        state.whatsappSending = true;
        state.whatsappSuccess = false;
        state.whatsappError = null;
      })
      .addCase(sendFarmAdvisoryWhatsApp.fulfilled, (state) => {
        state.whatsappSending = false;
        state.whatsappSuccess = true;
      })
      .addCase(sendFarmAdvisoryWhatsApp.rejected, (state, action) => {
        state.whatsappSending = false;
        state.whatsappError = action.payload;
      });
  },
});

export const { clearSmartAdvisory } = smartAdvisorySlice.actions;
export default smartAdvisorySlice.reducer;
