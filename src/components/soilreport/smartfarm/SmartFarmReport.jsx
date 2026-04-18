import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import {
  fetchSatelliteDates,
  fetchIndexDataForMap,
  clearIndexDataByType,
} from "../../../redux/slices/satelliteSlice";
import ReportHeader from "./ReportHeader";
import FarmerDetails from "./FarmerDetails";
import FieldDetails from "./FieldDetails";
import GISGeometryCard from "./GISGeometryCard";
import SatelliteAnalysis from "./SatelliteAnalysis";
import SoilHealthSummary from "./SoilHealthSummary";
import AIInsights from "./AIInsights";
import RiskDetection from "./RiskDetection";
import Recommendations from "./Recommendations";
import YieldPrediction from "./YieldPrediction";
import MapPreview from "./MapPreview";
import { REPORT_SATELLITE_INDICES } from "./constants";
import {
  fieldToLngLatRing,
  satelliteDatesToOptions,
  pickLowCloudIsoDate,
  dominantLegendSummary,
  toISODateString,
} from "./utils";
import { generateFarmIntelligenceAi } from "./generateFarmIntelligenceAi";
import {
  ReportBuildProgress,
  SmartFarmReportEmptyState,
} from "./ReportWorkspace";

function buildIndexRows(indexDataByType) {
  return REPORT_SATELLITE_INDICES.map((code) => {
    const data = indexDataByType?.[code];
    const summary = dominantLegendSummary(data?.legend);
    return {
      code,
      value: summary.value,
      status: summary.status,
      meaning: summary.meaning,
    };
  });
}

