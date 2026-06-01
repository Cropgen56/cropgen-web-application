import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import smartAdvisoryApi, {
  updateAdvisoryActivityProgressAPI,
} from "../../api/smartAdvisoryApi";
import { normalizeAdvisory } from "../../utility/normalizeAdvisory";

/* =====================================================
   FETCH SMART ADVISORY
===================================================== */
export const fetchSmartAdvisory = createAsyncThunk(
  "smartAdvisory/fetchSmartAdvisory",
  async ({ fieldId }, thunkAPI) => {
    try {
      const res = await smartAdvisoryApi.get(
        `/advisory/${fieldId}?latest=true`,
      );

      const advisories =
        res.data?.advisories ??
        (Array.isArray(res.data?.data) ? res.data.data : []);

      const raw = advisories[0] ?? null;

      return {
        fieldId,
        exists: advisories.length > 0,
        advisory: normalizeAdvisory(raw),
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
      return normalizeAdvisory(data.advisory);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Failed to update progress",
      );
    }
  },
);

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

const smartAdvisorySlice = createSlice({
  name: "smartAdvisory",
  initialState: {
    loading: false,
    loadingFieldId: null,

    advisory: null,
    exists: false,
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
      state.loadingFieldId = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchSmartAdvisory.pending, (state, action) => {
        state.loading = true;
        state.loadingFieldId = action.meta.arg?.fieldId ?? null;
        state.error = null;
      })
      .addCase(fetchSmartAdvisory.fulfilled, (state, action) => {
        if (
          action.payload.fieldId &&
          state.loadingFieldId &&
          action.payload.fieldId !== state.loadingFieldId
        ) {
          return;
        }
        state.loading = false;
        state.loadingFieldId = null;
        state.exists = action.payload.exists;
        state.advisory = action.payload.advisory;
      })
      .addCase(fetchSmartAdvisory.rejected, (state, action) => {
        if (
          action.meta.arg?.fieldId &&
          state.loadingFieldId &&
          action.meta.arg.fieldId !== state.loadingFieldId
        ) {
          return;
        }
        state.loading = false;
        state.loadingFieldId = null;
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
