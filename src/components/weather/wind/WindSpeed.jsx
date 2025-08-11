import React from "react";
import ReactECharts from "echarts-for-react";
import "./WindSpeed.css";
import { Card } from "react-bootstrap";

const WindChart = () => {
  const dateData = [
    "1 Aug",
    "2 Aug",
    "3 Aug",
    "4 Aug",
    "5 Aug",
    "6 Aug",
    "7 Aug",
  ];
  const windSpeedData1 = [3.2, 4.1, 2.8, 3.6, 4.0, 3.9, 4.5];
  const windSpeedData2 = [2.8, 3.6, 3.0, 4.2, 3.8, 3.4, 4.1];

  const option = {
    tooltip: { trigger: "axis" },
    grid: {
      left: "0%",
      right: "0%",
      top: "14%",
      bottom: "0%",
      containLabel: true,
    },
    xAxis: { type: "category", data: dateData },
    yAxis: {
      type: "value",
      min: 0,
      max: 8,
      interval: 2,
      axisLabel: { formatter: "{value}" },
    },
    series: [
      {
        name: "Wind Speed 1",
        type: "line",
        data: windSpeedData1,
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        itemStyle: { color: "#1f77b4" },
      },
      {
        name: "Wind Speed 2",
        type: "line",
        data: windSpeedData2,
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
        <div className="wind-chart-heading ">
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
              Wind High
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
              Wind Avg. High
            </p>
          </div>
        </div>
        <div className="wind-info">
          <div>
            <p>Wind Speed High</p>
            <h2 className="text-[30px] font-bold">7 mph</h2>
            <p>25/07/2024 4:35 PM</p>
          </div>
          <div className="ms-5">
            <p>Wind Speed Avg</p>
            <h2 className="text-[30px] font-bold">3 mph</h2>
            <p>25/07/2024 4:35 PM</p>
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
