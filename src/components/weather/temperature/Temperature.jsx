import React from "react";
import ReactEcharts from "echarts-for-react";
import { Card } from "react-bootstrap";
import "./Temperature.css";

const Temperature = () => {
  const data = [35, 29, 22, 26, 31, 32, 27, 28, 30, 24, 34, 23];
  const data2 = [25, 19, 10, 15, 12, 20, 22, 12, 15, 27, 28, 14];
  const data3 = [0, 5, 8, 11, 7, 6, 4, 2, 19, 13, 18, 24];

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
      right: "2%",
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
    },
    yAxis: {
      type: "value",
      min: -10,
      max: 35,
      interval: 5,
      axisLine: { show: true },
      splitLine: { show: true },
      axisTick: { show: true },
      axisLabel: { color: "#9A9898", formatter: "{value}°C" },
    },
    series: [
      {
        data: data,
        type: "line",
        areaStyle: { color: "#F4BC58" },
        lineStyle: { color: "#F4BC58" },
        smooth: false,
        symbol: "circle",
        symbolSize: 0,
      },
      {
        data: data2,
        type: "line",
        areaStyle: { color: "#86D72F" },
        lineStyle: { color: "#86D72F" },
        smooth: false,
        symbol: "circle",
        symbolSize: 0,
      },
      {
        data: data3,
        type: "line",
        areaStyle: { color: "#4B970F" },
        lineStyle: { color: "#4B970F" },
        smooth: false,
        symbolSize: 0,
      },
    ],
    tooltip: {
      trigger: "axis",
      formatter: "{b0}: {c0}°C",
    },
  };

  return (
    <Card className="temperature-card">
      <Card.Body>
        <div className="temperature-chart-container">
          <div className="Temperature-heading">
            <h2>
              Temperature,<sup>o</sup>C
            </h2>
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
                  <circle cx="5" cy="5" r="5" fill="#87BD4B" />
                </svg>
                Min Temperature
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
                  <circle cx="5" cy="5" r="5" fill="#BFDA6D" />
                </svg>
                Average Temperature
              </p>
              <p>
                {" "}
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="me-1"
                >
                  <circle cx="5" cy="5" r="5" fill="#F9DDAB" />
                </svg>
                Max Temperature
              </p>
            </div>
          </div>
          <ReactEcharts option={options} className="temperature-echarts" />
        </div>
      </Card.Body>
    </Card>
  );
};

export default Temperature;
