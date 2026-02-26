import React, { useRef, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { useSelector } from "react-redux";

import PremiumContentWrapper from "../../subscription/PremiumContentWrapper";
import FeatureGuard from "../../subscription/FeatureGuard";
import { useSubscriptionGuard } from "../../subscription/hooks/useSubscriptionGuard";

const CLOUD_COLOR_MAIN = "#87CEEB";

const EvapotranspirationChart = ({ selectedFieldsDetials }) => {
  const chartRef = useRef(null);
  const forecastData = useSelector((state) => state.weather.forecastData) || {};

  /* ================= FEATURE GUARD ================= */
  const evapotranspirationGuard = useSubscriptionGuard({
    field: selectedFieldsDetials?.[0],
    featureKey: "evapotranspirationMonitoring",
  });

  /* ================= DATA ================= */
  const dateData = forecastData.forecast?.time || [];
  const evapotranspirationData =
    forecastData.forecast?.evapotranspiration || [];

  const maxEt =
    evapotranspirationData.length > 0
      ? Math.max(...evapotranspirationData).toFixed(2)
      : "0.00";

  const avgEt =
    evapotranspirationData.length > 0
      ? (
          evapotranspirationData.reduce((a, b) => a + b, 0) /
          evapotranspirationData.length
        ).toFixed(2)
      : "0.00";

  const maxEtDate =
    evapotranspirationData.length > 0
      ? dateData[
          evapotranspirationData.indexOf(Math.max(...evapotranspirationData))
        ]
      : "N/A";

  const option = useMemo(
    () => ({
      tooltip: { trigger: "axis" },
      grid: {
        left: "0%",
        right: "0%",
        top: "14%",
        bottom: "0%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: dateData.map((d) => d.slice(5)),
        axisLabel: {
          rotate: 45,
          interval: 0,
          fontSize: 10,
          color: "#333",
        },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 12,
        interval: 2,
        axisLabel: {
          formatter: "{value} mm",
          fontWeight: "bold",
          color: "#333",
        },
      },
      series: [
        {
          name: "Evapotranspiration",
          type: "line",
          data: evapotranspirationData,
          smooth: true,
          symbol: "circle",
          symbolSize: 8,
          itemStyle: { color: CLOUD_COLOR_MAIN },
          lineStyle: { color: CLOUD_COLOR_MAIN },
        },
      ],
    }),
    [dateData, evapotranspirationData],
  );

  /* ================= RENDER ================= */

  return (
    <FeatureGuard
      guard={evapotranspirationGuard}
      title="Evapotranspiration Monitoring"
    >
      <div className="w-full flex mt-4">
        <div className="relative w-full bg-white border border-gray-200 rounded-2xl shadow-md text-gray-900 flex flex-col overflow-hidden px-3 py-3 md:px-4 md:py-4">
          {/* ===== HEADER ===== */}
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl lg:text-2xl font-bold">
              Evapotranspiration
            </h2>

            <div className="flex items-center gap-1 text-gray-900 font-bold text-md">
              <svg width="10" height="10">
                <circle cx="5" cy="5" r="5" fill={CLOUD_COLOR_MAIN} />
              </svg>
              Daily ET
            </div>
          </div>

          {/* ===== BODY ===== */}
          <div className="flex flex-col lg:flex-row w-full mt-2 gap-3">
            {/* LEFT SUMMARY PANEL */}
            <div className="w-full lg:w-1/4 flex flex-col gap-2">
              <div className="bg-white border rounded-lg p-3 text-center">
                <p className="text-gray-500 text-xs">ET High</p>
                <h2 className="text-gray-900 font-bold">{maxEt} mm</h2>
                <p className="text-gray-500 text-xs">{maxEtDate}</p>
              </div>

              <div className="bg-white border rounded-lg p-3 text-center">
                <p className="text-gray-500 text-xs">ET Average</p>
                <h2 className="text-gray-900 font-bold">{avgEt} mm</h2>
                <p className="text-gray-500 text-xs">16-day avg</p>
              </div>
            </div>

            {/* RIGHT CHART PANEL */}
            <div className="lg:w-3/4 flex-grow">
              <PremiumContentWrapper
                isLocked={!evapotranspirationGuard.hasFeatureAccess}
                onSubscribe={evapotranspirationGuard.handleSubscribe}
                title="Evapotranspiration Monitoring"
              >
                <div className="w-full bg-white rounded-xl p-2 min-h-[220px]">
                  <ReactECharts
                    ref={chartRef}
                    option={option}
                    style={{ width: "100%", height: "220px" }}
                  />
                </div>
              </PremiumContentWrapper>
            </div>
          </div>
        </div>
      </div>
    </FeatureGuard>
  );
};

export default React.memo(EvapotranspirationChart);
