import React from "react";
import ReactECharts from "echarts-for-react";
import { useSelector } from "react-redux";
import PremiumContentWrapper from "../../subscription/PremiumContentWrapper";
import { selectHasEvapotranspirationMonitoring } from "../../../redux/slices/membershipSlice";

const CLOUD_COLOR_MAIN = "#87CEEB";

const EvapotranspirationChart = ({ onSubscribe }) => {
  const forecastData = useSelector((state) => state.weather.forecastData) || {};
  const hasEvapotranspirationMonitoring = useSelector(
    selectHasEvapotranspirationMonitoring
  );

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
      : "";

  const option = {
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
      data: dateData.map((date) => date.slice(5)),
      axisLabel: {
        rotate: 45,
        interval: 0,
        fontSize: 10,
        color: "#333",
      },
      axisLine: { lineStyle: { color: "rgba(0, 0, 0, 0.1)" } },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 12,
      interval: 2,
      axisLabel: {
        formatter: "{value} mm",
        fontWeight: "bold",
        align: "left",
        padding: [0, 0, 0, 1],
        color: "#333",
      },
      splitLine: { lineStyle: { color: "rgba(0, 0, 0, 0.1)" } },
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
  };

  return (
    <PremiumContentWrapper
      isLocked={!hasEvapotranspirationMonitoring}
      onSubscribe={onSubscribe}
      title="Evapotranspiration Monitoring"
    >
      <div className="w-full flex mt-4">
        <div className="relative w-full bg-gray-50 rounded-2xl shadow-md text-gray-900 flex flex-col overflow-hidden px-3 py-3 md:px-4 md:py-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-gray-900 text-2xl font-bold">
              Evapotranspiration
            </h2>
            <div className="flex items-center gap-1 px-1 text-gray-900 font-bold text-md">
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="me-1"
              >
                <circle cx="5" cy="5" r="5" fill={CLOUD_COLOR_MAIN} />
              </svg>
              Daily ET
            </div>
          </div>

          <div className="flex flex-col lg:flex-row w-full mt-2">
            <div className="flex lg:flex-col w-full lg:w-[140px] gap-2 h-auto lg:h-full mb-3 lg:mb-0">
              <div className="flex-1 lg:flex-none bg-white border-[2px] rounded-lg p-2 text-center flex flex-col justify-center lg:h-[50%]">
                <p className="text-gray-500 text-[10px] m-0">ET High</p>
                <h2 className="text-gray-900 text-base md:text-lg font-bold">
                  {maxEt} mm
                </h2>
                <p className="text-gray-500 text-[10px] m-0">
                  {maxEtDate || "N/A"}
                </p>
              </div>
              <div className="flex-1 lg:flex-none bg-white border-[2px] rounded-lg p-2 text-center flex flex-col justify-center lg:h-[50%]">
                <p className="text-gray-500 text-[10px] m-0">ET Average</p>
                <h2 className="text-gray-900 text-base md:text-lg font-bold">
                  {avgEt} mm
                </h2>
                <p className="text-gray-500 text-[10px] m-0">16-day avg</p>
              </div>
            </div>

            <div className="flex-1 lg:ml-3 bg-white rounded-xl p-1">
              <ReactECharts
                option={option}
                className="w-full"
                style={{ width: "100%", height: "220px" }}
              />
            </div>
          </div>
        </div>
      </div>
    </PremiumContentWrapper>
  );
};

export default EvapotranspirationChart;
