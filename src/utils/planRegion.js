/**
 * Which price list a signed-in web user sees. The server's answer
 * (`serverCurrency`, from the plans API) wins; the rest is a fallback.
 * India -> INR plan; every other country -> the international USD plans.
 * Decided by the country saved on the profile (chosen at signup); a user with
 * no country falls back to the phone's country code (+91 = India), and with
 * neither to USD, the web app's original default.
 */
export function planCurrencyForUser(user, serverCurrency = null) {
  if (serverCurrency === "INR" || serverCurrency === "USD") return serverCurrency;
  const country = String(user?.country || "").trim().toUpperCase();
  if (country) return country === "IN" ? "INR" : "USD";
  const phone = String(user?.phone || "").trim();
  if (phone.startsWith("+91")) return "INR";
  return "USD";
}
