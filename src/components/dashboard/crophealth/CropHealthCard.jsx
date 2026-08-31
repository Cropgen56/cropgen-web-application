import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import SoilAnalysisChart from "./SoilAnalysisChart";
import SoilHealthChart from "./SoilHealthChart";
import CropHealthStatusBar from "./CropHealthStatusBar";

import { fetchCrops } from "../../../redux/slices/cropSlice";
import { selectAdvisoryCrop } from "../../../redux/slices/smartAdvisorySlice";
import PremiumContentWrapper from "../../subscription/PremiumContentWrapper";
import { useSubscriptionGuard } from "../../subscription/hooks/useSubscriptionGuard";
import FeatureGuard from "../../subscription/FeatureGuard";

const ACRE_TO_HECTARE = 0.40468564224;

function isYieldAvailable(value) {
  if (value == null || value === "") return false;
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

const CROP_IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Crect fill='%23e5e7eb' width='160' height='160'/%3E%3C/svg%3E";

const CropHealth = ({
  selectedFieldDetails,
  bypassPremium = false,
  isPreparedForPDF = false,
  aoiId = null,
  isGenerating = false,
  /** PDF: show only health/yield, only soil, or full (default) */
  pdfSection = "full",
}) => {
  const showHealthYield = pdfSection === "full" || pdfSection === "healthYield";
  const showSoil = pdfSection === "full" || pdfSection === "soilOnly";
  const dispatch = useDispatch();

  /* ================= REDUX ================= */

  const crops = useSelector((state) => state.crops.crops);
  const advisory = useSelector((state) => state.smartAdvisory?.advisory);
  const selectedCropId = useSelector((state) => state.smartAdvisory?.selectedCropId);
  const advisoryLoading = useSelector((state) => state.smartAdvisory?.loading);
  /* ================= SUBSCRIPTION ================= */

  // Some stored crop photos (e.g. certain S3 assets) fail to load — no
  // Access-Control-Allow-Origin header, so the browser refuses the request
  // entirely. Rather than leave a blank box (both live and baked into the
  // PDF export), fall back to the same placeholder used when there's no
  // photo at all.
  const [cropImageFailed, setCropImageFailed] = useState(false);

  const cropHealthGuard = useSubscriptionGuard({
    field: selectedFieldDetails,
    featureKey: "cropHealthAndYield",
  });

  const soilGuard = useSubscriptionGuard({
    field: selectedFieldDetails,
    featureKey: "soilAnalysisAndHealth",
  });

  /* ================= FIELD DATA ================= */

  const fieldData = selectedFieldDetails || advisory?.farmFieldId || {};

  // Multi-crop: this farm's active crop instances (from FarmField.crops,
  // attached by the backend) — lets the farmer switch which crop's advisory
  // is shown below, instead of always seeing just the farm's legacy crop.
  const activeCrops = useMemo(
    () => (Array.isArray(fieldData.crops) ? fieldData.crops.filter((c) => c.isActive) : []),
    [fieldData.crops],
  );

  const selectedCropInstance = advisory?.cropInstanceId;

  const sowingDate = selectedCropInstance?.startDate || fieldData.sowingDate;
  const cropName = selectedCropInstance?.cropName || fieldData.cropName;
  const cropVariety = selectedCropInstance?.variety || fieldData.variety;
  const { acre = 0 } = fieldData;

  /* ================= FETCH CROPS ================= */

  useEffect(() => {
    dispatch(fetchCrops());
  }, [dispatch]);

  /* ================= CROP INFO ================= */

  const cropInfo = useMemo(() => {
    if (!cropName || !crops?.length) return null;

    return crops.find(
      (c) =>
        c.cropName?.toLowerCase().trim() === cropName?.toLowerCase().trim(),
    );
  }, [cropName, crops]);

  // Give a new photo URL a fresh chance to load (e.g. switching crops/fields).
  useEffect(() => {
    setCropImageFailed(false);
  }, [cropInfo?.cropImage]);

  /* ================= DAYS FROM SOWING ================= */

  const daysFromSowing = useMemo(() => {
    if (!sowingDate) return 0;

    const start = new Date(sowingDate);
    const today = new Date();

    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return Math.max(0, Math.floor((today - start) / 86400000));
  }, [sowingDate]);

  /* ================= AREA ================= */

  const totalAreaHectare = useMemo(() => {
    return (Number(acre) * ACRE_TO_HECTARE).toFixed(2);
  }, [acre]);

  /* ================= YIELD ================= */

  const yieldData = useMemo(() => {
    if (!advisory?.yield) return null;

    return {
      standard: advisory.yield.standardYield,
      ai: advisory.yield.aiYield,
      unit: advisory.yield.unit || "tons",
    };
  }, [advisory]);

  const showYieldData =
    bypassPremium || cropHealthGuard.hasFeatureAccess;
  const showSoilData = bypassPremium || soilGuard.hasFeatureAccess;

  /* ================= PREMIUM SECTION ================= */

  const premiumSection = (
    <div className="flex flex-col lg:flex-row gap-8">
      <SoilAnalysisChart
        selectedFieldsDetials={[fieldData]}
        isPreparedForPDF={isPreparedForPDF}
      />
      <SoilHealthChart isPreparedForPDF={isPreparedForPDF} aoiId={aoiId} />
    </div>
  );

  /* ================= UI ================= */

  return (
    <div className="p-2 sm:p-4">
      {/* ========= BASIC INFO ========= */}

      {showHealthYield && (
      <div className="bg-white rounded-2xl p-3 sm:p-4 shadow border">
        <h2 className="text-lg sm:text-xl font-bold text-ember-sidebar mb-2">Crop Health</h2>

        {/* Multi-crop: switch which of this farm's active crops is shown below. */}
        {!isPreparedForPDF && activeCrops.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {activeCrops.map((crop) => {
              const isSelected = String(crop._id) === String(selectedCropId);
              return (
                <button
                  key={crop._id}
                  type="button"
                  onClick={() => dispatch(selectAdvisoryCrop(crop._id))}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                    isSelected
                      ? "bg-ember-sidebar text-white border-ember-sidebar"
                      : "bg-white text-ember-sidebar border-ember-sidebar/30 hover:bg-ember-sidebar/5"
                  }`}
                >
                  {crop.cropName}
                </button>
              );
            })}
          </div>
        )}

        <div className={`flex flex-col sm:flex-row gap-4 sm:gap-6 ${isPreparedForPDF ? "min-w-0" : ""}`}>
          {/* CROP IMAGE */}

          <div
            className={`w-full sm:w-[160px] h-[140px] sm:h-[160px] border rounded-xl p-2 flex-shrink-0 ${
              isPreparedForPDF ? "min-w-[160px]" : ""
            }`}
          >
            <img
              src={
                cropImageFailed || !cropInfo?.cropImage
                  ? CROP_IMAGE_PLACEHOLDER
                  : cropInfo.cropImage
              }
              onError={() => setCropImageFailed(true)}
              alt="crop"
              className="w-full h-full object-contain"
            />
          </div>

          {/* INFO GRID */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-12 gap-y-3 text-sm">
            <Info
              label="Crop"
              value={
                cropName
                  ? `${cropInfo?.cropName || cropName}${cropVariety ? ` (${cropVariety})` : ""}`
                  : "-"
              }
            />

            <Info
              label="Crop Age"
              value={sowingDate ? `${daysFromSowing} days` : "-"}
            />

            <Info label="Area" value={`${totalAreaHectare} Ha`} />

            {showYieldData &&
              !advisoryLoading &&
              isYieldAvailable(yieldData?.standard) && (
              <Info
                label="Standard Yield"
                value={`${yieldData.standard} ${yieldData.unit} ( Total )`}
              />
            )}

            {showYieldData &&
              !advisoryLoading &&
              isYieldAvailable(yieldData?.ai) && (
              <Info
                label="AI Yield"
                value={`${yieldData.ai} ${yieldData.unit}`}
              />
            )}
          </div>
        </div>

        {showYieldData ? (
          <div className="mt-4">
            {isGenerating && !advisory?.cropHealth ? (
              <p className="text-sm text-ember-sidebar/70">
                Generating farm advisory…
              </p>
            ) : (
              <CropHealthStatusBar selectedFieldsDetials={[fieldData]} />
            )}
          </div>
        ) : (
          <div className="mt-4">
            <FeatureGuard guard={cropHealthGuard} title="Crop Health & Yield">
              <PremiumContentWrapper
                isLocked
                onSubscribe={cropHealthGuard.handleSubscribe}
                title="Crop Health & Yield"
                minHeight={140}
              />
            </FeatureGuard>
          </div>
        )}
      </div>
      )}

      {/* ========= SOIL ANALYTICS (plan feature) ========= */}

      {showSoil && (
      <div className={`bg-white rounded-2xl shadow border ${showHealthYield ? "mt-6" : ""}`}>
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-ember-sidebar">
            Advanced Soil Analytics
          </h2>
          {!showSoilData && (
            <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Premium
            </span>
          )}
        </div>

        <div className="p-4">
          {showSoilData ? (
            premiumSection
          ) : (
            <FeatureGuard
              guard={soilGuard}
              title="Soil Analysis & Health"
            >
              <PremiumContentWrapper
                isLocked
                onSubscribe={soilGuard.handleSubscribe}
                title="Soil Analysis & Health"
              />
            </FeatureGuard>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="flex gap-2">
    <span className="font-semibold text-ember-sidebar">{label}:</span>
    <span className="font-semibold text-[#000000]">{value ?? "-"}</span>
  </div>
);

export default CropHealth;
