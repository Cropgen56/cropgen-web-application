import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getUserProfile,
  updateUser,
  sendOtp,
  verifyOtp,
  sendWhatsappOtp,
  verifyWhatsappOtp,
  resendWhatsappOtp,
  completeUserProfile,
  refreshToken,
  logoutUserApi,
  getAvatarPresignedUrl,
  CROPGEN_REFRESH_STORAGE_KEY,
} from "../../api/authApi";
import { decodeJWT } from "../../utility/decodetoken";

// Prevents simultaneous token refresh races
const refreshLock = {
  isLocked: false,
  queue: [],
  acquire() {
    if (this.isLocked) {
      return new Promise((resolve, reject) => {
        this.queue.push({ resolve, reject });
      });
    }
    this.isLocked = true;
    return Promise.resolve();
  },
  release(error = null, token = null) {
    this.isLocked = false;
    this.queue.forEach(({ resolve, reject }) => {
      if (error) reject(error);
      else resolve(token);
    });
    this.queue = [];
  },
};

export const refreshAccessToken = createAsyncThunk(
  "auth/refreshAccessToken",
  async (_, { rejectWithValue }) => {
    try {
      await refreshLock.acquire();
      const response = await refreshToken();

      if (!response.accessToken) {
        throw new Error("No access token in response");
      }

      refreshLock.release(null, response.accessToken);
      return response;
    } catch (error) {
      refreshLock.release(error);
      return rejectWithValue(error.message || "Token refresh failed");
    }
  },
  {
    condition: (_, { getState }) => {
      const { auth } = getState();
      return !auth.refreshPending;
    },
  },
);

export const getUserProfileData = createAsyncThunk(
  "auth/getUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserProfile();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch user profile",
      );
    }
  },
);

export const updateUserData = createAsyncThunk(
  "auth/updateUser",
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const response = await updateUser({ id, updateData });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update user");
    }
  },
);

export const sendotp = createAsyncThunk(
  "auth/sendOtp",
  async (otpdata, { rejectWithValue }) => {
    try {
      const response = await sendOtp(otpdata, otpdata?.authFlow);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "OTP sending failed");
    }
  },
);

export const verifyuserotp = createAsyncThunk(
  "auth/verifyotp",
  async ({ email, otp, authFlow }, { rejectWithValue }) => {
    try {
      const response = await verifyOtp({ email, otp }, authFlow);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "OTP verification failed");
    }
  },
);

// WhatsApp OTP (phone) — Biodrops web app
export const sendWhatsappOtpThunk = createAsyncThunk(
  "auth/sendWhatsappOtp",
  async (data, { rejectWithValue }) => {
    try {
      const response = await sendWhatsappOtp(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "OTP sending failed");
    }
  },
);

export const verifyWhatsappOtpThunk = createAsyncThunk(
  "auth/verifyWhatsappOtp",
  async ({ phone, otp }, { rejectWithValue }) => {
    try {
      const response = await verifyWhatsappOtp({ phone, otp });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "OTP verification failed");
    }
  },
);

export const resendWhatsappOtpThunk = createAsyncThunk(
  "auth/resendWhatsappOtp",
  async ({ phone }, { rejectWithValue }) => {
    try {
      const response = await resendWhatsappOtp({ phone });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "OTP resend failed");
    }
  },
);

