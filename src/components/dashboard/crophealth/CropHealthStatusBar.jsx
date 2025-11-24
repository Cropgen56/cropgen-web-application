import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";

const getHealthColor = (percentage) => {
  if (percentage >= 75) return "#22C55E";
  if (percentage >= 50) return "#FCC21B";
  if (percentage >= 25) return "#F59E0B";
  return "#EF4444";
};

const getHealthBgColorClass = (percentage) => {
  if (percentage >= 75) return "bg-green-100 text-green-700";
  if (percentage >= 50) return "bg-yellow-100 text-yellow-700";
  if (percentage >= 25) return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-700";
};

const CropHealthStatusBar = ({ selectedFieldsDetials }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Grouped selectors to reduce re-renders
  const { cropHealthYield, healthYieldLoading } = useSelector(
    (s) => s.crops || {}
  );
  const satellite = useSelector((s) => s.satellite || {});
  const smartAdvisoryState = useSelector((s) => s.smartAdvisory || {});

  const advisory = smartAdvisoryState.advisory || null;
  const advisoryLoading = Boolean(smartAdvisoryState.loading);

  const isLoading = advisoryLoading || !advisory?.cropHealth;

  // build health data from advisory if present
  const healthData = useMemo(() => {
    if (!advisory?.cropHealth) return null;
    return {
      Health_Percentage: Number(advisory.cropHealth.percentage ?? 0),
      Crop_Health: advisory.cropHealth.category ?? "Unknown",
      NDVI_Mean: Number(advisory.cropHealth.score ?? 0),
      summary: advisory.cropHealth.recommendation ?? "No summary available",
    };
  }, [advisory]);

  const {
    Health_Percentage = 0,
    Crop_Health = "Unknown",
    NDVI_Mean = 0,
    summary = "No summary available",
  } = healthData || {};

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-2 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="h-5 bg-gray-300 rounded w-40" />
          <div className="w-5 h-5 bg-gray-300 rounded-full" />
        </div>

        <div className="flex items-center justify-between w-full">
          <div className="flex items-baseline gap-3">
            <div className="h-7 bg-gray-300 rounded w-16" />
            <div className="h-4 bg-gray-300 rounded w-48" />
          </div>
          <div className="h-8 bg-gray-300 rounded w-24" />
        </div>

        <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="absolute left-0 top-0 h-3 rounded-full"
            style={{
              width: "100%",
              background:
                "linear-gradient(90deg, #5a7c6b 0%, #7a9c8b 50%, #5a7c6b 100%)",
              backgroundSize: "200% 100%",
              animation: "progressiveLoad 1.5s ease-in-out infinite",
            }}
          />
        </div>

        <div className="text-center mt-2">
          <span className="text-sm text-gray-500 font-medium">
            Fetching crop health data...
          </span>
        </div>

        <style>{`
          @keyframes progressiveLoad {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(0%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Header with info */}
      <div className="flex items-center gap-2">
        <span className="text-gray-800 font-semibold text-[16px]">
          Overall Crop Health
        </span>

        <div
          className="relative inline-block"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <button
            aria-label="Crop health information"
            className="w-5 h-5 rounded-full border-2 border-gray-500 flex items-center justify-center text-gray-600 hover:bg-gray-600 hover:text-white transition"
            type="button"
          >
            i
          </button>

          {showTooltip && (
            <div
              className="absolute left-8 top-1/2 -translate-y-1/2 z-50 w-72 sm:w-80 p-4 bg-gray-800 text-white text-sm rounded-lg shadow-xl"
              role="dialog"
              aria-live="polite"
            >
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-800 transform rotate-45" />
              <div>
                <p className="font-semibold mb-2 text-white">Yield Summary:</p>
                <p className="text-gray-200 leading-relaxed">{summary}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Health percentage & status */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-baseline gap-3">
          <span
            className="font-bold text-[20px] md:text-[20px]"
            style={{ color: getHealthColor(Health_Percentage) }}
          >
            {Math.round(Health_Percentage)}%
          </span>
          <span className="text-gray-600 text-[12px] md:text-[12px]">
            Based on satellite vegetation analysis
          </span>
        </div>

        <span
          className={`px-4 py-1 rounded-md text-[18px] font-semibold ${getHealthBgColorClass(
            Health_Percentage
          )}`}
        >
          {Crop_Health}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div
          className="absolute left-0 top-0 h-3 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.min(Math.max(Health_Percentage, 0), 100)}%`,
            backgroundColor: getHealthColor(Health_Percentage),
          }}
        />
      </div>

      {/* Optional debug: show NDVI mean (hidden by default) */}
      {/* <div className="text-xs text-gray-500 mt-1">NDVI mean: {NDVI_Mean}</div> */}
    </div>
  );
};

export default CropHealthStatusBar;
