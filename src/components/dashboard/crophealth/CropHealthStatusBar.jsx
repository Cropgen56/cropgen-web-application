import React, { useState } from "react";
import { useSelector } from "react-redux";

const CropHealthStatusBar = ({ selectedFieldsDetials }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const { cropHealthYield, healthYieldLoading } = useSelector(
    (state) => state.crops
  );

  const { cropHealth: oldCropHealth, loading: satelliteLoading } = useSelector(
    (state) => state?.satellite
  );

  const advisory = useSelector((state) => state.smartAdvisory.advisory);
  const advisoryLoading = useSelector((state) => state.smartAdvisory.loading);

  const isLoading = advisoryLoading || !advisory?.cropHealth;

  const healthData = advisory?.cropHealth
    ? {
        Health_Percentage: advisory.cropHealth.percentage ?? 0,
        Crop_Health: advisory.cropHealth.category ?? "Unknown",
        NDVI_Mean: advisory.cropHealth.score ?? 0,
        summary: advisory.cropHealth.recommendation ?? "No summary available",
      }
    : null;

  const {
    Health_Percentage = 0,
    Crop_Health = "Unknown",
    NDVI_Mean = 0,
    summary = "No summary available",
  } = healthData || {};

  const getHealthColor = (percentage) => {
    if (percentage >= 75) return "#22C55E"; // Green
    if (percentage >= 50) return "#FCC21B"; // Yellow
    if (percentage >= 25) return "#F59E0B"; // Orange
    return "#EF4444"; // Red
  };

  const getHealthBgColor = (percentage) => {
    if (percentage >= 75) return "bg-green-100 text-green-700";
    if (percentage >= 50) return "bg-yellow-100 text-yellow-700";
    if (percentage >= 25) return "bg-orange-100 text-orange-700";
    return "bg-red-100 text-red-700";
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-2 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="h-5 bg-gray-300 rounded w-40"></div>
          <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
        </div>

        <div className="flex items-center justify-between w-full">
          <div className="flex items-baseline gap-3">
            <div className="h-7 bg-gray-300 rounded w-16"></div>
            <div className="h-4 bg-gray-300 rounded w-48"></div>
          </div>
          <div className="h-8 bg-gray-300 rounded w-24"></div>
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
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Header with Info Button */}
      <div className="flex items-center gap-2">
        <span className="text-gray-800 font-semibold text-[16px]">
          Overall Crop Health
        </span>

        {/* Info Icon with Tooltip */}
        <div className="relative inline-block">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="focus:outline-none"
            aria-label="Crop health information"
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              border: "2px solid #6B7280",
              backgroundColor: "transparent",
              color: "#6B7280",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "help",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#6B7280";
              e.currentTarget.style.color = "white";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#6B7280";
            }}
          >
            i
          </button>

          {showTooltip && (
            <div
              className="absolute left-8 top-1/2 -translate-y-1/2 z-50 w-72 sm:w-80 p-4 bg-gray-800 text-white text-sm rounded-lg shadow-xl"
              style={{
                animation: "slideInRight 0.2s ease-out",
              }}
            >
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-800 transform rotate-45"></div>

              <div className="relative">
                <p className="font-semibold mb-2 text-white">Yield Summary:</p>
                <p className="text-gray-200 leading-relaxed">{summary}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Health Percentage and Status */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-baseline gap-3">
          <span
            className="font-bold text-[20px] md:text-[20px]"
            style={{ color: getHealthColor(Health_Percentage) }}
          >
            {Health_Percentage}%
          </span>
          <span className="text-gray-600 text-[12px] md:text-[12px]">
            Based on satellite vegetation analysis
          </span>
        </div>

        <span
          className={`px-4 py-1 rounded-md text-[18px] font-semibold ${getHealthBgColor(
            Health_Percentage
          )}`}
        >
          {Crop_Health}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div
          className="absolute left-0 top-0 h-3 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Health_Percentage}%`,
            backgroundColor: getHealthColor(Health_Percentage),
          }}
        />
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateY(-50%) translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CropHealthStatusBar;
