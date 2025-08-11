import React, { useState } from "react";
import ReactEcharts from "echarts-for-react";
import { Card } from "react-bootstrap";
import "./RainChances.css";

const generateTimeData = () => {
  const timeData = [];
  for (let hours = 0; hours < 24; hours++) {
    const time = `${hours === 0 || hours === 12 ? 12 : hours % 12}:00 ${
      hours < 12 ? "AM" : "PM"
    }`;
    timeData.push(time);
  }
  return timeData;
};

const timeData = generateTimeData();

const RainChances = ({ forecastData }) => {
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(8);

// if forecastData or rain is missing, fallback to empty array
  const rainData = (forecastData?.forecast?.rain && forecastData.forecast.rain.length > 0)
    ? forecastData.forecast.rain
    : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  // If your forecast rain array is longer than 24 or shorter, you may want to slice accordingly:
  // For this example, we take first 24 rain values to align with your timeData labels
  const rainValues = rainData.slice(0, 24);

  // Sliced timeData and rain data for current visible window
  const visibleTimes = timeData.slice(start, end);
  const visibleRain = rainValues.slice(start, end);

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
      data: visibleTimes,
      axisLabel: { color: "#000" },
    },
    yAxis: {
      type: "value",
      splitLine: { show: false },
      axisLabel: { color: "#000" },
    },
    series: [
      {
        data: visibleRain,
        type: "line",
        areaStyle: { color: "#81D8EB" },
        lineStyle: { color: "#81D8EB" },
        smooth: false,
        symbol: "circle",
        symbolSize: 10,
        itemStyle: { color: "#81D8EB" },
      },
    ],
    tooltip: { trigger: "axis", formatter: "{b0}: {c0}" },
  };

  // Scroll handlers (you can add scrollRight similarly if you want)
  const scrollLeft = () => {
    if (start > 0) {
      setStart(start - 1);
      setEnd(end - 1);
    }
  };

  const scrollRight = () => {
    if (end < timeData.length) {
      setStart(start + 1);
      setEnd(end + 1);
    }
  };

  return (
    <Card className="rain-chances-card">
      <Card.Body>
        <div className="rain-chances-container">
          {/* Your existing static layout and SVG icons here */}

          <div className="chart-heading">
            <h2 className="text-[20px]">Rain Chances</h2>
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
                Rain Chances (%)
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
                Rain Amount (mm)
              </p>
            </div>
          </div>

          {/* Add your top info block here unchanged */}

          <ReactEcharts option={options} className="rain-chances-chart" />

          <div className="scroll-buttons">
            <button onClick={scrollLeft} disabled={start === 0}>
              &lt; {/* or use LeftOutlined icon */}
            </button>
            <button onClick={scrollRight} disabled={end === timeData.length}>
              &gt;
            </button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default RainChances;
