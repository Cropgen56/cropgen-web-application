import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";

const getHealthColor = (percentage) => {
  if (percentage >= 75) return "#22C55E";
  if (percentage >= 50) return "#FCD34D";
  if (percentage >= 25) return "#F59E0B";
  return "#EF4444";
};

const getHealthBgClass = (percentage) => {
  if (percentage >= 75) return "bg-green-100 text-green-800";
  if (percentage >= 50) return "bg-yellow-100 text-yellow-800";
  if (percentage >= 25) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
};

const CropHealthStatusBar = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  const { advisory, loading: advisoryLoading } = useSelector(
    (state) => state.smartAdvisory || {},
  );

  const isLoading = advisoryLoading || !advisory?.cropHealth;

  const health = useMemo(() => {
    if (!advisory?.cropHealth) return null;
    return {
      percentage: Number(advisory.cropHealth.percentage ?? 0),
      category: advisory.cropHealth.category ?? "Unknown",
      summary: advisory.cropHealth.recommendation ?? "No summary available",
    };
  }, [advisory]);

  if (isLoading || !health) {
    return (
      <div className="w-full space-y-3 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-40" />
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-24" />
          <div className="h-7 bg-gray-200 rounded w-20" />
        </div>
        <div className="h-3 bg-gray-200 rounded-full" />
      </div>
    );
  }

  const { percentage, category, summary } = health;

  return (
    <div className="w-full space-y-2.5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-800 text-base">
          Crop Health
        </span>

        <div className="relative">
          <button
            type="button"
            className="w-5 h-5 rounded-full border border-gray-400 text-gray-500 text-xs font-medium hover:bg-gray-100 transition"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            i
          </button>

          {showTooltip && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-10 w-72 p-3.5 bg-gray-900 text-white text-sm rounded-lg shadow-xl">
              <div className="absolute -left-1.5 top-1/2 w-3 h-3 bg-gray-900 rotate-45 -translate-y-1/2" />
              <p className="leading-relaxed">{summary}</p>
            </div>
          )}
        </div>
      </div>

      {/* Value + Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2.5">
          <span
            className="text-2xl font-bold"
            style={{ color: getHealthColor(percentage) }}
          >
            {Math.round(percentage)}%
          </span>
          <span className="text-sm text-gray-600">Vegetation-based</span>
        </div>

        <span
          className={`px-3.5 py-1 rounded text-sm font-semibold ${getHealthBgClass(percentage)}`}
        >
          {category}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(Math.max(percentage, 0), 100)}%`,
            backgroundColor: getHealthColor(percentage),
          }}
        />
      </div>
    </div>
  );
};

export default CropHealthStatusBar;
