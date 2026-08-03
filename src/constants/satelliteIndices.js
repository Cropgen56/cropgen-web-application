/** Satellite IDs accepted by cropgen-satellite-server (`satellite` request field). */
export const SATELLITES = {
  S2: "s2",
  S1: "s1",
};

export const SATELLITE_OPTIONS = [
  { value: SATELLITES.S2, label: "Satellite 2" },
  { value: SATELLITES.S1, label: "Satellite 1" },
];

export const DEFAULT_SATELLITE = SATELLITES.S2;

/** Sentinel-2 optical indices (POST /calculate/index). */
export const S2_INDEX_META = {
  TRUE_COLOR: { label: "Field View", hint: "See anytime", icon: "📸" },
  NDVI: { label: "Crop Health", hint: "Weekly check", icon: "🌿" },
  EVI: { label: "Crop Health (Dense)", hint: "Thick crops", icon: "🌿" },
  EVI2: { label: "Crop Health (Simple)", hint: "Quick check", icon: "🌿" },
  SAVI: { label: "Early Stage Health", hint: "Just sowed", icon: "🌱" },
  MSAVI: { label: "Dry Land Health", hint: "Dry / sparse field", icon: "🏜️" },
  NDMI: { label: "Water in Leaves", hint: "Check irrigation", icon: "💧" },
  NDWI: { label: "Plant Water Level", hint: "Plant thirst", icon: "🪣" },
  SMI: { label: "Soil Moisture", hint: "Before watering", icon: "🌍" },
  CCC: { label: "Leaf Greenness", hint: "Nutrient check", icon: "🍃" },
  NITROGEN: { label: "Nitrogen Level", hint: "Before fertilizing", icon: "🧪" },
  SOC: { label: "Soil Fertility", hint: "Soil audit", icon: "🪱" },
  NDRE: { label: "Crop Stress / Maturity", hint: "Disease / Harvest", icon: "⚠️" },
  RECI: { label: "Leaf Richness", hint: "Mid-late season", icon: "🌾" },
};

export const S2_INDICES = Object.keys(S2_INDEX_META);

/** Sentinel-1 radar indices (POST /calculate/index with satellite: "s1"). */
export const S1_INDEX_META = {
  VV: { label: "Soil Moisture", hint: "Soil / moisture", icon: "🌍" },
  VH: { label: "Crop Biomass", hint: "Vegetation biomass", icon: "🌿" },
  VV_VH: { label: "Crop Structure", hint: "Structure / growth", icon: "📊" },
  VH_VV: { label: "Crop Growth", hint: "Canopy density", icon: "📈" },
  RVI: { label: "Vegetation Health", hint: "Vegetation vigor", icon: "💚" },
  SDWI: { label: "Waterlogging Risk", hint: "Flood / waterlogging", icon: "💧" },
  SIGMA0_VV: {
    label: "Advanced Soil Reflectance",
    hint: "Sigma0 VV (dB)",
    icon: "📶",
  },
  SIGMA0_VH: {
    label: "Advanced Vegetation Reflectance",
    hint: "Sigma0 VH (dB)",
    icon: "📶",
  },
  GAMMA0_VV: {
    label: "Terrain-Corrected Soil Moisture",
    hint: "Gamma0 VV (dB)",
    icon: "🛰️",
  },
  GAMMA0_VH: {
    label: "Terrain-Corrected Crop Biomass",
    hint: "Gamma0 VH (dB)",
    icon: "🛰️",
  },
};

export const S1_INDICES = Object.keys(S1_INDEX_META);

export const DEFAULT_INDEX_BY_SATELLITE = {
  [SATELLITES.S2]: "NDVI",
  [SATELLITES.S1]: "RVI",
};

export function getIndicesForSatellite(satellite) {
  return satellite === SATELLITES.S1 ? S1_INDICES : S2_INDICES;
}

export function getIndexMetaForSatellite(satellite) {
  return satellite === SATELLITES.S1 ? S1_INDEX_META : S2_INDEX_META;
}

export function getDefaultIndexForSatellite(satellite) {
  return (
    DEFAULT_INDEX_BY_SATELLITE[satellite] ||
    DEFAULT_INDEX_BY_SATELLITE[DEFAULT_SATELLITE]
  );
}

export function isSentinel1(satellite) {
  return String(satellite || "")
    .toLowerCase()
    .startsWith("s1");
}
