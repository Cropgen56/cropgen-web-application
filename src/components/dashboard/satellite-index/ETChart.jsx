import React from "react";
import ReactECharts from "echarts-for-react";
import "./ETChart.css";
import { Card } from "react-bootstrap";
import { useSelector } from "react-redux";

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
      },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 12, // Adjusted max to accommodate higher values like 5.36
      interval: 2,
      axisLabel: {
        formatter: "{value} mm",
        fontWeight: "bold",
        align: "left",
        padding: [0, 0, 0, 1],
      },
    },
    series: [
      {
        name: "Evapotranspiration",
        type: "line",
        data: evapotranspirationData,
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        itemStyle: { color: "#2ca02c" },
      },
    ],
  };

  return (
    <Card className="et-chart-card">
      <Card.Body>
        <div className="et-chart-heading">
          <h2 className="text-[20px]">Evapotranspiration</h2>
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
                <circle cx="5" cy="5" r="5" fill="#2ca02c" />
              </svg>
              Daily ET
            </p>
          </div>
        </div>
        <div className="et-info">
          <div>
            <p>ET High</p>
            <h2 className="text-[30px] font-bold">{maxEt} mm</h2>
            <p>{maxEtDate}</p>
          </div>
          <div className="ms-5">
            <p>ET Average</p>
            <h2 className="text-[30px] font-bold">{avgEt} mm</h2>
            <p>16-day average</p>
          </div>
        </div>
        <div className="et-chart-container">
          <ReactECharts
            option={option}
            className="et-chart-echarts"
            style={{ width: "100%", padding: "0px" }}
          />
        </div>
      </Card.Body>
    </Card>
  );
};

export default EvapotranspirationChart;
