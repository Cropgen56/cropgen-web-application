import React from "react";
import ReactECharts from "echarts-for-react";
import { useSelector } from "react-redux";


const CLOUD_COLOR_MAIN = "#87CEEB"; // Sky Blue


const EvapotranspirationChart = () => {
  const forecastData = useSelector((state) => state.weather.forecastData) || {};

  const dateData = forecastData.forecast?.time || [];
  const evapotranspirationData =
    forecastData.forecast?.evapotranspiration || [];

  // Calculate max and avg evapotranspiration
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
        color: '#fff', // White label on dark background
      },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.5)' } }
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
        color: '#fff', // White label on dark background
      },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } }
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
        lineStyle: { color: CLOUD_COLOR_MAIN }
      },
    ],
  };

  return (
    <div className="w-full flex  mt-4"> {/* Reduced top margin */}
      <div className="relative w-full  bg-gradient-to-br from-[#5A7C6B] to-[#344E41] rounded-2xl shadow-lg text-white flex flex-col overflow-hidden px-3 py-3 md:px-4 md:py-4"> {/* Reduced padding */}

        {/* Card Body Content */}
        <div className="relative z-10 w-full">
          <div className="flex justify-between items-center mb-2"> {/* Reduced bottom margin */}
            <h2 className="text-white text-xl font-bold">Evapotranspiration</h2> {/* Reduced text size */}
            <div className="flex gap-2"> {/* Reduced gap */}
              <p className="flex items-center gap-1 px-1 text-gray-300 text-xs">
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
              </p>
            </div>
          </div>


          <div className="flex ml-4 text-center mb-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 mr-2">
              <p className="text-gray-300 text-[10px] m-0">ET High</p>
              <h2 className="text-white text-lg font-bold">{maxEt} mm</h2>
              <p className="text-gray-400 text-[10px] m-0">{maxEtDate || "N/A"}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
              <p className="text-gray-300 text-[10px] m-0">ET Average</p>
              <h2 className="text-white text-lg font-bold">{avgEt} mm</h2>
              <p className="text-gray-400 text-[10px] m-0">16-day avg</p>
            </div>
          </div>


          <div className="relative w-full bg-gradient-to-br from-[#6B9080] to-[#3D5A40] backdrop-blur-sm rounded-xl p-1">
            <ReactECharts
              option={option}
              className="w-full"
              style={{ width: "100%", padding: "0px", height: "220px" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvapotranspirationChart;