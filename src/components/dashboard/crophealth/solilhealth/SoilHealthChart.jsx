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
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchSoilMoisture } from "../../../../redux/slices/satelliteSlice";

const data = [
  { day: "D0", moisture: 0, temperature: 0 },
  { day: "D1", moisture: 5, temperature: 10 },
  { day: "D2", moisture: 2, temperature: 8 },
  { day: "D3", moisture: 7, temperature: 12 },
  { day: "D4", moisture: 3, temperature: 6 },
  { day: "D5", moisture: 8, temperature: 14 },
  { day: "D6", moisture: 4, temperature: 8 },
  { day: "D7", moisture: 6, temperature: 10 },
];

const SoilHealthChart = ({ selectedFieldsDetials }) => {
  const dispatch = useDispatch();

  const farmDetails = selectedFieldsDetials[0];

  useEffect(() => {
    dispatch(fetchSoilMoisture(farmDetails));
  }, [selectedFieldsDetials]);

  const { SoilMoisture } = useSelector((state) => state.satellite);

  return (
    <div className="soil-health-chart-container">
      <h2 className="soil-health-chart-title">Soil Health</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 30, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            {/* Gradient for Soil Moisture */}
            <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A0D57E" stopOpacity={1} />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
            </linearGradient>
            {/* Gradient for Soil Temperature */}
            <linearGradient id="colorTemperature" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6EC5E9" stopOpacity={1} />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
            </linearGradient>
          </defs>
          {/* Enable horizontal grid lines */}
          <CartesianGrid stroke="#e0e0e0" horizontal={false} vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 8, fill: "#000000", fontWeight: 600 }}
            padding={{ top: 10 }}
          />
          <YAxis tick={false} axisLine={true} />
          <Tooltip />
          <Legend verticalAlign="top" align="right" className="custom-legend" />
          <Area
            type="monotone"
            dataKey="moisture"
            stroke="#A0D57E"
            fillOpacity={1}
            fill="url(#colorMoisture)"
            name="Soil Moisture"
          />
          <Area
            type="monotone"
            dataKey="temperature"
            stroke="#6EC5E9"
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
