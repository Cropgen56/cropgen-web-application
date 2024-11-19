import React from "react";
import ReactEcharts from "echarts-for-react";
import { Card } from "react-bootstrap";
import "./Humidity.css";

const Humidity = () => {
  const data = [70, 49, 72, 36, 71, 62, 70, 68, 79, 44, 69, 43];
  const data2 = [0, 70, 20, 16, 42, 30, 42, 38, 49, 27, 58, 14];
  const monthsData = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const options = {
    grid: {
      left: "0%",
      right: "0%",
      top: "14%",
      bottom: "0%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: monthsData,
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
        name: "Humidity, %",
        min: 0,
        max: 100,
        interval: 20,
        axisLine: { show: true },
        splitLine: {
          show: false,
          lineStyle: {
            color: "#e0e0e0",
            type: "solid",
          },
        },
        axisTick: { show: true },
        axisLabel: { color: "#000", formatter: "{value}%" },
      },
      {
        type: "value",
        name: "Dew Point, °C",
        min: -10,
        max: 35,
        interval: 5,
        axisLine: { show: true },
        axisTick: { show: true },
        splitLine: { show: false },
        axisLabel: { color: "#000", formatter: "{value}°C" },
      },
    ],
    series: [
      {
        name: "Humidity",
        data: data,
        type: "line",
        areaStyle: { color: "#0A94C080" },
        lineStyle: { color: "#0A94C080" },
        smooth: false,
        symbol: "circle",
        symbolSize: 0,
      },
      {
        name: "Dew Point",
        data: data2,
        type: "line",
        yAxisIndex: 1,
        areaStyle: { color: "#86D72FB2" },
        lineStyle: { color: "#86D72FB2" },
        smooth: false,
        symbol: "circle",
        symbolSize: 0,
      },
    ],
    tooltip: {
      trigger: "axis",
      formatter: (params) => {
        const humidity = params.find(
          (param) => param.seriesName === "Humidity"
        );
        const dewPoint = params.find(
          (param) => param.seriesName === "Dew Point"
        );
        return `${params[0].name}<br/>Humidity: ${humidity.value}%<br/>Dew Point: ${dewPoint.value}°C`;
      },
    },
  };

  return (
    <Card className="humidity-card">
      <Card.Body>
        <div className="humidity-chart-container">
          <ReactEcharts option={options} className="humidity-echarts" />
        </div>
      </Card.Body>
    </Card>
  );
};

export default Humidity;
