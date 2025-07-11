// SoilHealthChart.jsx — compact height + scaling for tablet
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

  useEffect(() => {
    dispatch(fetchSoilData());
  }, [dispatch]);

  const processSoilData = (data) => {
    const groupedByDate = data.reduce((acc, entry) => {
      const date = entry.date;
      if (!acc[date]) acc[date] = { moisture: [], temperature: [] };
      acc[date].moisture.push(entry.Soil_Moisture.mean);
      acc[date].temperature.push(entry.Soil_Temperature.mean);
      return acc;
    }, {});

    return Object.keys(groupedByDate).sort().slice(-7).map((date, index) => {
      const moisture = groupedByDate[date].moisture;
      const temperature = groupedByDate[date].temperature;
      return {
        day: `D${index}`,
        date,
        moisture: (moisture.reduce((a, b) => a + b, 0) / moisture.length).toFixed(2),
        temperature: (temperature.reduce((a, b) => a + b, 0) / temperature.length).toFixed(2),
      };
    });
  };

  const chartData = soilData ? processSoilData(soilData) : [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white border border-gray-300 rounded-md p-2 text-center w-32">
          {payload.map((entry, i) => (
            <p key={i} className="text-gray-600 text-xs">
              {entry.name.includes("Moisture") ? "Moisture" : "Temp"}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-[500px] sm:max-w-[600px] md:max-w-[480px] md:scale-[0.95] md:pl-1 lg:max-w-[600px] mx-auto">
      <h2 className="text-left text-lg sm:text-xl font-semibold text-[#344E41] mb-2 sm:mb-3">
        Soil Health
      </h2>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <XAxis
            dataKey="day"
            tick={{ fill: "#4B5563", fontSize: 10 }}
          />
          <YAxis
            axisLine
            tick={false}
            domain={[0, Math.max(30, ...chartData.map((d) => Math.max(+d.moisture, +d.temperature)))]}
          />
          <Legend align="right" verticalAlign="top" iconType="line" wrapperStyle={{ fontSize: 10, color: "#4B5563" }} />
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