/** CropGen soil report — brand palette (matches ember-* CSS variables) */
export const CROPGEN_PRIMARY = "#344e41";
export const CROPGEN_PRIMARY_DARK = "#2b4035";
export const CROPGEN_PRIMARY_LIGHT = "#5a7c6b";
export const CROPGEN_ACCENT = "#3da660";

/** @deprecated use CROPGEN_PRIMARY */
export const SATAGRO_GREEN = CROPGEN_PRIMARY;
/** @deprecated use CROPGEN_PRIMARY_DARK */
export const SATAGRO_GREEN_DARK = CROPGEN_PRIMARY_DARK;

export const CARD_RADIUS = "12px";

/** Indices shown in the intelligence report table */
export const REPORT_SATELLITE_INDICES = [
  "NDVI",
  "EVI",
  "SAVI",
  "NDMI",
  "SMI",
  "SOC",
  "NITROGEN",
];

export const INDEX_LABELS = {
  NDVI: "NDVI — Crop vigor",
  EVI: "EVI — Enhanced vegetation",
  SAVI: "SAVI — Soil-adjusted vigor",
  NDMI: "NDMI — Canopy water stress",
  SMI: "SMI — Soil moisture index",
  SOC: "SOC — Soil organic carbon proxy",
  NITROGEN: "Nitrogen proxy",
};
