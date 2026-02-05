import React, { useMemo, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import FarmReportMap from "./FarmReportMap";
import CropHealth from "../../dashboard/crophealth/CropHealthCard";
import ForeCast from "../../dashboard/forecast/ForeCast";
import PlantGrowthActivity from "../../dashboard/PlantGrowthActivity";
import Insights from "../../dashboard/insights/Insights";
import NdviGraph from "../../dashboard/satellite-index/VegetationIndex";
import WaterIndex from "../../dashboard/satellite-index/WaterIndex";
import EvapotranspirationDashboard from "../../dashboard/satellite-index/ETChart";

import { useAoiManagement } from "../../dashboard/hooks/useAoiManagement";
import { useWeatherForecast } from "../../dashboard/hooks/useWeatherForecast";

import { fetchSmartAdvisory } from "../../../redux/slices/smartAdvisorySlice";

/* ---------------- constants (same as Dashboard) ---------------- */

const POLL_INTERVAL = 5000; // 5 sec
const MAX_POLL_ATTEMPTS = 12; // 1 min

/* ---------------- Skeleton ---------------- */

const MapLoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="relative w-full h-[230px] rounded-lg bg-[#5a7c6b] animate-pulse"
      />
    ))}
  </div>
);

/* ---------------- Component ---------------- */

const FarmReportContent = ({
  selectedFieldDetails,
  fields,
  mapRef,
  isFieldDataReady,
  isPreparedForPDF,
  featureAccess,
  onSubscribe,
}) => {
  const dispatch = useDispatch();

  /* ===== SAME HOOKS AS DASHBOARD ===== */
  const { aoiId } = useAoiManagement(selectedFieldDetails);
  const { forecast, units } = useWeatherForecast(aoiId);

  /* ===== ADVISORY STATE ===== */
  const advisoryState = useSelector((s) => s.smartAdvisory);

  const pollRef = useRef(null);
  const pollCountRef = useRef(0);

  /* ===== FETCH ADVISORY (same as Dashboard) ===== */
  const fetchAdvisory = useCallback(() => {
    if (!selectedFieldDetails?._id) return;

    dispatch(
      fetchSmartAdvisory({
        fieldId: selectedFieldDetails._id,
      }),
    );
  }, [dispatch, selectedFieldDetails]);

  /* ===== INITIAL FETCH ===== */
  useEffect(() => {
    fetchAdvisory();
  }, [fetchAdvisory]);

  /* ===== POLLING LOGIC ===== */
  useEffect(() => {
    if (!selectedFieldDetails?._id) return;

    if (advisoryState?.exists) {
      clearInterval(pollRef.current);
      pollRef.current = null;
      pollCountRef.current = 0;
      return;
    }

    if (!pollRef.current) {
      pollRef.current = setInterval(() => {
        pollCountRef.current += 1;
        fetchAdvisory();

        if (pollCountRef.current >= MAX_POLL_ATTEMPTS) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }, POLL_INTERVAL);
    }

    return () => {
      clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [advisoryState?.exists, fetchAdvisory, selectedFieldDetails]);

  /* ===== FEATURE FLAGS ===== */
  const {
    hasCropHealthAndYield,
    hasWeatherAnalytics,
    hasVegetationIndices,
    hasWaterIndices,
    hasEvapotranspiration,
    hasAgronomicInsights,
    hasCropGrowthMonitoring,
  } = featureAccess || {};

  return (
    <>
      {/* ================= SECTION 0 : MAP + CROP HEALTH ================= */}
      <div className="bg-[#2d4339] rounded-lg p-2 mb-2">
        <FarmReportMap
          key={selectedFieldDetails?._id}
          selectedFieldsDetials={[selectedFieldDetails]}
          ref={mapRef}
          hidePolygonForPDF={isPreparedForPDF}
        />
        {/* {isFieldDataReady ? (
        ) : (
          <MapLoadingSkeleton />
        )} */}

        <div className="mt-2">
          <CropHealth
            selectedFieldsDetials={[selectedFieldDetails]}
            fields={fields}
            onSubscribe={onSubscribe}
            hasCropHealthAndYield={hasCropHealthAndYield}
          />
        </div>
      </div>

      {/* ================= SECTION 1 : WEATHER + INDICES ================= */}
      <div className="bg-[#2d4339] rounded-lg p-2 mb-2">
        <ForeCast
          hasWeatherAnalytics={hasWeatherAnalytics}
          onSubscribe={onSubscribe}
        />

        <div className="mt-2">
          <NdviGraph
            selectedFieldsDetials={[selectedFieldDetails]}
            onSubscribe={onSubscribe}
            hasVegetationIndices={hasVegetationIndices}
          />
        </div>

        <div className="mt-2">
          <WaterIndex
            selectedFieldsDetials={[selectedFieldDetails]}
            onSubscribe={onSubscribe}
            hasWaterIndices={hasWaterIndices}
          />
        </div>

        <div className="mt-2">
          <EvapotranspirationDashboard
            forecast={forecast}
            units={units}
            onSubscribe={onSubscribe}
            hasEvapotranspiration={hasEvapotranspiration}
          />
        </div>
      </div>

      {/* ================= SECTION 2 : INSIGHTS ================= */}
      <div className="bg-[#2d4339] rounded-lg p-2">
        <Insights
          onSubscribe={onSubscribe}
          hasAgronomicInsights={hasAgronomicInsights}
        />

        <div className="mt-2">
          <PlantGrowthActivity
            selectedFieldsDetials={[selectedFieldDetails]}
            onSubscribe={onSubscribe}
            hasCropGrowthMonitoring={hasCropGrowthMonitoring}
          />
        </div>
      </div>
    </>
  );
};

export default FarmReportContent;
