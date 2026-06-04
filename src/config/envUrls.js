/**
 * Create React App does not treat `#` as a comment in .env values (unlike dotenv).
 * Strip accidental inline comments and whitespace so API base URLs stay valid.
 */
export function getReactAppUrl(key, fallback = "") {
  const raw = process.env[key];
  const cleaned = String(raw ?? "")
    .split("#")[0]
    .trim();
  return cleaned || fallback;
}

export const API_BASE_URL = getReactAppUrl(
  "REACT_APP_API_URL",
  "http://localhost:7070/v1",
);
