import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

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

/* =====================================================
   SEND WHATSAPP ADVISORY (UNCHANGED)
===================================================== */
export const sendFarmAdvisoryWhatsApp = createAsyncThunk(
  "smartAdvisory/sendFarmAdvisoryWhatsApp",
  async ({ phone, farmAdvisoryId, language }, thunkAPI) => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/whatsapp/send-farm-advisory`,
        {
          phone,
          farmAdvisoryId,
          language,
        },
      );

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
