import worldCountries from "world-countries";
import { worldCountryDialCode } from "../utils/phone";

/**
 * Offline country list when location.cropgenapp.com is slow or unavailable.
 * Shape matches location API: { iso2, name, phonecode?, flag_emoji? }.
 */
export function getStaticCountries() {
  return worldCountries
    .map((c) => {
      const iso2 = String(c.cca2 || "").toUpperCase();
      if (!iso2) return null;
      const phonecode = worldCountryDialCode(c);
      return {
        iso2,
        name: c.name?.common || iso2,
        phonecode: phonecode || undefined,
        flag_emoji: c.flag || "",
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}
