// Single source of truth for farm/crop enum options — mirrors
// cropgen-server/src/constants/farmEnums.js. Previously these were
// hardcoded separately in AddFieldSidebar.jsx and AddFarm.jsx.

export const FARMING_TYPES = [
  "Conventional",
  "Organic",
  "Integrated",
  "Natural",
  "Regenerative",
  "Precision",
  "Other",
  "Not Specified",
];

export const IRRIGATION_TYPES = ["open-irrigation", "drip-irrigation", "sprinkler"];

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
