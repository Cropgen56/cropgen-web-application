import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const mockChartData = [
  { date: "D0", SoilMoisture: 35, SoilTemperature: 39 },
  { date: "D1", SoilMoisture: 29, SoilTemperature: 50 },
  { date: "D2", SoilMoisture: 28, SoilTemperature: 48 },
  { date: "D3", SoilMoisture: 33, SoilTemperature: 44 },
  { date: "D4", SoilMoisture: 31, SoilTemperature: 41 },
  { date: "D5", SoilMoisture: 32, SoilTemperature: 40 },
  { date: "D6", SoilMoisture: 27, SoilTemperature: 45 },
  { date: "D7", SoilMoisture: 30, SoilTemperature: 42 },
];

const Soilwaterindex = ({ isdownloading }) => {
  const chartData = useMemo(() => mockChartData, []);

  const isPDF = isdownloading === true;

  // Set consistent colors for PDF and screen view
  const moistureColor = "#86D72F"; // Green
  const temperatureColor = "#80d3f7"; // Blue

  return (
    <div
      className={`${
        isPDF ? "bg-white text-black" : "bg-[#2d473b] text-white"
      } p-4 rounded-xl shadow-lg w-full`}
    >
      <h2
        className={`text-xl font-bold px-4 ${
          isPDF ? "text-black" : "text-white"
        }`}
      >
        Soil Health
      </h2>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
          <CartesianGrid stroke={isPDF ? "#00000020" : "#ffffff20"} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fill: isPDF ? "black" : "white", fontSize: 14 }}
            axisLine={{ stroke: isPDF ? "black" : "white" }}
            tickLine={false}
          />
          <YAxis
            domain={[25, 55]}
            tickFormatter={(tick) => `${tick}%`}
            tick={{ fill: isPDF ? "black" : "white", fontSize: 14 }}
            axisLine={{ stroke: isPDF ? "black" : "white" }}
            tickLine={false}
          />
          <Tooltip
            formatter={(value, name) => [`${value}%`, name === "SoilMoisture" ? "Soil Moisture" : "Soil Temperature"]}
            labelStyle={{ color: "black" }}
            contentStyle={{ backgroundColor: "#fff", borderRadius: "8px" }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="line"
            wrapperStyle={{ color: isPDF ? "black" : "white", fontSize: 14 }}
          />
          <Line
            type="monotone"
            dataKey="SoilMoisture"
            stroke={moistureColor}
            strokeWidth={3}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="SoilTemperature"
            stroke={temperatureColor}
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Soilwaterindex;
