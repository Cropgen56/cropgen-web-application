// Single source of truth for farm/crop enum options — mirrors
// cropgen-server/src/constants/farmEnums.js. Previously these were
// hardcoded separately in AddFieldSidebar.jsx and AddFarm.jsx.

export const FARMING_TYPES = [
  "Conventional",
  "Organic",
  "Inorganic",
  "Integrated",
  "Natural",
  "Regenerative",
  "Precision",
  "Other",
  "Not Specified",
];

export const LEGACY_IRRIGATION_TYPES = [
  "open-irrigation",
  "drip-irrigation",
  "sprinkler",
];

/** CropGen irrigation options: legacy types plus the expanded global list. */
export const IRRIGATION_TYPES = [
  "open-irrigation",
  "drip-irrigation",
  "sprinkler",
  "rainfed",
  "drip",
  "flood_surface",
  "furrow",
  "center_pivot",
  "micro_irrigation",
  "other",
  "not_specified",
];

export const IRRIGATION_TYPE_LABELS = {
  "open-irrigation": "Open Irrigation",
  "drip-irrigation": "Drip Irrigation",
  sprinkler: "Sprinkler",
  rainfed: "Rainfed",
  drip: "Drip",
  flood_surface: "Flood / Surface",
  furrow: "Furrow",
  center_pivot: "Center Pivot",
  micro_irrigation: "Micro Irrigation",
  other: "Other",
  not_specified: "Not Specified",
};

export const formatFarmEnumLabel = (value) => {
  if (!value) return "";
  if (IRRIGATION_TYPE_LABELS[value]) return IRRIGATION_TYPE_LABELS[value];
  return String(value)
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const CROP_LIFECYCLE_TYPES = ["seasonal", "perennial"];

export const CROP_ROLES = ["main", "intercrop", "cover"];

export const CROP_ROLE_LABELS = {
  main: "Main crop",
  intercrop: "Intercrop",
  cover: "Cover crop",
};

export const CROP_LIFECYCLE_LABELS = {
  seasonal: "Seasonal",
  perennial: "Perennial",
};
