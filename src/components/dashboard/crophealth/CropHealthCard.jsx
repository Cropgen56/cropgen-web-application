import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import SoilAnalysisChart from "./SoilAnalysisChart";
import SoilHealthChart from "./SoilHealthChart";
import CropHealthStatusBar from "./CropHealthStatusBar";

import { fetchCrops } from "../../../redux/slices/cropSlice";
import PremiumContentWrapper from "../../subscription/PremiumContentWrapper";
import { useSubscriptionGuard } from "../../subscription/hooks/useSubscriptionGuard";
import FeatureGuard from "../../subscription/FeatureGuard";

const ACRE_TO_HECTARE = 0.40468564224;

const CropHealth = ({
  selectedFieldDetails,
  bypassPremium = false,
  isPreparedForPDF = false,
  aoiId = null,
}) => {
  const dispatch = useDispatch();

  /* ================= REDUX ================= */

  const crops = useSelector((state) => state.crops.crops);
  const advisory = useSelector((state) => state.smartAdvisory?.advisory);
  const advisoryLoading = useSelector((state) => state.smartAdvisory?.loading);
  /* ================= SUBSCRIPTION ================= */

  const cropHealthGuard = useSubscriptionGuard({
    field: selectedFieldDetails,
    featureKey: "cropHealthAndYield",
  });

  /* ================= FIELD DATA ================= */

  const fieldData = selectedFieldDetails || advisory?.farmFieldId || {};

  const { sowingDate, cropName, acre = 0 } = fieldData;

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
      unit: advisory.yield.unit,
    };
  }, [advisory]);

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

      <div className="bg-white rounded-2xl p-3 sm:p-4 shadow border">
        <h2 className="text-lg sm:text-xl font-bold text-[#344E41] mb-4">Crop Health</h2>

        <div className={`flex flex-col sm:flex-row gap-4 sm:gap-6 ${isPreparedForPDF ? "min-w-0" : ""}`}>
          {/* CROP IMAGE */}

          <div
            className={`w-full sm:w-[160px] h-[140px] sm:h-[160px] border rounded-xl p-2 flex-shrink-0 ${
              isPreparedForPDF ? "min-w-[160px]" : ""
            }`}
          >
            <img
              src={cropInfo?.cropImage || "https://via.placeholder.com/160"}
              alt="crop"
              className="w-full h-full object-contain"
            />
          </div>

          {/* INFO GRID */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-12 gap-y-3 text-sm">
            <Info
              label="Crop"
              value={cropInfo?.cropName || cropName || "-"}
            />

            <Info
              label="Crop Age"
              value={sowingDate ? `${daysFromSowing} days` : "-"}
            />

            <Info label="Area" value={`${totalAreaHectare} Ha`} />

            <Info
              label="Standard Yield"
              value={
                advisoryLoading
                  ? "Loading..."
                  : yieldData
                    ? `${yieldData.standard} ${yieldData.unit} ( Total )`
                    : "-"
              }
            />

            <Info
              label="AI Yield"
              value={
                advisoryLoading
                  ? "Loading..."
                  : yieldData
                    ? `${yieldData.ai} ${yieldData.unit}`
                    : "-"
              }
            />
          </div>
        </div>

        {/* STATUS BAR */}

        <CropHealthStatusBar selectedFieldsDetials={[fieldData]} />
      </div>

      {/* ========= PREMIUM SECTION ========= */}

      <div className="mt-6 bg-white rounded-2xl shadow border">
        {/* Always-visible section header */}
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#344E41]">
            Advanced Soil Analytics
          </h2>
          {!bypassPremium && !cropHealthGuard.hasFeatureAccess && (
            <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Premium
            </span>
          )}
        </div>

        {/* Content — blurred when locked, shown normally when accessible */}
        <div className="p-4">
          {bypassPremium ? (
            premiumSection
          ) : (
            <FeatureGuard
              guard={cropHealthGuard}
              title="Advanced Soil Analytics"
            >
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
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="flex gap-2">
    <span className="font-semibold text-[#344E41]">{label}:</span>
    <span className="font-semibold text-[#000000]">{value ?? "-"}</span>
  </div>
);

export default CropHealth;
