import React from "react";
import ReactECharts from "echarts-for-react";
import { Card } from "react-bootstrap";

const WindChart = ({ forecastData, historicalData, dateRange }) => {
  // Use historical data if available, otherwise use forecast
  const dataSource = historicalData || forecastData?.forecast || {};
  const current = forecastData?.current || {};
  const isHistorical = !!historicalData;

  const dates = (dataSource.time || []).map((dateStr) => {
    const d = new Date(dateStr);
    return `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`;
  });

  const windGusts = dataSource.wind_gusts || [];
  const windSpeed = dataSource.wind_speed || [];

  const currentWindSpeed = isHistorical 
    ? (windSpeed.length > 0 ? windSpeed[windSpeed.length - 1] : "-")
    : (current.wind_speed ?? "-");
    
  const currentWindGusts = isHistorical
    ? (windGusts.length > 0 ? windGusts[windGusts.length - 1] : "-")
    : (current.wind_gusts ?? "-");
    
  const lastUpdated = isHistorical && dateRange
    ? `${dateRange.startDate} to ${dateRange.endDate}`
    : current.time
      ? new Date(current.time).toLocaleString()
      : "-";

  const option = {
    tooltip: { trigger: "axis" },
    grid: {
      left: "3%",
      right: "3%",
      top: "18%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: dates,
      boundaryGap: false,
      axisLine: { lineStyle: { color: "#888" } },
      axisLabel: {
        color: "#333",
        interval: 0,
        rotate: 30,
        margin: 15,
        fontSize: 12,
      },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: Math.max(...windGusts, ...windSpeed, 20),
      interval: 15,
      axisLine: { lineStyle: { color: "#888" } },
      axisLabel: { formatter: "{value} km/h", color: "#333", margin: 15 },
      splitLine: { lineStyle: { type: "dashed", color: "#eee" } },
    },
    series: [
      {
        name: "Wind Gusts",
        type: "line",
        data: windGusts,
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        itemStyle: { color: "#1f77b4" },
      },
      {
        name: "Wind Speed",
        type: "line",
        data: windSpeed,
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        itemStyle: { color: "#ff7f0e" },
      },
    ],
  };

  return (
    <Card className="mt-3 mx-2 rounded-lg shadow-md bg-white w-auto">
      <Card.Body>
        <div className="flex justify-between items-center">
          <h2 className="text-[#344e41] text-xl font-bold">
            Wind {isHistorical && <span className="text-sm text-gray-500">(Historical)</span>}
          </h2>
          <div className="flex gap-4">
            <p className="flex items-center gap-1 px-1 text-[#a7a5a5] text-xs">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-1">
                <circle cx="5" cy="5" r="5" fill="#81D8EB" />
              </svg>
              Wind Gusts
            </p>
            <p className="flex items-center gap-1 px-1 text-[#a7a5a5] text-xs">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-1">
                <circle cx="5" cy="5" r="5" fill="#1D31A8" />
              </svg>
              Wind Speed
            </p>
          </div>
        </div>
        <div className="flex ml-12 text-center">
          <div>
            <p className="text-[0.7rem] text-[#9a9898] m-0 p-0">
              {isHistorical ? "Avg Wind Gusts" : "Current Wind Gusts"}
            </p>
            <h2 className="text-[#344e41] text-2xl font-bold">
              {currentWindGusts === "-" ? "-" : `${currentWindGusts} km/h`}
            </h2>
            <p className="text-[0.7rem] text-[#9a9898] m-0 p-0">{lastUpdated}</p>
          </div>
          <div className="ms-5">
            <p className="text-[0.7rem] text-[#9a9898] m-0 p-0">
              {isHistorical ? "Avg Wind Speed" : "Current Wind Speed"}
            </p>
            <h2 className="text-[#344e41] text-2xl font-bold">
              {currentWindSpeed === "-" ? "-" : `${currentWindSpeed} km/h`}
            </h2>
            <p className="text-[0.7rem] text-[#9a9898] m-0 p-0">{lastUpdated}</p>
          </div>
        </div>
        <div className="relative">
          <ReactECharts option={option} className="w-full" style={{ padding: "0px", height: "200px" }} />
        </div>
      </Card.Body>
    </Card>
  );
};

export default WindChart;