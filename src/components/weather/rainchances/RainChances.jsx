import React from "react";
import ReactEcharts from "echarts-for-react";
import { Card } from "react-bootstrap";
import rainIcon from "../../../assets/image/Vector.png";

const RainChances = ({ forecastData, historicalData, dateRange }) => {
  // Use historical data if available, otherwise use forecast
  const dataSource = historicalData || forecastData?.forecast || {};
  const isHistorical = !!historicalData;

  // Historical ranges can span years — show every point (scrollable), not just the first 16.
  const rainData =
    dataSource?.rain && dataSource.rain.length > 0
      ? dataSource.rain
      : new Array(16).fill(0);

  const dateData = dataSource?.time ? dataSource.time : [];

  const formattedDates = dateData.map((dateStr) => {
    const dateObj = new Date(dateStr);
    return isHistorical
      ? `${dateObj.getDate()} ${dateObj.toLocaleString("default", { month: "short" })}`
      : `${dateObj.getDate()}`;
  });

  // Keep point spacing legible: widen the chart instead of cramming points together,
  // and let the wrapper scroll horizontally for long historical ranges.
  const MIN_PX_PER_POINT = 34;
  const chartMinWidth = Math.max(formattedDates.length * MIN_PX_PER_POINT, 100);

  // Large historical ranges (100s of points) get expensive to animate/draw per-point —
  // drop symbols/animation and let echarts downsample instead of laggy per-dot rendering.
  const LARGE_DATASET_THRESHOLD = 60;
  const isLarge = formattedDates.length > LARGE_DATASET_THRESHOLD;

  const currentDate = isHistorical && dateData.length > 0
    ? new Date(dateData[0])
    : forecastData?.current?.time
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

  const dayTemp = isHistorical
    ? (dataSource.temp_max?.[0] || 17)
    : (forecastData?.current?.apparent_temperature_max || 17);
  const nightTemp = isHistorical
    ? (dataSource.temp_min?.[0] || 11)
    : (forecastData?.current?.apparent_temperature_min || 11);
  const windDirection = "SE";
  const windSpeed = isHistorical
    ? (dataSource.wind_speed?.[0] || 25)
    : (forecastData?.current?.wind_speed || 25);
  const chanceOfRain = 50;
  const precipitation = isHistorical
    ? (dataSource.precipitation?.[0] || 5.2)
    : (forecastData?.current?.precipitation || 5.2);

  const options = {
    animation: !isLarge,
    grid: {
      // Fixed px (not %) so the margin stays small even when the chart is scroll-widened.
      left: 8,
      right: 12,
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
        interval: isLarge ? "auto" : 0,
        rotate: isLarge ? 30 : 0,
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
        itemStyle: { color: "#81D8EB" },
        ...(isLarge
          ? { showSymbol: false, sampling: "lttb" }
          : { symbol: "circle", symbolSize: 10 }),
      },
    ],
    tooltip: { trigger: "axis", formatter: "{b0}: {c0} mm" },
  };

  return (
    <Card className="mt-3 mx-2 rounded-lg shadow-md bg-white">
      <Card.Body>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[#344e41] text-[20px] font-bold">
            Rain Chances {isHistorical && <span className="text-sm text-gray-500">(Historical)</span>}
          </h2>
          <div className="flex gap-4">
            <p className="flex items-center gap-1 px-1 text-[#a7a5a5] text-xs">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-1">
                <circle cx="5" cy="5" r="5" fill="#81D8EB" />
              </svg>
              Rain Chances (%)
            </p>
            <p className="flex items-center gap-1 px-1 text-[#a7a5a5] text-xs">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-1">
                <circle cx="5" cy="5" r="5" fill="#1D31A8" />
              </svg>
              Rain Amount (mm)
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-[#344e41] text-[14px] lg:mx-8 border-b border-gray-300 pb-3">
          <div className="flex items-center gap-2 font-bold text-[#344E41]">
            <div className="text-md">
              <div>{dayName}</div>
              <div>{dayNumber} {monthName}</div>
            </div>
            <img src={rainIcon} alt="Rain Icon" style={{ width: 30, height: 30 }} />
          </div>

          <div className="border-l border-gray-300 pl-3 ml-3 text-center">
            <div className="font-semibold">{dayTemp}° Day</div>
            <div className="text-[#A7A5A5]">{nightTemp}° Night</div>
          </div>

          <div className="border-l border-gray-300 pl-3 ml-3 text-center">
            <div className="font-semibold">{windDirection}</div>
            <div className="text-[#A7A5A5]">{windSpeed} km/h</div>
          </div>

          <div className="border-l border-gray-300 pl-3 ml-3 text-center">
            <div className="font-semibold">{chanceOfRain}% Chance of rain</div>
          </div>

          <div className="border-l border-gray-300 pl-3 ml-3 text-center">
            <div className="font-semibold">{precipitation} mm</div>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <div style={{ width: `max(100%, ${chartMinWidth}px)` }}>
            <ReactEcharts
              option={options}
              className="rain-chances-chart mt-3"
              style={{ width: "100%", height: "200px" }}
            />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default RainChances;