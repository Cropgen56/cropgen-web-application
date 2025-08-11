import React from "react";
import ReactEcharts from "echarts-for-react";
import { Card } from "react-bootstrap";
import "./Temperature.css";

const Temperature = ({ forecastData }) => {
  if (!forecastData?.forecast) {
    return <p>Loading temperature data...</p>;
  }

  const { time, temp_max, temp_mean, temp_min } = forecastData.forecast;

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
      data: time,
      axisLine: { show: true },
      axisLabel: { color: "#000" },
    },
    yAxis: {
      type: "value",
      min: Math.min(...temp_min) - 2,
      max: Math.max(...temp_max) + 2,
      interval: 2,
      axisLine: { show: true },
      splitLine: { show: true },
      axisTick: { show: true },
      axisLabel: { color: "#9A9898", formatter: "{value}°C" },
    },
    series: [
      {
        name: "Max Temp",
        data: temp_max,
        type: "line",
        areaStyle: { color: "#F4BC58" },
        lineStyle: { color: "#F4BC58" },
        symbol: "circle",
        symbolSize: 4,
      },
      {
        name: "Mean Temp",
        data: temp_mean,
        type: "line",
        areaStyle: { color: "#86D72F" },
        lineStyle: { color: "#86D72F" },
        symbol: "circle",
        symbolSize: 4,
      },
      {
        name: "Min Temp",
        data: temp_min,
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
    <Card className="temperature-card">
      <Card.Body>
        <div className="temperature-chart-container">
          <div className="Temperature-heading">
            <h2>
              Temperature, <sup>°C</sup>
            </h2>
          </div>
          <ReactEcharts option={options} className="temperature-echarts" />
        </div>
      </Card.Body>
    </Card>
  );
};

export default Temperature;
