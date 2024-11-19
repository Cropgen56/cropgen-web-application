import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./SoilHealthChart.css";

const data = [
  { day: "D0", moisture: 0, temperature: 15 },
  { day: "D1", moisture: 10, temperature: 15 },
  { day: "D2", moisture: 6, temperature: 10 },
  { day: "D3", moisture: 13, temperature: 18 },
  { day: "D4", moisture: 8, temperature: 12 },
  { day: "D5", moisture: 12, temperature: 17 },
  { day: "D6", moisture: 2, temperature: 17 },
  { day: "D7", moisture: 13, temperature: 10 },
];

const SoilHealthChart = () => {
  return (
    <div className="soil-health-chart-container">
      <h2 className="soil-health-chart-title">Soil Health</h2>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a0d57e" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#a0d57e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorTemperature" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6ec5e9" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#6ec5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e0e0e0" horizontal={true} vertical={false} />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend verticalAlign="top" align="right" className="custom-legend" />
          <Area
            type="monotone"
            dataKey="moisture"
            stroke="#a0d57e"
            fillOpacity={1}
            fill="url(#colorMoisture)"
            name="Soil Moisture"
          />
          <Area
            type="monotone"
            dataKey="temperature"
            stroke="#6ec5e9"
            fillOpacity={1}
            fill="url(#colorTemperature)"
            name="Soil Temperature"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SoilHealthChart;
