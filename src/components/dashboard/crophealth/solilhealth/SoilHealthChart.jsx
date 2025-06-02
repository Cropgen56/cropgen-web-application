import React, { useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./SoilHealthChart.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchSoilData } from "../../../../redux/slices/satelliteSlice";

const SoilHealthChart = () => {
  const dispatch = useDispatch();
  const { soilData } = useSelector((state) => state.satellite);

  // Process soilData to aggregate by date and prepare for chart
  const processSoilData = (data) => {
    // Group data by date
    const groupedByDate = data.reduce((acc, entry) => {
      const date = entry.date;
      if (!acc[date]) {
        acc[date] = { moisture: [], temperature: [] };
      }
      acc[date].moisture.push(entry.Soil_Moisture.mean);
      acc[date].temperature.push(entry.Soil_Temperature.mean);
      return acc;
    }, {});

    // Calculate average for each date and format for chart
    const uniqueDates = Object.keys(groupedByDate).sort().slice(-7);
    return uniqueDates.map((date, index) => {
      const moistureValues = groupedByDate[date].moisture;
      const temperatureValues = groupedByDate[date].temperature;
      const avgMoisture =
        moistureValues.reduce((sum, val) => sum + val, 0) /
        moistureValues.length;
      const avgTemperature =
        temperatureValues.reduce((sum, val) => sum + val, 0) /
        temperatureValues.length;
      return {
        day: `D${index}`,
        date,
        moisture: avgMoisture.toFixed(2),
        temperature: avgTemperature.toFixed(2),
      };
    });
  };

  const chartData = soilData ? processSoilData(soilData) : [];

  return (
    <div className="soil-health-chart-container">
      <h2 className="soil-health-chart-title">Soil Health </h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <XAxis dataKey="day" tick={{ fill: "#666", fontSize: 12 }} />
          <YAxis
            axisLine={true}
            tick={false}
            domain={[
              0,
              Math.max(
                30,
                ...chartData.map((item) =>
                  Math.max(item.moisture, item.temperature)
                )
              ),
            ]}
          />
          <Legend
            align="right"
            verticalAlign="top"
            iconType="line"
            wrapperStyle={{ fontSize: 12, color: "#666" }}
          />
          <Area
            type="monotone"
            dataKey="moisture"
            name="Soil Moisture (%)"
            stroke="#00C4B4"
            fill="#00C4B4"
            fillOpacity={0.3}
          />
          <Area
            type="monotone"
            dataKey="temperature"
            name="Soil Temperature (°C)"
            stroke="#32CD32"
            fill="#32CD32"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SoilHealthChart;
