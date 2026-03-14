export const decodeJWT = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = atob(base64);
    return JSON.parse(decodedPayload);
  } catch {
    return null;
  }
};
