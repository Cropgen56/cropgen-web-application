export const ZONE_COLORS = {
  high: "#22c55e",
  medium: "#facc15",
  low: "#f97316",
  critical: "#ef4444",
};

/** Metadata only — zone shapes are computed inside the logged-in user's farm field polygon. */
export const ZONE_TEMPLATES = [
  {
    id: "zone-a",
    name: "Zone A",
    productivityLevel: "high",
    productivityScore: 89,
    healthStatus: "Excellent",
    suggestedAction: "Maintain current irrigation and nutrient balance",
    priority: "High Priority",
  },
  {
    id: "zone-b",
    name: "Zone B",
    productivityLevel: "medium",
    productivityScore: 64,
    healthStatus: "Moderate",
    suggestedAction: "Apply nitrogen boost and monitor in 3 days",
    priority: "Medium Priority",
  },
  {
    id: "zone-c",
    name: "Zone C",
    productivityLevel: "low",
    productivityScore: 48,
    healthStatus: "Moderate",
    suggestedAction: "Increase irrigation frequency in next 24 hours",
    priority: "High Priority",
  },
  {
    id: "zone-d",
    name: "Zone D",
    productivityLevel: "critical",
    productivityScore: 41,
    healthStatus: "Critical",
    suggestedAction: "Inspect for disease and nutrient lock immediately",
    priority: "Critical Priority",
  },
];

export const dashboardRecommendations = [
  {
    id: "rec-1",
    title: "Increase Irrigation Alert",
    description: "Zone C moisture is dropping. Increase watering by 15%.",
  },
  {
    id: "rec-2",
    title: "Apply Nitrogen Recommendation",
    description: "Apply 40kg/ha nitrogen fertilizer to Zone B within 3 days.",
  },
  {
    id: "rec-3",
    title: "Monitor Vegetation Warning",
    description: "Weak vegetation detected in Zone D. Schedule a field inspection.",
  },
];

export const zoneHealthTrend = [
  { label: "Mon", health: 68 },
  { label: "Tue", health: 61 },
  { label: "Wed", health: 64 },
  { label: "Thu", health: 52 },
  { label: "Fri", health: 57 },
  { label: "Sat", health: 41 },
  { label: "Sun", health: 47 },
];

export const ndviTrend = [
  { label: "Week 1", ndvi: 0.62 },
  { label: "Week 2", ndvi: 0.56 },
  { label: "Week 3", ndvi: 0.51 },
  { label: "Week 4", ndvi: 0.38 },
  { label: "Week 5", ndvi: 0.44 },
];

export const soilNutrientReport = {
  nitrogen: 42,
  phosphorus: 68,
  potassium: 74,
  soilPh: 6.2,
  organicMatter: 2.5,
};

export const zoneDetailActions = [
  {
    id: "action-1",
    title: "Apply Nitrogen",
    description: "Apply within 3 days to reverse nutrient deficiency.",
  },
  {
    id: "action-2",
    title: "Increase Irrigation",
    description: "Soil moisture has dropped below target threshold.",
  },
  {
    id: "action-3",
    title: "Disease Inspection",
    description: "Inspect for fungal stress markers in a low Normalized Difference Vegetation Index pocket.",
  },
  {
    id: "action-4",
    title: "Monitor Weak Patch",
    description: "Track weak zone trend with next satellite pass.",
  },
];

export const zoningEditorSuggestions = [
  "Merge Zone B and Zone C to simplify intervention planning.",
  "Split northwest weak patch into a separate micro-zone.",
  "Increase seed density in southeast stress pocket.",
];
