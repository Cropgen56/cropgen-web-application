import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as turf from "@turf/turf";

import SoilAnalysisChart from "./SoilAnalysisChart";
import SoilHealthChart from "./SoilHealthChart";
import CropHealthStatusBar from "./CropHealthStatusBar";

import { fetchCrops } from "../../../redux/slices/cropSlice";
import PremiumContentWrapper from "../../subscription/PremiumContentWrapper";
import { useSubscriptionGuard } from "../../subscription/hooks/useSubscriptionGuard";
import FeatureGuard from "../../subscription/FeatureGuard";

const CropHealth = ({ selectedFieldDetails }) => {
  const dispatch = useDispatch();

  /* ================= SUBSCRIPTION (COMPONENT LEVEL) ================= */
  const cropHealthGuard = useSubscriptionGuard({
    field: selectedFieldDetails,
    featureKey: "cropHealthAndYield",
  });

  /* ================= FIELD DATA ================= */
  const {
    sowingDate,
    field: coordinates = [],
    cropName,
  } = selectedFieldDetails || {};

  /* ================= REDUX ================= */
  const crops = useSelector((state) => state.crops.crops);
  const advisory = useSelector((state) => state.smartAdvisory.advisory);
  const advisoryLoading = useSelector((state) => state.smartAdvisory.loading);

  /* ================= FETCH CROPS (ONCE) ================= */
  useEffect(() => {
    dispatch(fetchCrops());
  }, [dispatch]);

  /* ================= CROP INFO ================= */
  const cropInfo = useMemo(() => {
    if (!cropName || !crops?.length) return null;
    return crops.find(
      (c) => c.cropName.toLowerCase() === cropName.toLowerCase(),
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

  /* ================= AREA (HECTARES) ================= */
  const totalArea = useMemo(() => {
    if (coordinates.length < 3) return 0;
    const coords = coordinates.map((p) => [p.lng, p.lat]);
    coords.push(coords[0]);
    return turf.area(turf.polygon([coords])) / 10000;
  }, [coordinates]);

  /* ================= YIELD ================= */
  const yieldData = useMemo(() => {
    if (!advisory?.yield) return null;
    return {
      standard: advisory.yield.standardYield ?? "N/A",
      ai: advisory.yield.aiYield ?? "N/A",
      unit: advisory.yield.unit ?? "",
    };
  }, [advisory]);

  /* ================= RENDER ================= */

  return (
    <div className="p-2">
      {/* ========= FREE SECTION ========= */}
      <div className="bg-white rounded-2xl p-4 shadow border">
        <h2 className="text-xl font-bold text-[#344E41] mb-4">Crop Health</h2>

        <div className="flex gap-6">
          <div className="w-[160px] h-[160px] border rounded-xl p-2">
            <img
              src={cropInfo?.cropImage || "https://via.placeholder.com/160"}
              alt="crop"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm">
            <Info label="Crop" value={cropInfo?.cropName || cropName} />
            <Info label="Crop Age" value={`${daysFromSowing} days`} />
            <Info label="Area" value={`${totalArea.toFixed(2)} Ha`} />
            <Info
              label="Standard Yield"
              value={
                advisoryLoading
                  ? "Loading..."
                  : `${yieldData?.standard} ${yieldData?.unit}`
              }
            />
            <Info
              label="AI Yield"
              value={
                advisoryLoading
                  ? "Loading..."
                  : `${yieldData?.ai} ${yieldData?.unit}`
              }
            />
          </div>
        </div>

        <CropHealthStatusBar selectedFieldsDetials={[selectedFieldDetails]} />
      </div>

      {/* ========= PREMIUM SECTION ========= */}
      <FeatureGuard guard={cropHealthGuard} title="Advanced Soil Analytics">
        <PremiumContentWrapper
          isLocked={!cropHealthGuard.hasFeatureAccess}
          onSubscribe={cropHealthGuard.handleSubscribe}
          title="Advanced Soil Analytics"
        >
          <div className="flex flex-col lg:flex-row gap-8 mt-6 bg-white p-6 rounded-2xl border shadow-sm">
            <SoilAnalysisChart selectedFieldsDetials={[selectedFieldDetails]} />
            <SoilHealthChart selectedFieldsDetials={[selectedFieldDetails]} />
          </div>
        </PremiumContentWrapper>
      </FeatureGuard>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="flex gap-2">
    <span className="font-semibold text-[#344E41]">{label}:</span>
    <span>{value ?? "N/A"}</span>
  </div>
);

export default CropHealth;
