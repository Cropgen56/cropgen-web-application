export const digitsOnly = (v) => String(v || "").replace(/\D/g, "");

export const normalizeDialCode = (v) => digitsOnly(v).slice(0, 4);

// world-countries lists area codes as `idd.suffixes` (US: 380 of them). A
// single suffix is part of the country code; with several, the code is the
// root alone (+1 US/CA/DO/PR, +7 RU/KZ). Overrides fix the entries that rule
// gets wrong or the dataset lists incorrectly (UM as +268, AX as +35818).
const DIAL_CODE_OVERRIDES = { VA: "39", SH: "290", EH: "212", UM: "1", AX: "358" };

/** Dial code (digits) for a `world-countries` entry, e.g. US → "1". */
export const worldCountryDialCode = (country) => {
  const iso2 = String(country?.cca2 || "").toUpperCase();
  if (DIAL_CODE_OVERRIDES[iso2]) return DIAL_CODE_OVERRIDES[iso2];
  const root = country?.idd?.root || "";
  const suffixes = country?.idd?.suffixes || [];
  const suffix = suffixes.length === 1 ? suffixes[0] : "";
  return normalizeDialCode(`${root}${suffix}`);
};

export const maxLocalPhoneLength = (dialCode) => {
  const dial = normalizeDialCode(dialCode);
  const maxByE164 = Math.max(4, 15 - (dial.length || 0));
  if (dial === "91") return 10;
  return Math.min(maxByE164, 12);
};

/** Strip pasted country codes / trunk zeros and cap length for the dial code. */
export const normalizePhoneLocal = (dialCode, raw) => {
  const dial = normalizeDialCode(dialCode);
  let local = digitsOnly(raw);

  if (dial && local.startsWith(dial) && local.length > dial.length + 3) {
    local = local.slice(dial.length);
  }

  local = local.replace(/^0+/, "");
  return local.slice(0, maxLocalPhoneLength(dial));
};

export const buildE164 = (dialCode, localNumber) =>
  `+${normalizeDialCode(dialCode)}${normalizePhoneLocal(dialCode, localNumber)}`;

/**
 * Client-side mobile validation.
 * India (+91): exactly 10 digits starting with 6–9.
 * Other countries: E.164 (+ and 8–15 digits).
 */
export const getPhoneValidationError = (dialCode, localNumber) => {
  const dial = normalizeDialCode(dialCode);
  const local = normalizePhoneLocal(dialCode, localNumber);

  if (!dial) return "Please select a country code";
  if (!local) return "Please enter your phone number";

  if (dial === "91") {
    if (local.length !== 10) {
      return "Enter a valid 10-digit mobile number";
    }
    if (!/^[6-9]/.test(local)) {
      return "Indian mobile numbers must start with 6, 7, 8, or 9";
    }
    return "";
  }

  const e164 = `+${dial}${local}`;
  if (!/^\+[1-9]\d{7,14}$/.test(e164) || local.length < 6) {
    return "Please enter a valid phone number";
  }
  return "";
};
