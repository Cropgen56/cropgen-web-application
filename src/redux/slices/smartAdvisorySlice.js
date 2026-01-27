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
      const res = await axios.get(`${BASE_URL}/advisory/${fieldId}?latest=true`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const sendFarmAdvisoryWhatsApp = createAsyncThunk(
  "smartAdvisory/sendFarmAdvisoryWhatsApp",
  async ({ phone, farmAdvisoryId }, thunkAPI) => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/whatsapp/send-farm-advisory`,
        {
          phone,
          farmAdvisoryId,
        }
      );

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || err.message
      );
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

    whatsappSending: false,
  whatsappSuccess: false,
  whatsappError: null,
  },

  reducers: {
    clearSmartAdvisory(state) {
      state.advisory = null;
      state.error = null;
    }
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
      /* ---------- Send WhatsApp Advisory ---------- */
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

export const {
  clearSmartAdvisory,
} = smartAdvisorySlice.actions;

export default smartAdvisorySlice.reducer;
