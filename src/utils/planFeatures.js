/**
 * Single source of truth for plan feature flags on web.
 *
 * Keys mirror `features` in cropgen-server/src/models/subscription-plan.model.js.
 * Each key lists the web screen that enforces it, so a flag added here without a
 * gate is visible in review (see planFeatures.test.js).
 */
export const FEATURE_DISPLAY_NAMES = {
  satelliteImagery: "Satellite Imagery",
  cropHealthAndYield: "Crop Health & Yield Monitoring",
  soilAnalysisAndHealth: "Soil Analysis & Health",
  weatherAnalytics: "Weather Analytics",
  vegetationIndices: "Vegetation Indices",
  waterIndices: "Water Indices",
  evapotranspirationMonitoring: "Evapotranspiration Monitoring",
  agronomicInsights: "Agronomic Insights",
  weeklyAdvisoryReports: "Weekly Advisory Reports",
  cropGrowthMonitoring: "Crop Growth Monitoring",
  farmOperationsManagement: "Farm Operations Management",
  diseaseDetectionAlerts: "Disease Detection Alerts",
  smartAdvisorySystem: "Smart Advisory System",
  soilReportGeneration: "Soil Report Generation",
  cropCalendar: "Crop Calendar",
  zoningAnalysis: "Zoning & VRA Analysis",
};

export const PLAN_FEATURE_KEYS = Object.keys(FEATURE_DISPLAY_NAMES);

/** Where each flag is enforced in the web app. */
export const FEATURE_GATES = {
  satelliteImagery: "components/dashboard/mapview/MapView.jsx (index dates + imagery overlay)",
  cropHealthAndYield: "CropHealthCard (also inside pages/FarmReport, which needs only an active subscription; each section enforces its own flag)",
  soilAnalysisAndHealth: "CropHealthCard (soil analytics)",
  weatherAnalytics: "ForeCast, pages/Weather",
  vegetationIndices: "VegetationIndex",
  waterIndices: "WaterIndex",
  evapotranspirationMonitoring: "ETChart",
  agronomicInsights: "Insights",
  weeklyAdvisoryReports: "CropAdvisory (Dashboard)",
  cropGrowthMonitoring: "PlantGrowthActivity",
  farmOperationsManagement: "pages/Operation",
  diseaseDetectionAlerts: "pages/DiseaseDetection",
  smartAdvisorySystem: "pages/SmartAdviosory",
  soilReportGeneration: "pages/SoilReport",
  zoningAnalysis: "pages/Zoning",
  // No web UI exists yet: pages/PersonaliseCropSchedule is a stub with mock data.
  cropCalendar: null,
};
