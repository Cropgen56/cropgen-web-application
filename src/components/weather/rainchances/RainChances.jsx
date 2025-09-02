import React from "react";
import ReactEcharts from "echarts-for-react";
import { Card } from "react-bootstrap";
import rainIcon from "../../../assets/image/Vector.png"; // path to your uploaded icon

const RainChances = ({ forecastData }) => {
  // Defensive fallbacks if data is missing
  const rainData =
    forecastData?.forecast?.rain && forecastData.forecast.rain.length > 0
      ? forecastData.forecast.rain.slice(0, 16)
      : new Array(16).fill(0);

  const dateData = forecastData?.forecast?.time
    ? forecastData.forecast.time.slice(0, 16)
    : [];

  // Format dates for xAxis: show all days (day number only)
  const formattedDates = dateData.map((dateStr) => {
    const dateObj = new Date(dateStr);
    return `${dateObj.getDate()}`;
  });

  // Extract today's current data from forecastData.current if present
  const currentDate = forecastData?.current?.time
    ? new Date(forecastData.current.time)
    : new Date();

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const dayName = dayNames[currentDate.getDay()];
  const dayNumber = currentDate.getDate();
  const monthName = monthNames[currentDate.getMonth()];

  // Example placeholders for day/night temp, wind, chance of rain, precipitation
  // Replace these with actual data fields if available
  const dayTemp = forecastData?.current?.apparent_temperature_max || 17;
  const nightTemp = forecastData?.current?.apparent_temperature_min || 11;
  const windDirection = "SE"; // Placeholder
  const windSpeed = forecastData?.current?.wind_speed || 25;
  const chanceOfRain = 50; // Placeholder
  const precipitation = forecastData?.current?.precipitation || 5.2;

  const options = {
    grid: {
      left: "2%",
      right: "2%",
      top: "14%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: formattedDates,
      axisLabel: {
        color: "#000",
        interval: 0,  // Show all labels
        rotate: 0,    // Keep horizontal (change to 15 or 30 if overlap)
        margin: 10,
        fontSize: 12,
      },
      axisTick: {
        alignWithLabel: true,
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: Math.max(...rainData) + 5,
      interval: 10,
      axisLabel: { color: "#000", margin: 15 },
      splitLine: { show: false },
    },
    series: [
      {
        data: rainData,
        type: "line",
        areaStyle: { color: "#81D8EB" },
        lineStyle: { color: "#81D8EB" },
        smooth: false,
        symbol: "circle",
        symbolSize: 10,
        itemStyle: { color: "#81D8EB" },
      },
    ],
    tooltip: { trigger: "axis", formatter: "{b0}: {c0} mm" },
  };

  return (
    <Card className="mt-3 mx-2 rounded-lg shadow-md bg-white">
      <Card.Body>

        {/* Chart heading */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[#344e41] text-[20px] font-bold">Rain Chances</h2>
          <div className="flex gap-4">
            <p className="flex items-center gap-1 px-1 text-[#a7a5a5] text-xs">
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

            <p className="flex items-center gap-1 px-1 text-[#a7a5a5] text-xs">
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
        {/* Details section below chart */}
        <div
          className="flex items-center justify-between text-[#344e41] text-[14px] lg:mx-8 border-b border-gray-300 pb-3"
        >
          {/* Date & icon */}
          <div className="flex items-center gap-2 font-bold text-[#344E41]" >
            <div className="text-md">
              <div>{dayName}</div>
              <div>{dayNumber} {monthName}</div>
            </div>
            <img
              src={rainIcon}
              alt="Rain Icon"
              style={{ width: 30, height: 30 }}
            />
          </div>

          {/* Day/Night Temp */}
          <div className="border-l border-gray-300 pl-3 ml-3 text-center">
            <div className="font-semibold">{dayTemp}° Day</div>
            <div className="text-[#A7A5A5]">{nightTemp}° Night</div>
          </div>

          {/* Wind */}
          <div className="border-l border-gray-300 pl-3 ml-3 text-center">
            <div className="font-semibold">{windDirection}</div>
            <div className="text-[#A7A5A5]">{windSpeed} km/h</div>
          </div>

          {/* Chance of rain */}
          <div className="border-l border-gray-300 pl-3 ml-3 text-center">
            <div className="font-semibold">{chanceOfRain}% Chance of rain</div>
          </div>

          {/* Precipitation */}
          <div className="border-l border-gray-300 pl-3 ml-3 text-center">
            <div className="font-semibold">{precipitation} mm</div>
          </div>
        </div>

        {/* Chart */}
        <ReactEcharts
          option={options}
          className="rain-chances-chart mt-3"
          style={{ width: "100%", height: "200px" }}
        />
      </Card.Body>
    </Card>
  );
};

export default RainChances;
