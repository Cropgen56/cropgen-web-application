import { CROPGEN_REFRESH_STORAGE_KEY } from "../api/authApi";

/** Refresh access token this many seconds before JWT `exp`. */
export const ACCESS_TOKEN_REFRESH_LEAD_SECONDS = 5 * 60;

export function persistRefreshToken(refreshToken) {
  if (typeof window === "undefined" || !refreshToken) return;
  try {
    sessionStorage.setItem(CROPGEN_REFRESH_STORAGE_KEY, refreshToken);
  } catch {
    /* ignore quota */
  }
}

export function clearPersistedRefreshToken() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(CROPGEN_REFRESH_STORAGE_KEY);
    sessionStorage.removeItem("cropgen_google_signup_pending");
  } catch {
    /* ignore */
  }
}

export function hasPersistedRefreshToken() {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(sessionStorage.getItem(CROPGEN_REFRESH_STORAGE_KEY));
  } catch {
    return false;
  }
}

const GOOGLE_SIGNUP_PENDING_KEY = "cropgen_google_signup_pending";

export function persistGoogleSignupPending(pending) {
  if (typeof window === "undefined") return;
  try {
    if (pending) sessionStorage.setItem(GOOGLE_SIGNUP_PENDING_KEY, "1");
    else sessionStorage.removeItem(GOOGLE_SIGNUP_PENDING_KEY);
  } catch {
    /* ignore */
  }
}

export function hasGoogleSignupPending() {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(GOOGLE_SIGNUP_PENDING_KEY) === "1";
  } catch {
    return false;
  }
}

/** Milliseconds until proactive refresh; 0 means refresh now. */
export function msUntilAccessTokenRefresh(expUnixSeconds) {
  const now = Date.now() / 1000;
  const secondsUntilExpiry = expUnixSeconds - now;
  if (secondsUntilExpiry <= 0) return 0;
  const secondsUntilRefresh =
    secondsUntilExpiry - ACCESS_TOKEN_REFRESH_LEAD_SECONDS;
  if (secondsUntilRefresh <= 0) return 0;
  return secondsUntilRefresh * 1000;
}