export default function SmartFarmReport({
  reportData,
  selectedField,
  user,
  reportRef,
  onDownloadPdf,
  isDownloading,
}) {
  const dispatch = useDispatch();
  const store = useStore();
  const { satelliteDates, indexDataByType, loading } = useSelector(
    (s) => s.satellite,
  );
  const { userProfile, userDetails } = useSelector((s) => s.auth);

  const field = reportData?.field;
  const [analysisDate, setAnalysisDate] = useState("");
  const [insights, setInsights] = useState(null);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const pipelineKeyRef = useRef(null);
  const [isDesktopLayout, setIsDesktopLayout] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktopLayout(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const ring = useMemo(() => fieldToLngLatRing(field?.field), [field]);

  const { userName, userEmail, userPhone } = useMemo(() => {
    const first =
      userProfile?.firstName || userDetails?.firstName || user?.firstName || "";
    const last =
      userProfile?.lastName || userDetails?.lastName || user?.lastName || "";
    const fromParts = `${first} ${last}`.trim();
    return {
      userName: user?.name || user?.fullName || fromParts,
      userEmail:
        userProfile?.email || userDetails?.email || user?.email || "",
      userPhone:
        userProfile?.phone || userDetails?.phone || user?.phone || "",
    };
  }, [user, userProfile, userDetails]);

  useEffect(() => {
    if (!field?._id || ring.length < 3) return;
    dispatch(clearIndexDataByType());
    setAnalysisDate("");
    setInsights(null);
    pipelineKeyRef.current = null;
    dispatch(fetchSatelliteDates({ geometry: ring }));
  }, [field?._id, dispatch, ring]);

  const datesIdle = !loading.satelliteDates;
  const hasDateItems = (satelliteDates?.items?.length ?? 0) > 0;

  const satelliteSignature = useMemo(() => {
    const items = satelliteDates?.items || [];
    if (!items.length) return "";
    return items
      .map((i) => `${toISODateString(i.date)}:${i.cloud_cover ?? 0}`)
      .join("|");
  }, [satelliteDates]);

  useEffect(() => {
    if (!field?._id || ring.length < 3 || !datesIdle || !hasDateItems) return;

    const options = satelliteDatesToOptions(satelliteDates);
    if (!options.length) return;

    const iso = pickLowCloudIsoDate(options);
    if (!iso) return;

    const farmerKey = `${userName}|${userEmail}|${userPhone}`;
    const runKey = `${field._id}-${iso}-${farmerKey}`;
    if (pipelineKeyRef.current === runKey) return;
    pipelineKeyRef.current = runKey;

    setAnalysisDate(iso);
    let cancelled = false;

    (async () => {
      setPipelineLoading(true);
      setInsights(null);
      dispatch(clearIndexDataByType());

      await Promise.allSettled(
        REPORT_SATELLITE_INDICES.map((index) =>
          dispatch(
            fetchIndexDataForMap({
              endDate: iso,
              geometry: [ring],
              index,
            }),
          ).unwrap(),
        ),
      );

      if (cancelled) return;

      const latest = store.getState().satellite.indexDataByType;
      const rows = buildIndexRows(latest);

      const farmerName = userName || userEmail || "Farmer";
      const ai = await generateFarmIntelligenceAi({
        fieldName: field.fieldName || field.farmName,
        farmerName,
        indexRows: rows,
        acre: field.acre,
        cropName: field.cropName,
      });

      if (!cancelled) {
        setInsights(ai);
        setPipelineLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      setPipelineLoading(false);
    };
  }, [
    field?._id,
    field?.fieldName,
    field?.farmName,
    field?.acre,
    field?.cropName,
    ring,
    dispatch,
    store,
    datesIdle,
    hasDateItems,
    satelliteSignature,
    userName,
    userEmail,
    userPhone,
  ]);

  const indexRows = useMemo(
    () => buildIndexRows(indexDataByType),
    [indexDataByType],
  );

  const satelliteTableRows = useMemo(() => {
    const ai = insights?.indexMeanings;
    if (!ai || typeof ai !== "object") return indexRows;
    return indexRows.map((r) => {
      const m = ai[r.code];
      return typeof m === "string" && m.trim()
        ? { ...r, meaning: m.trim() }
        : r;
    });
  }, [indexRows, insights?.indexMeanings]);

  const handlePrint = useCallback(() => window.print(), []);

  const healthScore = useMemo(() => {
    const favorable = indexRows.filter((r) => r.status === "Favorable").length;
    const attention = indexRows.filter((r) => r.status === "Attention").length;
    const base = 55 + favorable * 6 - attention * 5;
    return Math.max(38, Math.min(96, Math.round(base)));
  }, [indexRows]);

  const ndmiRow = indexRows.find((r) => r.code === "NDMI");
  const smiRow = indexRows.find((r) => r.code === "SMI");
  const nRow = indexRows.find((r) => r.code === "NITROGEN");
  const socRow = indexRows.find((r) => r.code === "SOC");

  const indicesTotal = REPORT_SATELLITE_INDICES.length;
  const indicesLoadedCount = useMemo(
    () =>
      REPORT_SATELLITE_INDICES.filter((code) => {
        const d = indexDataByType?.[code];
        return (
          d?.legend &&
          Array.isArray(d.legend) &&
          d.legend.length > 0
        );
      }).length,
    [indexDataByType],
  );

  const anyIndexLoading = useMemo(
    () =>
      REPORT_SATELLITE_INDICES.some(
        (code) => loading.indexDataByType?.[code] === true,
      ),
    [loading.indexDataByType],
  );

  if (!field) {
    return (
      <SmartFarmReportEmptyState
        selectedField={selectedField}
        isDesktop={isDesktopLayout}
      />
    );
  }

  const reportBuildComplete = Boolean(insights) && !pipelineLoading;
  const showBuildProgress = field && !reportBuildComplete;
  const aiRunning =
    pipelineLoading &&
    !insights &&
    !anyIndexLoading &&
    Boolean(analysisDate);

  const fieldLabel = field.fieldName || field.farmName || "Selected field";

  return (
    <div ref={reportRef} className="cropgen-smart-report print:bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5 pb-16">
        <ReportHeader
          generatedAt={reportData?.generatedAt}
          onDownloadPdf={onDownloadPdf}
          onPrint={handlePrint}
          isDownloading={isDownloading}
        />

        {showBuildProgress ? (
          <ReportBuildProgress
            fieldLabel={fieldLabel}
            ringOk={ring.length >= 3}
            loadingSatelliteDates={loading.satelliteDates}
            datesReady={hasDateItems}
            analysisDate={analysisDate}
            indicesLoadedCount={indicesLoadedCount}
            indicesTotal={indicesTotal}
            anyIndexLoading={anyIndexLoading}
            aiRunning={aiRunning}
            isComplete={reportBuildComplete}
          />
        ) : null}

        {reportBuildComplete ? (
          <>
            <FarmerDetails
              name={userName || "—"}
              email={userEmail || "—"}
              phone={userPhone || "—"}
            />

            <FieldDetails field={field} />
            <GISGeometryCard field={field} />

            <SatelliteAnalysis
              rows={satelliteTableRows}
              analysisDate={analysisDate}
            />

            <SoilHealthSummary
              healthScore={healthScore}
              nitrogenLabel={
                nRow?.status === "Attention" ? "Low / variable" : "Within range"
              }
              fertilityLabel={
                socRow?.status === "Favorable"
                  ? "Strong signal"
                  : "Monitor / sample"
              }
              moistureLabel={
                [ndmiRow?.status, smiRow?.status].includes("Attention")
                  ? "Elevated stress risk"
                  : "Adequate"
              }
            />

            <AIInsights
              healthSummary={insights?.healthSummary}
              soilCondition={insights?.soilCondition}
              farmPerformance={insights?.farmPerformance}
            />

            <RiskDetection risks={insights?.risks} />

            <Recommendations
              fertilizer={insights?.recommendations?.fertilizer}
              irrigation={insights?.recommendations?.irrigation}
              soil={insights?.recommendations?.soil}
            />

            <YieldPrediction
              productivityPercent={insights?.productivityPercent}
              futurePrediction={insights?.futurePrediction}
            />

            <MapPreview
              field={field}
              ndviLayer={indexDataByType?.NDVI}
              analysisDate={analysisDate}
            />

            <footer className="rounded-[12px] bg-[#0D6B45] text-white px-6 py-5 shadow-lg">
              <p className="text-sm font-medium leading-relaxed text-center">
                {insights?.diagnosis ||
                  "Overall farm health is stable with moderate variability across satellite indices; validate with field scouting and lab sampling."}
              </p>
              <p className="text-[10px] text-white/70 text-center mt-3 uppercase tracking-widest">
                CropGen · Confidential farm intelligence
              </p>
            </footer>
          </>
        ) : null}
      </div>
    </div>
  );
}
