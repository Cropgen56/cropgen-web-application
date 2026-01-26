import React, { useMemo } from "react";

import FarmReportMap from "./FarmReportMap";
import CropHealth from "../../dashboard/crophealth/CropHealthCard";
import ForeCast from "../../dashboard/forecast/ForeCast";
import PlantGrowthActivity from "../../dashboard/PlantGrowthActivity";
import Insights from "../../dashboard/insights/Insights"; 
import NdviGraph from "../../dashboard/satellite-index/VegetationIndex";
import WaterIndex from "../../dashboard/satellite-index/WaterIndex";
import EvapotranspirationDashboard from "../../dashboard/satellite-index/ETChart";

const MapLoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="relative w-full h-[230px] rounded-lg overflow-hidden shadow-md bg-[#5a7c6b] animate-pulse flex items-center justify-center"
      >
        <div className="text-center">
          <div className="w-10 h-10 bg-[#4a6b5a] rounded-full mx-auto mb-2"></div>
          <p className="text-white/70 text-sm">Loading...</p>
        </div>
      </div>
    ))}
  </div>
);

const FarmReportContent = ({
  selectedFieldDetails,
  fields,
  mapRef,
  isFieldDataReady,
  isPreparedForPDF,
  forecastData,
  featureAccess,
  onSubscribe,
}) => {
  const { forecast, units } = forecastData || {};

  const etChartData = useMemo(() => {
    if (forecast && forecast.length > 0) return forecast;

    const mockData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      mockData.push({
        date: date.toISOString().split("T")[0],
        et0: (Math.random() * 3 + 2).toFixed(2),
        precipitation: (Math.random() * 5).toFixed(2),
        temp_max: Math.floor(Math.random() * 10 + 25),
        temp_min: Math.floor(Math.random() * 10 + 15),
        humidity: Math.floor(Math.random() * 30 + 50),
      });
    }
    return mockData;
  }, [forecast]);

  const {
    hasCropHealthAndYield,
    hasWeatherAnalytics,
    hasVegetationIndices,
    hasWaterIndices,
    hasEvapotranspiration,
    hasAgronomicInsights,
    hasWeeklyAdvisoryReports,
    hasCropGrowthMonitoring,
  } = featureAccess;

  return (
    <>
      {/* Section 0: Map & Crop Health */}
      <div
        className="farm-section bg-[#2d4339] rounded-lg p-2 mb-2"
        data-section-index="0"
      >
        {isFieldDataReady ? (
          <FarmReportMap
            key={selectedFieldDetails?._id}
            selectedFieldsDetials={[selectedFieldDetails]}
            ref={mapRef}
            hidePolygonForPDF={isPreparedForPDF}
          />
        ) : (
          <MapLoadingSkeleton />
        )}

        <div className="mt-2">
          <CropHealth
            key={`crop-health-${selectedFieldDetails?._id}`}
            selectedFieldsDetials={[selectedFieldDetails]}
            fields={fields}
            onSubscribe={onSubscribe}
            hasCropHealthAndYield={hasCropHealthAndYield}
          />
        </div>
      </div>

      {/* Section 1: Weather & Indices */}
      <div
        className="farm-section bg-[#2d4339] rounded-lg p-2 mb-2"
        data-section-index="1"
      >
        <ForeCast
          hasWeatherAnalytics={hasWeatherAnalytics}
          onSubscribe={onSubscribe}
        />

        <div className="mt-2">
          <NdviGraph
            key={`ndvi-${selectedFieldDetails?._id}`}
            selectedFieldsDetials={[selectedFieldDetails]}
            onSubscribe={onSubscribe}
            hasVegetationIndices={hasVegetationIndices}
          />
        </div>

        <div className="mt-2">
          <WaterIndex
            key={`water-${selectedFieldDetails?._id}`}
            selectedFieldsDetials={[selectedFieldDetails]}
            onSubscribe={onSubscribe}
            hasWaterIndices={hasWaterIndices}
          />
        </div>

        <div className="mt-2">
          <EvapotranspirationDashboard
            forecast={etChartData}
            units={units || { et0: "mm/day" }}
            onSubscribe={onSubscribe}
            hasEvapotranspiration={hasEvapotranspiration}
          />
        </div>
      </div>

      {/* Section 2: Insights & Advisory */}
      <div
        className="farm-section bg-[#2d4339] rounded-lg p-2"
        data-section-index="2"
      >
        <Insights
          onSubscribe={onSubscribe}
          hasAgronomicInsights={hasAgronomicInsights}
        />


        <div className="mt-2">
          <PlantGrowthActivity
            key={`growth-${selectedFieldDetails?._id}`}
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