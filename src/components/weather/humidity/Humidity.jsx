import React from "react";
import ReactEcharts from "echarts-for-react";

const Humidity = ({ forecastData }) => {
  if (!forecastData) return <div>Loading...</div>;

  const forecast = forecastData.forecast || {};
  const current = forecastData.current || {};

  // Extract times and format as "DD MMM"
  const dates = (forecast.time || []).map(dateStr => {
    const d = new Date(dateStr);
    return `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`;
  });

  // Use relative humidity for humidity data (array)
  const humidityData = forecast.relative_humidity || [];

  //we have no dewpoint data
  const dewPointData = forecast.dew_point || humidityData.map(() => null);

  // Current humidity and dew point from current data (or fallback)
  const currentHumidity = current.relative_humidity ?? "-";
  const currentDewPoint = current.dew_point ?? "-";

  const options = {
    grid: {
      left: "10%",
      right: "10%",
      top: "14%",
      bottom: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: dates,
      axisLine: { show: true },
      axisLabel: { color: "#000" },
      splitLine: {
        show: true,
        lineStyle: {
          color: "#e0e0e0",
          type: "solid",
        },
      },
    },
    yAxis: [
      {
        type: "value",
        nameTextStyle: {
          fontSize: 14,
          fontWeight: "bold",
          color: "#000",
          padding: [0, 0, 0, 5],
        },
        min: 0,
        max: 100,
        interval: 20,
        axisLine: { show: true },
        axisTick: { show: true },
        axisLabel: { color: "#000", formatter: "{value}%" },
        splitLine: { show: false },
      },
      {
        type: "value",
        nameTextStyle: {
          fontSize: 14,
          fontWeight: "bold",
          color: "#000",
          padding: [0, 5, 0, 0],
        },
        min: -10,
        max: 35,
        interval: 5,
        axisLine: { show: true },
        axisTick: { show: true },
        axisLabel: { color: "#000", formatter: "{value}°C" },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "Humidity",
        data: humidityData,
        type: "line",
        areaStyle: { color: "#0A94C080" },
        lineStyle: { color: "#0A94C080" },
        smooth: false,
        symbol: "circle",
        symbolSize: 4,
      },
      {
        name: "Dew Point",
        data: dewPointData,
        type: "line",
        yAxisIndex: 1,
        areaStyle: { color: "#86D72FB2" },
        lineStyle: { color: "#86D72FB2" },
        smooth: false,
        symbol: "circle",
        symbolSize: 4,
      },
    ],
    tooltip: {
      trigger: "axis",
      formatter: (params) => {
        const humidity = params.find(p => p.seriesName === "Humidity");
        const dewPoint = params.find(p => p.seriesName === "Dew Point");
        return `${params[0].name}<br/>Humidity: ${humidity?.value ?? '-'}%<br/>Dew Point: ${dewPoint?.value ?? '-'}°C`;
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md mt-3 mx-2 mb-2">
      <div className="p-4">
        <h2 className="flex justify-between items-center text-[20px] font-bold text-[#344E41] mb-3">
          <span className="text-[20px] font-bold">Humidity %</span>
          <span className="text-[20px] font-bold">Dew Point, °C</span>
        </h2>
        <div className="flex justify-between mb-3 text-[#344E41]">
          <div>
            <p>Current Humidity</p>
            <h2 className="text-[30px] font-bold">{currentHumidity}%</h2>
          </div>
          <div>
            <p>Current Dew Point</p>
            <h2 className="text-[30px] font-bold">{currentDewPoint}°C</h2>
          </div>
        </div>
        <div className="w-full">
          <ReactEcharts option={options} className="w-full h-[200px]" />
        </div>
      </div>
    </div>
  );
};

export default Humidity;
