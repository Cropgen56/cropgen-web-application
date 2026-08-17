import React from "react";
import ReactEcharts from "echarts-for-react";

const Humidity = ({ forecastData, historicalData, dateRange }) => {
  // Use historical data if available, otherwise use forecast
  const dataSource = historicalData || forecastData?.forecast || {};
  const current = forecastData?.current || {};
  const isHistorical = !!historicalData;

  if (!forecastData && !historicalData) return <div>Loading...</div>;

  const dates = (dataSource.time || []).map((dateStr) => {
    const d = new Date(dateStr);
    return `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`;
  });

  const humidityData = dataSource.relative_humidity || [];

  // Keep point spacing legible: widen the chart instead of cramming points together,
  // and let the wrapper scroll horizontally for long historical ranges.
  const MIN_PX_PER_POINT = 34;
  const chartMinWidth = Math.max(dates.length * MIN_PX_PER_POINT, 100);

  // Large historical ranges (100s of points) get expensive to animate/draw per-point —
  // drop symbols/animation and let echarts downsample instead of laggy per-dot rendering.
  const LARGE_DATASET_THRESHOLD = 60;
  const isLarge = dates.length > LARGE_DATASET_THRESHOLD;

  const currentHumidity = isHistorical
    ? humidityData.length > 0
      ? humidityData[humidityData.length - 1]
      : "-"
    : current.relative_humidity ?? "-";

  const options = {
    animation: !isLarge,
    grid: {
      // Fixed px (not %) so the margin stays small even when the chart is scroll-widened.
      left: 8,
      right: 12,
      top: "14%",
      bottom: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: dates,
      axisLine: { show: true },
      axisLabel: {
        color: "#000",
        interval: isLarge ? "auto" : 0,
        rotate: 30,
        margin: 15,
        fontSize: 12,
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "#e0e0e0",
          type: "solid",
        },
      },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      interval: 20,
      axisLine: { show: true },
      axisTick: { show: true },
      axisLabel: { color: "#000", formatter: "{value}%" },
      splitLine: { show: false },
    },
    series: [
      {
        name: "Humidity",
        data: humidityData,
        type: "line",
        areaStyle: { color: "#0A94C080" },
        lineStyle: { color: "#0A94C080" },
        smooth: false,
        ...(isLarge
          ? { showSymbol: false, sampling: "lttb" }
          : { symbol: "circle", symbolSize: 4 }),
      },
    ],
    tooltip: {
      trigger: "axis",
      formatter: (params) => {
        const humidity = params.find((p) => p.seriesName === "Humidity");
        return `${params[0].name}<br/>Humidity: ${humidity?.value ?? "-"}%`;
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md mt-3 mx-2 mb-2">
      <div className="p-4">
        <h2 className="flex justify-start items-center text-[20px] font-bold text-[#344E41] mb-3">
          <span className="text-[20px] font-bold">
            Humidity %{" "}
            {isHistorical && (
              <span className="text-sm text-gray-500">(Historical)</span>
            )}
          </span>
        </h2>
        <div className="mb-3 text-[#344E41]">
          <p>{isHistorical ? "Avg Humidity" : "Current Humidity"}</p>
          <h2 className="text-[30px] font-bold">{currentHumidity}%</h2>
          {isHistorical && dateRange && (
            <p className="text-sm text-gray-500">
              {dateRange.startDate} to {dateRange.endDate}
            </p>
          )}
        </div>
        <div className="w-full overflow-x-auto">
          <div style={{ width: `max(100%, ${chartMinWidth}px)` }}>
            <ReactEcharts option={options} className="w-full h-[200px]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Humidity;
