import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import ZoningDashboardView from "./ZoningDashboardView";
import ZoneDetailView from "./ZoneDetailView";
import ZoneEditorView from "./ZoneEditorView";
import {
  calculateZoneCentroid,
  DEFAULT_MAP_CENTER,
  normalizeFieldRing,
} from "./zoningUtils";
import {
  buildRecommendationsFromVra,
  flattenVraRateRows,
  paramStatEntries,
  socClassEntries,
} from "./vraZoningMapper";
import {
  DEFAULT_ZONING_FIELD_STATE,
  fetchZoningAvailability,
  fieldPointsToGeoJsonPolygon,
  formatApiError,
  normalizeVraCrop,
  runZoningAnalysis,
  setActiveLayer as setActiveLayerAction,
  setActiveNutrient as setActiveNutrientAction,
  setAnalysisDate as setAnalysisDateAction,
  setSelectedZoneId as setSelectedZoneIdAction,
  setZones as setZonesAction,
} from "../../../../redux/slices/zoningSlice";

const cardClass = "rounded-2xl border border-slate-100 bg-white p-4 shadow-sm";

const ZoningSection = ({ selectedFieldDetails }) => {
  const dispatch = useDispatch();
  const [activeView, setActiveView] = useState("dashboard");

  const fieldId = selectedFieldDetails?._id;
  const fieldPoints = selectedFieldDetails?.field;
  const fieldName = selectedFieldDetails?.fieldName;
  const cropNameRaw = selectedFieldDetails?.cropName;
  const crop = useMemo(() => normalizeVraCrop(cropNameRaw), [cropNameRaw]);

  const fieldBoundary = useMemo(
    () => normalizeFieldRing(fieldPoints),
    [fieldPoints],
  );

  const zoningState = useSelector(
    (state) => state.zoning.byField[fieldId] ?? DEFAULT_ZONING_FIELD_STATE,
  );
  const loading = useSelector((state) => state.zoning.loading);

  const {
    zones,
    selectedZoneId,
    analysisDate,
    activeNutrient,
    activeLayer,
    vraResult,
    socStats,
    vraRates,
    images,
    textReport,
    hasGenerated,
    availableDates,
  } = zoningState;

  // Reset to the Analysis tab whenever the selected field changes
  useEffect(() => {
    setActiveView("dashboard");
  }, [fieldId]);

  // Prefetch availability so the date picker can use real Sentinel-2 scenes
  useEffect(() => {
    if (!fieldId || !Array.isArray(fieldPoints) || fieldPoints.length < 3) {
      return;
    }
    try {
      const geometry = fieldPointsToGeoJsonPolygon(fieldPoints);
      dispatch(fetchZoningAvailability({ fieldId, geometry }));
    } catch {
      // Invalid geometry — Generate Zones will surface the error instead
    }
  }, [dispatch, fieldId, fieldPoints]);

  const recommendations = useMemo(
    () => buildRecommendationsFromVra(vraRates, socStats, crop),
    [vraRates, socStats, crop],
  );
  const rateRows = useMemo(() => flattenVraRateRows(vraRates), [vraRates]);
  const socClasses = useMemo(
    () => socClassEntries(socStats, { includeEmpty: false }),
    [socStats],
  );
  const meanIndices = useMemo(
    () => paramStatEntries(vraResult?.param_stats),
    [vraResult],
  );
  const socAreaHa = socStats?.total_area_ha ?? null;
  const socAreaAcres = socStats?.total_area_acres ?? null;
  const sceneDate = vraResult?.date || null;
  const cloudCover = vraResult?.cloud_cover ?? null;
  const collection = vraResult?.metadata?.collection || null;
  const resM = vraResult?.metadata?.res_m ?? null;

  const center = useMemo(() => {
    if (fieldBoundary?.length >= 3) return calculateZoneCentroid(fieldBoundary);
    return DEFAULT_MAP_CENTER;
  }, [fieldBoundary]);

  const handleRunAnalysis = async () => {
    if (!fieldId || fieldBoundary.length < 3) {
      message.warning("Add a field polygon before generating zones.");
      return;
    }
    try {
      const payload = await dispatch(
        runZoningAnalysis({
          fieldId,
          fieldPoints,
          fieldBoundary,
          cropName: cropNameRaw,
          analysisDate,
        }),
      ).unwrap();
      const analysis = payload?.result;
      message.success(
        `Zoning ready — scene ${analysis?.date || analysisDate}${
          analysis?.cloud_cover != null
            ? ` · cloud ${Number(analysis.cloud_cover).toFixed(1)}%`
            : ""
        }`,
      );
    } catch (err) {
      message.error(err?.error || formatApiError(err) || "Zoning analysis failed");
    }
  };

  const handleSetActiveNutrient = (nutrient) => {
    dispatch(setActiveNutrientAction({ fieldId, nutrient, fieldBoundary }));
  };
  const handleSetActiveLayer = (layer) => {
    dispatch(setActiveLayerAction({ fieldId, layer }));
  };
  const handleSetAnalysisDate = (date) => {
    dispatch(setAnalysisDateAction({ fieldId, date }));
  };
  const handleSetZones = (nextZones) => {
    dispatch(setZonesAction({ fieldId, zones: nextZones }));
  };
  const handleSetSelectedZoneId = (zoneId) => {
    dispatch(setSelectedZoneIdAction({ fieldId, zoneId }));
  };

  const detailZoneId = selectedZoneId || zones[0]?.id || null;
  const detailZone = zones.find((z) => z.id === detailZoneId) || null;

  const TABS = [
    { id: "dashboard", label: "Farm Zoning Analysis" },
    ...(detailZoneId ? [{ id: "detail", label: "Zone Detail" }] : []),
    { id: "editor", label: "Create / Edit Zones" },
  ];

  if (!selectedFieldDetails) return null;

  return (
    <section className="space-y-4">
      <div className={`${cardClass} p-3`}>
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveView(tab.id)}
              className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                activeView === tab.id
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeView === "dashboard" && (
        <ZoningDashboardView
          zones={zones}
          center={center}
          fieldBoundary={fieldBoundary}
          fieldName={fieldName}
          fieldCropName={selectedFieldDetails?.cropName || null}
          loading={loading.analysis}
          error={null}
          hasGenerated={hasGenerated}
          recommendations={recommendations}
          images={images}
          activeLayer={activeLayer}
          setActiveLayer={handleSetActiveLayer}
          activeNutrient={activeNutrient}
          setActiveNutrient={handleSetActiveNutrient}
          runVraAnalysis={handleRunAnalysis}
          analysisDate={analysisDate}
          setAnalysisDate={handleSetAnalysisDate}
          socStats={socStats}
          socClasses={socClasses}
          rateRows={rateRows}
          textReport={textReport}
          sceneDate={sceneDate}
          cloudCover={cloudCover}
          cropName={crop}
          availableDates={availableDates}
          meanIndices={meanIndices}
          socAreaHa={socAreaHa}
          socAreaAcres={socAreaAcres}
          collection={collection}
          resM={resM}
        />
      )}

      {activeView === "detail" && (
        <ZoneDetailView
          zone={detailZone}
          center={center}
          fieldBoundary={fieldBoundary}
          fieldName={fieldName}
          sceneDate={sceneDate}
          cropName={crop}
          socStats={socStats}
          onBack={() => setActiveView("dashboard")}
        />
      )}

      {activeView === "editor" && (
        <ZoneEditorView
          zones={zones}
          setZones={handleSetZones}
          selectedZoneId={selectedZoneId}
          setSelectedZoneId={handleSetSelectedZoneId}
          fieldBoundary={fieldBoundary}
        />
      )}
    </section>
  );
};

export default ZoningSection;