export const completeProfile = createAsyncThunk(
  "auth/completeProfile",
  async (
    {
      terms,
      organizationCode,
      firstName,
      lastName,
      phone,
      language,
      role,
      country,
      state,
      city,
      village,
    },
    { rejectWithValue },
  ) => {
    try {
      // #region agent log
      fetch("http://127.0.0.1:7816/ingest/2f2e2976-5f6e-4ec5-a3c9-5521133e72c2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "304cd3",
        },
        body: JSON.stringify({
          sessionId: "304cd3",
          runId: "signup-profile-debug",
          hypothesisId: "H1",
          location: "authSlice.js:completeProfileThunk:beforeApi",
          message: "Complete profile thunk payload snapshot",
          data: {
            hasFirstName: Boolean(firstName),
            firstNameLength: String(firstName || "").trim().length,
            hasLastName: Boolean(lastName),
            lastNameLength: String(lastName || "").trim().length,
            hasPhone: Boolean(phone),
            hasCountry: Boolean(country),
            hasLanguage: Boolean(language),
            hasOrganizationCode: Boolean(organizationCode),
            termsAccepted: terms === true,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      const response = await completeUserProfile({
        terms,
        organizationCode,
        firstName,
        lastName,
        phone,
        language,
        role,
        country,
        state,
        city,
        village,
      });
      return response;
    } catch (error) {
      // #region agent log
      fetch("http://127.0.0.1:7816/ingest/2f2e2976-5f6e-4ec5-a3c9-5521133e72c2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "304cd3",
        },
        body: JSON.stringify({
          sessionId: "304cd3",
          runId: "signup-profile-debug",
          hypothesisId: "H4",
          location: "authSlice.js:completeProfileThunk:catch",
          message: "Complete profile API rejected",
          data: {
            status: error?.response?.status || null,
            responseMessage: error?.response?.data?.message || null,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      return rejectWithValue(
        error.response?.data || { message: "Profile completion failed" },
      );
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await logoutUserApi();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Logout failed");
    }
  },
);

export const uploadAvatar = createAsyncThunk(
  "auth/uploadAvatar",
  async ({ file, onProgress }, { rejectWithValue }) => {
    try {
      const presignRes = await getAvatarPresignedUrl(file.type);
      const { uploadUrl } = presignRes.data;
      const key = uploadUrl.split(".com/")[1].split("?")[0];

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable && onProgress) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error("Upload failed"));
        });

        xhr.addEventListener("error", () => reject(new Error("Upload failed")));

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      return { key };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Avatar upload failed",
      );
    }
  },
);

/** Used by store for SSR-safe hydration from localStorage */
export const authInitialState = {
  user: null,
  token: null,
  userDetails: null,
  userProfile: null,
  role: null,
  status: "idle",
  profileStatus: "idle",
  error: null,
  onboardingRequired: false,
  isAuthenticated: false,
  refreshPending: false,
  avatarUploading: false,
  avatarUploadProgress: 0,
};

const initialState = authInitialState;

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      if (typeof window !== "undefined") {
        try {
          sessionStorage.removeItem(CROPGEN_REFRESH_STORAGE_KEY);
        } catch {
          /* ignore */
        }
      }
      Object.assign(state, authInitialState);
    },
    decodeToken: (state) => {
      if (!state.token) return;
      try {
        const userData = decodeJWT(state.token);
        state.user = {
          id: userData.id,
          email: userData.email || userData.sub || null,
          phone: userData.phone || null,
          role: userData.role,
          organizationCode: userData.organizationCode,
        };
        state.role = userData.role;
        state.onboardingRequired = userData.onboardingRequired || false;
        state.isAuthenticated = true;
      } catch {
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        state.onboardingRequired = false;
        state.error = "Invalid token";
      }
    },
    setGoogleLoginData: (state, action) => {
      const { accessToken, user, role, onboardingRequired } = action.payload;
      state.token = accessToken;
      state.user = user;
      state.role = role;
      state.onboardingRequired = onboardingRequired;
      state.isAuthenticated = !!accessToken;
      state.status = "succeeded";
      state.error = null;
    },
    resetAuthState: () => authInitialState,
    clearError: (state) => {
      state.error = null;
    },
    setAvatarUploadProgress: (state, action) => {
      state.avatarUploadProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshAccessToken.pending, (state) => {
        state.refreshPending = true;
        state.error = null;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.refreshPending = false;
        state.token = action.payload.accessToken;
        state.user = action.payload.user || null;
        state.role = action.payload.role || null;
        state.isAuthenticated = !!action.payload.accessToken;
        state.onboardingRequired = action.payload.onboardingRequired || false;
        state.error = null;
        if (typeof window !== "undefined" && action.payload.refreshToken) {
          try {
            sessionStorage.setItem(
              CROPGEN_REFRESH_STORAGE_KEY,
              action.payload.refreshToken,
            );
          } catch {
            /* ignore */
          }
        }
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.refreshPending = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.role = null;
        state.onboardingRequired = false;
        if (typeof window !== "undefined") {
          try {
            sessionStorage.removeItem(CROPGEN_REFRESH_STORAGE_KEY);
          } catch {
            /* ignore */
          }
        }
      })

      .addCase(getUserProfileData.pending, (state) => {
        state.profileStatus = "loading";
        state.error = null;
      })
      .addCase(getUserProfileData.fulfilled, (state, action) => {
        state.profileStatus = "succeeded";
        state.userProfile = action.payload.user || null;
        state.error = null;
      })
      .addCase(getUserProfileData.rejected, (state, action) => {
        state.profileStatus = "failed";
        state.error = action.payload;
      })

      .addCase(updateUserData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateUserData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userDetails = action.payload.user || state.userDetails;
        state.error = null;
      })
      .addCase(updateUserData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(sendotp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(sendotp.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user || state.user;
        state.error = null;
      })
      .addCase(sendotp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(verifyuserotp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyuserotp.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { accessToken, user, role, onboardingRequired } = action.payload;
        state.token = accessToken;
        state.user = user || null;
        state.role = role || null;
        state.isAuthenticated = !!accessToken;
        state.onboardingRequired = onboardingRequired || false;
        state.error = null;
      })
      .addCase(verifyuserotp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(verifyWhatsappOtpThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyWhatsappOtpThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const responseData = action.payload?.data || {};
        const {
          accessToken,
          user,
          role,
          onboardingRequired,
          refreshToken: refreshJwt,
        } = action.payload;
        const resolvedAccessToken = accessToken || responseData.accessToken || null;
        const resolvedUser = user || responseData.user || null;
        const resolvedRole = role || responseData.role || resolvedUser?.role || null;
        const resolvedOnboardingRequired =
          onboardingRequired ??
          responseData.onboardingRequired ??
          responseData.user?.onboardingRequired ??
          false;
        const resolvedRefreshToken =
          refreshJwt || responseData.refreshToken || null;
        state.token = resolvedAccessToken;
        state.user = resolvedUser;
        state.role = resolvedRole;
        state.isAuthenticated = !!resolvedAccessToken;
        state.onboardingRequired = resolvedOnboardingRequired;
        state.error = null;
        if (typeof window !== "undefined" && resolvedRefreshToken) {
          try {
            sessionStorage.setItem(
              CROPGEN_REFRESH_STORAGE_KEY,
              resolvedRefreshToken,
            );
          } catch {
            /* ignore */
          }
        }
      })
      .addCase(verifyWhatsappOtpThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(completeProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(completeProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { accessToken, user, role, onboardingRequired } = action.payload;
        state.token = accessToken || null;
        state.user = user || state.user;
        state.role = role || state.role;
        state.isAuthenticated = !!accessToken;
        state.onboardingRequired = onboardingRequired || false;
        state.error = null;
      })
      .addCase(completeProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(uploadAvatar.pending, (state) => {
        state.avatarUploading = true;
        state.avatarUploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.avatarUploading = false;
        state.avatarUploadProgress = 100;
        if (state.userProfile) {
          state.userProfile = { ...state.userProfile, avatar: action.payload.key };
        }
        if (state.user) {
          state.user = { ...state.user, avatar: action.payload.key };
        }
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.avatarUploading = false;
        state.avatarUploadProgress = 0;
        state.error = action.payload;
      });
  },
});

export const {
  logout,
  decodeToken,
  resetAuthState,
  setGoogleLoginData,
  clearError,
  setAvatarUploadProgress,
} = authSlice.actions;

export default authSlice.reducer;
