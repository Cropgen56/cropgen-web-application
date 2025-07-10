import React, { useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import { fetchSoilData } from "../../../redux/slices/satelliteSlice";

const SoilHealthChart = () => {
  const dispatch = useDispatch();
  const { soilData } = useSelector((state) => state.satellite);

  // Process soilData to aggregate by date and prepare for chart
  const processSoilData = (data) => {
    const groupedByDate = data.reduce((acc, entry) => {
      const date = entry.date;
      if (!acc[date]) {
        acc[date] = { moisture: [], temperature: [] };
      }
      acc[date].moisture.push(entry.Soil_Moisture.mean);
      acc[date].temperature.push(entry.Soil_Temperature.mean);
      return acc;
    }, {});

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

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 rounded-md p-2 sm:p-3 md:p-2 text-center w-32 sm:w-36 md:w-32">
          {payload.map((entry, index) => (
            <p
              key={index}
              className="m-0 text-gray-600 text-xs sm:text-sm md:text-xs"
            >
              {entry.name === "Soil Moisture (%)"
                ? "Moisture"
                : "Temperature"}
              : {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full lg:max-w-[500px] sm:max-w-[600px] md:max-w-[269px] md:h-[125px] lg:mx-auto">
      <h2 className="text-left text-lg sm:text-xl md:text-lg font-semibold text-[#344E41] mb-2 sm:mb-3 md:mb-2">
        Soil Health
      </h2>
      <ResponsiveContainer
        width="100%"
        height={300} 
        className="md:!h-[240px]" 
      >
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <XAxis
            dataKey="day"
            tick={{ fill: "#4B5563", fontSize: 10 }}
            className="text-[10px] md:text-[9px]"
          />
          <YAxis
            axisLine={true}
            tick={false}
            domain={[
              0,
              Math.max(
                30,
                ...chartData.map((item) =>
                  Math.max(Number(item.moisture), Number(item.temperature))
                )
              ),
            ]}
          />
          <Legend
            align="right"
            verticalAlign="top"
            iconType="line"
            wrapperStyle={{
              fontSize: 10,
              color: "#4B5563",
            }}
          />
          <Tooltip content={<CustomTooltip />} />
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
