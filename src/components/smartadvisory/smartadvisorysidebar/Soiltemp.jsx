import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import logo from "../../../assets/image/93b11755de.png"; // Make sure your logo is in the correct path

const mockChartData = [
  { date: "D0", SoilMoisture: 35, SoilTemperature: 39 },
  { date: "D1", SoilMoisture: 29, SoilTemperature: 46 },
  { date: "D2", SoilMoisture: 31, SoilTemperature: 45 },
  { date: "D3", SoilMoisture: 31, SoilTemperature: 42 },
  { date: "D4", SoilMoisture: 34, SoilTemperature: 39 },
  { date: "D5", SoilMoisture: 32, SoilTemperature: 38 },
  { date: "D6", SoilMoisture: 30, SoilTemperature: 39 },
  { date: "D7", SoilMoisture: 33, SoilTemperature: 41 },
];

const Soiltemp = () => {
  const moistureColor = "#86D72F";
  const temperatureColor = "#80d3f7";

  return (
    <div className="bg-[#2d473b] text-white rounded-xl shadow-lg w-full h-full flex flex-col">
      {/* Header Row */}
      <div className="w-full flex justify-between items-start px-6 pt-6 pb-2">
        {/* Title + Legend */}
        <div>
          <h2 className="text-3xl font-bold mb-4">Soil Moisture & Temperature</h2>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-2 rounded-full" style={{ backgroundColor: moistureColor }}></span>
              <span className="text-sm">Soil moisture</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-2 rounded-full" style={{ backgroundColor: temperatureColor }}></span>
              <span className="text-sm">Soil Temperature</span>
            </div>
          </div>
        </div>
        {/* Logo */}
        <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={mockChartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid stroke="#ffffff20" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "white", fontSize: 14 }}
            axisLine={{ stroke: "white" }}
            tickLine={false}
          />
          <YAxis
            domain={[25, 50]}
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

export default Soiltemp;
