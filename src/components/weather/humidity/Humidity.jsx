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

  // Current humidity from current data (or fallback)
  const currentHumidity = current.relative_humidity ?? "-";

  const options = {
    grid: {
      left: "0%",
      right: "2%",
      top: "14%",
      bottom: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: dates,

      axisLine: { show: true },
      axisLabel: {
        color: "#000", interval: 0,    // show all 16 labels
        rotate: 0,      // rotate to 15 or 30 if needed
        fontSize: 11,
        margin: 10,
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "#e0e0e0",
          type: "solid",
        },
      },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      interval: 20,
      axisLine: { show: true },
      axisTick: { show: true },
      axisLabel: { color: "#000", formatter: "{value}%" },
      splitLine: { show: false },
    },
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
    ],
    tooltip: {
      trigger: "axis",
      formatter: (params) => {
        const humidity = params.find(p => p.seriesName === "Humidity");
        return `${params[0].name}<br/>Humidity: ${humidity?.value ?? '-'}%`;
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md mt-3 mx-2 mb-2">
      <div className="p-4 ">
        <h2 className="flex justify-start items-center text-[20px] font-bold text-[#344E41] mb-3">
          <span className="text-[20px] font-bold">Humidity %</span>
        </h2>
        <div className="mb-3 text-[#344E41]">
          <p>Current Humidity</p>
          <h2 className="text-[30px] font-bold">{currentHumidity}%</h2>
        </div>
        <div className="w-full">
          <ReactEcharts option={options} className="w-full h-[200px]" />
        </div>
      </div>
    </div>
  );
};

export default Humidity;
