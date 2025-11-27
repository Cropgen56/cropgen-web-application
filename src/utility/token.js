import { decodeJWT } from "./decodetoken.js";

export function isTokenValid(token, skewSeconds = 5) {
  if (!token) return false;

  try {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) return false;

    const now = Math.floor(Date.now() / 1000);
    // valid if exp is at least a few seconds in the future
    return payload.exp > now + skewSeconds;
  } catch (err) {
    return false;
  }
}
