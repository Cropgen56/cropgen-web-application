import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Bar,
  Line,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

// Format ISO date → "24 Nov"
const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${d.toLocaleString("en", { month: "short" })}`;
};

// Convert your forecastData into chart data
const buildChartData = (forecastData) => {
  if (!forecastData?.time) return [];

  const { time, temp_max, temp_min, precipitation } = forecastData;

  const len = Math.min(
    time.length,
    temp_max?.length || 0,
    temp_min?.length || 0,
    precipitation?.length || 0
  );

  const arr = [];
  for (let i = 0; i < len; i++) {
    arr.push({
      date: formatDate(time[i]),
      maxTemp: temp_max[i],
      minTemp: temp_min[i],
      precipitation: precipitation[i],
    });
  }
  return arr;
};

const WeatherGraph = ({ forecastData }) => {
  const chartData = useMemo(() => {
    // your store shape: state.weather.forecastData.forecast
    const fc = forecastData?.forecast || forecastData;
    return buildChartData(fc);
  }, [forecastData]);

  if (!chartData?.length) {
    return (
      <div className="h-[200px] flex items-center justify-center text-gray-500">
        No Weather Forecast Available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="date" tick={{ fontSize: 10 }} />

        <YAxis
          yAxisId="left"
          domain={[(dataMin) => dataMin - 3, (dataMax) => dataMax + 3]}
          tick={{ fontSize: 10 }}
        />

        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, "auto"]}
          tick={{ fontSize: 10 }}
        />

        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 10 }} />

        {/* Precipitation (bars) */}
        <Bar
          yAxisId="right"
          dataKey="precipitation"
          barSize={10}
          fill="#2ecc71"
          name="Precipitation (mm)"
        />

        {/* Temperature Lines */}
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="maxTemp"
          stroke="#e74c3c"
          strokeWidth={2}
          dot={false}
          name="Max Temp (°C)"
        />

        <Line
          yAxisId="left"
          type="monotone"
          dataKey="minTemp"
          stroke="#3498db"
          strokeWidth={2}
          dot={false}
          name="Min Temp (°C)"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default WeatherGraph;
