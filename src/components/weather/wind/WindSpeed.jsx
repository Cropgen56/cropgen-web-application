import React from "react";
import ReactECharts from "echarts-for-react";
import { Card } from "react-bootstrap";
import "./WindSpeed.css";

const WindChart = ({ forecastData }) => {
  const forecast = forecastData?.forecast || {};
  const current = forecastData?.current || {};

  const dates = (forecast.time || []).map((dateStr) => {
    const d = new Date(dateStr);
    return `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`;
  });

  const windGusts = forecast.wind_gusts || [];
  const windSpeed = forecast.wind_speed || [];

  const currentWindSpeed = current.wind_speed ?? "-";
  const currentWindGusts = current.wind_gusts ?? "-";
  const lastUpdated = current.time
    ? new Date(current.time).toLocaleString()
    : "-";

const option = {
  tooltip: { trigger: "axis" },
  grid: {
    left: "3%",   // even smaller left margin
    right: "3%",  // smaller right margin
    top: "18%",
    bottom: "15%",
    containLabel: true,
  },
  xAxis: {
    type: "category",
    data: dates,
    boundaryGap: false,      // no gap on sides, use full width
    axisLine: { lineStyle: { color: "#888" } },
    axisLabel: {
      color: "#333",
      interval: 0,           // show all labels
      rotate: 30,            // horizontal labels, can set to 15 or 20 if overlap occurs
      margin: 15,
      fontSize: 12,
      // overflow: 'truncate',  // optional if text overflows
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
    <Card className="wind-chart-card">
      <Card.Body>
        <div className="wind-chart-heading">
          <h2 className="text-[20px]">Wind</h2>
          <div>
            <p>
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="me-1"
              >
                <circle cx="5" cy="5" r="5" fill="#81D8EB" />
              </svg>
              Wind Gusts
            </p>

            <p>
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="me-1"
              >
                <circle cx="5" cy="5" r="5" fill="#1D31A8" />
              </svg>
              Wind Speed
            </p>
          </div>
        </div>
        <div className="wind-info">
          <div>
            <p>Current Wind Gusts</p>
            <h2 className="text-[30px] font-bold">
              {currentWindGusts === "-" ? "-" : `${currentWindGusts} km/h`}
            </h2>
            <p>{lastUpdated}</p>
          </div>
          <div className="ms-5">
            <p>Current Wind Speed</p>
            <h2 className="text-[30px] font-bold">
              {currentWindSpeed === "-" ? "-" : `${currentWindSpeed} km/h`}
            </h2>
            <p>{lastUpdated}</p>
          </div>
        </div>
        <div className="wind-chart-container">
        <ReactECharts
  option={option}
  className="wind-chart-echarts"
  style={{ width: "100%", padding: "0px" }}
/>

        </div>
      </Card.Body>
    </Card>
  );
};

export default WindChart;
