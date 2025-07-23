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

//we hev to replcae with the actual data from the api
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

const Soilwaterindex = () => {
  const chartData = useMemo(() => mockChartData, []);

  return (
    <div className="bg-[#2d473b] p-2 rounded-xl shadow-lg w-full">
      <h2 className="text-white text-xl font-bold px-4">Soil Health</h2>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
          <CartesianGrid stroke="#ffffff20" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fill: "white", fontSize: 14 }}
            axisLine={{ stroke: "white" }}
            tickLine={false}
          />
          <YAxis
            domain={[25, 55]}
            tickFormatter={(tick) => `${tick}%`}
            tick={{ fill: "white", fontSize: 14 }}
            axisLine={{ stroke: "white" }}
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
            wrapperStyle={{ color: "white", fontSize: 14 }}
          />
          <Line
            type="monotone"
            dataKey="SoilMoisture"
            stroke="#86D72F"
            strokeWidth={3}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="SoilTemperature"
            stroke="#80d3f7"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Soilwaterindex;
