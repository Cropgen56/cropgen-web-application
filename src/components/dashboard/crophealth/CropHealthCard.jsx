import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import SoilAnalysisChart from "./SoilAnalysisChart";
import SoilHealthChart from "./SoilHealthChart";
import CropHealthStatusBar from "./CropHealthStatusBar";

import { fetchCrops } from "../../../redux/slices/cropSlice";
import PremiumContentWrapper from "../../subscription/PremiumContentWrapper";
import { useSubscriptionGuard } from "../../subscription/hooks/useSubscriptionGuard";
import FeatureGuard from "../../subscription/FeatureGuard";
import {
  formatDaysUntilSowingLabel,
  isBarrenLandField,
  isFutureSowingDate,
} from "../../../utility/satelliteDateRange";

const ACRE_TO_HECTARE = 0.40468564224;

function isYieldAvailable(value) {
  if (value == null || value === "") return false;
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

const CropHealth = ({
  selectedFieldDetails,
  bypassPremium = false,
  isPreparedForPDF = false,
  aoiId = null,
  pdfSection = "full",
}) => {
  const showHealthYield = pdfSection === "full" || pdfSection === "healthYield";
  const showSoil = pdfSection === "full" || pdfSection === "soilOnly";
  const dispatch = useDispatch();

  const crops = useSelector((state) => state.crops.crops);
  const advisory = useSelector((state) => state.smartAdvisory?.advisory);
  const advisoryLoading = useSelector((state) => state.smartAdvisory?.loading);

  const cropHealthGuard = useSubscriptionGuard({
    field: selectedFieldDetails,
    featureKey: "cropHealthAndYield",
  });

  const fieldData = selectedFieldDetails || advisory?.farmFieldId || {};

  const { sowingDate, cropName, acre = 0 } = fieldData;

  useEffect(() => {
    dispatch(fetchCrops());
  }, [dispatch]);

  const cropInfo = useMemo(() => {
    if (!cropName || !crops?.length) return null;

    return crops.find(
      (c) =>
        c.cropName?.toLowerCase().trim() === cropName?.toLowerCase().trim(),
    );
  }, [cropName, crops]);

  const cropAgeLabel = useMemo(() => {
    const growth = advisory?.plantGrowthActivity;
    const barren =
      isBarrenLandField(fieldData) || growth?.farmStatus === "barren";

    if (barren) {
      if (growth?.daysUntilSowing != null) {
        return formatDaysUntilSowingLabel(growth.daysUntilSowing);
      }
      if (isFutureSowingDate(sowingDate)) {
        const sowing = new Date(sowingDate);
        const today = new Date();
        sowing.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const days = Math.ceil((sowing - today) / 86400000);
        return formatDaysUntilSowingLabel(days);
      }
      return "Pre-sowing";
    }

    const fromAdvisory = growth?.cropAgeDays;
    if (fromAdvisory != null && Number.isFinite(Number(fromAdvisory))) {
      return `${Math.max(0, Number(fromAdvisory))} days`;
    }
    if (!sowingDate) return "-";
    const start = new Date(sowingDate);
    const today = new Date();
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return `${Math.max(0, Math.floor((today - start) / 86400000))} days`;
  }, [
    advisory?.plantGrowthActivity,
    fieldData,
    sowingDate,
  ]);

  const totalAreaHectare = useMemo(() => {
    return (Number(acre) * ACRE_TO_HECTARE).toFixed(2);
  }, [acre]);

  const yieldData = useMemo(() => {
    if (!advisory?.yield) return null;

    return {
      standard: advisory.yield.standardYield,
      ai: advisory.yield.aiYield,
      unit: advisory.yield.unit || "tons",
    };
  }, [advisory]);

  const showStandardYield =
    !advisoryLoading && isYieldAvailable(yieldData?.standard);
  const showAiYield = !advisoryLoading && isYieldAvailable(yieldData?.ai);

  const premiumSection = (
    <div className="flex flex-col lg:flex-row gap-8">
      <SoilAnalysisChart isPreparedForPDF={isPreparedForPDF} />
      <SoilHealthChart isPreparedForPDF={isPreparedForPDF} aoiId={aoiId} />
    </div>
  );

  return (
    <div className="p-2 sm:p-4">
      {showHealthYield && (
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow border">
          <h2 className="text-lg sm:text-xl font-bold text-ember-sidebar mb-4">
            Crop Health
          </h2>

          <div
            className={`flex flex-col sm:flex-row gap-4 sm:gap-6 ${isPreparedForPDF ? "min-w-0" : ""}`}
          >
            <div
              className={`w-full sm:w-[160px] h-[140px] sm:h-[160px] border rounded-xl p-2 flex-shrink-0 ${
                isPreparedForPDF ? "min-w-[160px]" : ""
              }`}
            >
              <img
                src={
                  cropInfo?.cropImage ||
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Crect fill='%23e5e7eb' width='160' height='160'/%3E%3C/svg%3E"
                }
                alt={cropName || "crop"}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Crect fill='%23e5e7eb' width='160' height='160'/%3E%3C/svg%3E";
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-12 gap-y-3 text-sm">
              <Info
                label="Crop"
                value={cropInfo?.cropName || cropName || "-"}
              />

              <Info
                label={
                  isBarrenLandField(fieldData) ||
                  advisory?.plantGrowthActivity?.farmStatus === "barren"
                    ? "Sowing in"
                    : "Crop Age"
                }
                value={cropAgeLabel}
              />

              <Info label="Area" value={`${totalAreaHectare} Ha`} />

              {showStandardYield && (
                <Info
                  label="Standard Yield"
                  value={`${yieldData.standard} ${yieldData.unit} ( Total )`}
                />
              )}

              {showAiYield && (
                <Info
                  label="AI Yield"
                  value={`${yieldData.ai} ${yieldData.unit}`}
                />
              )}
            </div>
          </div>

          <CropHealthStatusBar />
        </div>
      )}

      {showSoil && (
        <div
          className={`bg-white rounded-2xl shadow border ${showHealthYield ? "mt-6" : ""}`}
        >
          <div className="px-5 py-3 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold text-ember-sidebar">
              Advanced Soil Analytics
            </h2>
            {!bypassPremium && !cropHealthGuard.hasFeatureAccess && (
              <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Premium
              </span>
            )}
          </div>

          <div className="p-4">
            {bypassPremium ? (
              premiumSection
            ) : (
              <FeatureGuard guard={cropHealthGuard} title="Advanced Soil Analytics">
                <PremiumContentWrapper
                  isLocked={!cropHealthGuard.hasFeatureAccess}
                  onSubscribe={cropHealthGuard.handleSubscribe}
                  title="Advanced Soil Analytics"
                >
                  {premiumSection}
                </PremiumContentWrapper>
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
