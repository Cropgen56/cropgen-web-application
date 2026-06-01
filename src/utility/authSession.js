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
  } catch {
    /* ignore */
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
