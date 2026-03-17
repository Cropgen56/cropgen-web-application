import React from "react";

/**
 * Polished loader for index charts (NDVI, EVI, SAVI, etc.)
 * Light green spinning arc with contextual loading text
 */
const IndexChartLoader = ({ message = "Loading data...", className = "" }) => (
  <div
    className={`flex flex-col items-center justify-center gap-4 ${className}`}
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <div
      className="w-14 h-14 rounded-full border-[3px] border-[#2C4C3B]/30 border-t-[#86D72F] animate-spin"
      aria-hidden="true"
    />
    <p className="text-gray-400 text-sm font-medium">{message}</p>
  </div>
);

export default IndexChartLoader;
