import React from "react";
import ReactEcharts from "echarts-for-react";
import { Card } from "react-bootstrap";
// import "./Temperature.css";

const Temperature = ({ forecastData }) => {
  if (!forecastData?.forecast) {
    return <p>Loading temperature data...</p>;
  }

  const { time = [], temp_max = [], temp_mean = [], temp_min = [] } = forecastData.forecast;

  // Slice to 16 days only
  const slicedTime = time.slice(0, 16);
  const slicedTempMax = temp_max.slice(0, 16);
  const slicedTempMean = temp_mean.slice(0, 16);
  const slicedTempMin = temp_min.slice(0, 16);

  // Format dates as "DD MMM"
  const formattedDates = slicedTime.map(dateStr => {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleString("default", { month: "short" });
    return `${day} ${month}`;
  });

  const options = {
    grid: {
      left: "0%",
      right: "2%",
      top: "14%",
      bottom: "0%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: formattedDates,
      axisLine: { show: true },
      axisLabel: { color: "#000" },
    },
    yAxis: {
      type: "value",
      min: Math.min(...slicedTempMin) - 2,
      max: Math.max(...slicedTempMax) + 2,
      interval: 2,
      axisLine: { show: true },
      splitLine: { show: true },
      axisTick: { show: true },
      axisLabel: { color: "#9A9898", formatter: "{value}°C" },
    },
    series: [
      {
        name: "Max Temp",
        data: slicedTempMax,
        type: "line",
        areaStyle: { color: "#F4BC58" },
        lineStyle: { color: "#F4BC58" },
        symbol: "circle",
        symbolSize: 4,
      },
      {
        name: "Mean Temp",
        data: slicedTempMean,
        type: "line",
        areaStyle: { color: "#86D72F" },
        lineStyle: { color: "#86D72F" },
        symbol: "circle",
        symbolSize: 4,
      },
      {
        name: "Min Temp",
        data: slicedTempMin,
        type: "line",
        areaStyle: { color: "#4B970F" },
        lineStyle: { color: "#4B970F" },
        symbol: "circle",
        symbolSize: 4,
      },
    ],
    tooltip: {
      trigger: "axis",
      formatter: (params) =>
        params.map(p => `${p.seriesName}: ${p.data}°C`).join("<br/>"),
    },
    legend: {
      data: ["Max Temp", "Mean Temp", "Min Temp"],
      top: "0%",
    },
  };

  return (
    <Card className="mt-3 mx-2 rounded-lg shadow-md bg-white">
      <Card.Body>
        <div className="w-full">
          <div className="flex justify-between items-center">
            <h2 className="text-[#344e41] text-lg font-bold">
              Temperature, <sup>°C</sup>
            </h2>
          </div>
          <ReactEcharts option={options} className="w-full relative h-[250px]" />
        </div>
      </Card.Body>
    </Card>
  );
};

export default Temperature;
