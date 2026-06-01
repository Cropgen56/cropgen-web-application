import worldCountries from "world-countries";

const worldCountriesList = Array.isArray(worldCountries)
  ? worldCountries
  : Array.isArray(worldCountries?.default)
    ? worldCountries.default
    : [];

/** Local country list when location.cropgenapp.com is unreachable. */
export function buildFallbackCountries() {
  return worldCountriesList
    .filter((c) => c?.cca2)
    .map((c) => {
      const iso2 = String(c.cca2).toUpperCase();
      const root = c.idd?.root || "";
      const suffix = c.idd?.suffixes?.[0] || "";
      const phonecode = `${root}${suffix}`.replace(/\D/g, "");
      return {
        iso2,
        name: c.name?.common || iso2,
        phonecode,
        phoneCode: phonecode,
        dialCode: phonecode,
        flag: c.flag || "",
        flag_emoji: c.flag || "",
      };
    })
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));
}
