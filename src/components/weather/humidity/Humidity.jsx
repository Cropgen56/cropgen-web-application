import React from "react";
import ReactEcharts from "echarts-for-react";

const Humidity = () => {
  const data = [70, 49, 72, 36, 71, 62, 70, 68, 79, 44, 69, 43];
  const data2 = [0, 70, 20, 16, 42, 30, 42, 38, 49, 27, 58, 14];
  const monthsData = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const options = {
    grid: {
      left: "10%",
      right: "10%",
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

        nameTextStyle: {
          fontSize: 20,
          fontWeight: "bold",
          color: "#000",
          padding: [0, 0, 0, 5],
        },
        min: 0,
        max: 100,
        interval: 20,
        axisLine: { show: true },
        axisTick: { show: true },
        axisLabel: { color: "#000", formatter: "{value}%" },
        splitLine: { show: false },
      },
      {
        type: "value",
     
        nameTextStyle: {
          fontSize: 20,
          fontWeight: "bold",
          color: "#000",
          padding: [0, 5, 0, 0],
        },
        min: -10,
        max: 35,
        interval: 5,
        axisLine: { show: true },
        axisTick: { show: true },
        axisLabel: { color: "#000", formatter: "{value}°C" },
        splitLine: { show: false },
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
        const humidity = params.find(p => p.seriesName === "Humidity");
        const dewPoint = params.find(p => p.seriesName === "Dew Point");
        return `${params[0].name}<br/>Humidity: ${humidity.value}%<br/>Dew Point: ${dewPoint.value}°C`;
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md mt-3 mx-2 mb-2">
      <div className="p-4">
        <h2 className="flex justify-between items-center text-[20px] font-bold text-[#344E41] mb-3">
          <span className="text-[20px] font-bold">Humidity %</span>
          <span className="text-[20px] font-bold">Dew Point,°C</span>
        </h2>
        <div className="w-full ">
          <ReactEcharts option={options} className="w-full h-[200px]" />
        </div>
      </div>
    </div>
  );
};

export default Humidity;
