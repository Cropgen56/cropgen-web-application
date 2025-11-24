import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useSelector } from "react-redux";

const UPLOADED_LOGO = "/logo.png";

const formatDateLabel = (isoDate) => {
  try {
    const d = new Date(isoDate);
    return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  } catch {
    return isoDate;
  }
};

const buildChartData = (historicalWeather) => {
  if (
    !historicalWeather ||
    !historicalWeather.daily ||
    !Array.isArray(historicalWeather.daily.time)
  )
    return [];

  const times = historicalWeather.daily.time || [];
  const soilMoist5 = historicalWeather.daily.soil_moisture_5cm || [];
  const soilTemp5 = historicalWeather.daily.soil_temp_5cm || [];

  const len = Math.min(times.length, soilMoist5.length, soilTemp5.length);
  const arr = [];
  for (let i = 0; i < len; i++) {
    const time = times[i];
    const moisture = Number(soilMoist5[i]);
    const temp = Number(soilTemp5[i]);
    const moisturePercent =
      Number.isFinite(moisture) && !isNaN(moisture)
        ? +(moisture * 100).toFixed(1)
        : null;
    arr.push({
      date: formatDateLabel(time),
      SoilMoisture: moisturePercent,
      SoilTemperature: Number.isFinite(temp) ? +temp.toFixed(1) : null,
      index: i,
      rawDate: time,
    });
  }
  return arr;
};

const sampleDataByStep = (data, step) => {
  if (!Array.isArray(data) || data.length === 0) return [];
  // always include the last data point for context
  const sampled = [];
  for (let i = 0; i < data.length; i += step) sampled.push(data[i]);
  const last = data[data.length - 1];
  if (!sampled.length || sampled[sampled.length - 1].rawDate !== last.rawDate) {
    sampled.push(last);
  }
  return sampled;
};

const Soiltemp = () => {
  const historicalWeather = useSelector((s) => s.weather?.historicalWeather);
  const fullData = useMemo(
    () => buildChartData(historicalWeather),
    [historicalWeather]
  );

  const [stepType, setStepType] = useState(3); // default 3-day step

  const chartData = useMemo(
    () => sampleDataByStep(fullData, stepType),
    [fullData, stepType]
  );

  const moistureColor = "#86D72F";
  const temperatureColor = "#80d3f7";

  return (
    <div className="bg-[#2d473b] text-white rounded-xl shadow-lg w-full h-full flex flex-col">
      <div className="w-full flex justify-between items-start px-6 pt-6 pb-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Soil Moisture & Temperature
          </h2>
          <div className="flex gap-4 items-center text-sm md:text-base">
            <div className="flex items-center gap-2">
              <span
                className="w-6 h-2 rounded-full"
                style={{ backgroundColor: moistureColor }}
              />
              <span>Soil moisture (%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-6 h-2 rounded-full"
                style={{ backgroundColor: temperatureColor }}
              />
              <span>Soil temperature (°C)</span>
            </div>

            <div className="ml-4 flex items-center gap-2">
              <label className="text-sm">Show every</label>
              <select
                value={stepType}
                onChange={(e) => setStepType(Number(e.target.value))}
                className="text-black rounded px-2 py-1"
                aria-label="Select sampling step"
              >
                <option value={1}>1 day</option>
                <option value={3}>3 days</option>
                <option value={5}>5 days</option>
              </select>
            </div>
          </div>
        </div>

        <img
          src={UPLOADED_LOGO}
          alt="logo"
          className="w-12 h-12 object-contain"
        />
      </div>

      <div className="px-4 pb-4">
        {chartData.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-gray-200">
            No historical weather data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 40, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                stroke="#ffffff20"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "white", fontSize: 12 }}
                axisLine={{ stroke: "white" }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                tick={{ fill: "white", fontSize: 12 }}
                axisLine={{ stroke: "white" }}
                tickLine={false}
                domain={[0, "dataMax + 5"]}
                label={{
                  value: "%",
                  angle: -90,
                  position: "insideLeft",
                  fill: "white",
                  dx: -8,
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "white", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                domain={["dataMin - 2", "dataMax + 2"]}
                label={{
                  value: "°C",
                  angle: 90,
                  position: "insideRight",
                  fill: "white",
                  dx: 8,
                }}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "SoilMoisture")
                    return [`${value}%`, "Soil Moisture"];
                  if (name === "SoilTemperature")
                    return [`${value}°C`, "Soil Temp"];
                  return [value, name];
                }}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{ backgroundColor: "#fff", borderRadius: 8 }}
                itemStyle={{ color: "#000" }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ color: "#fff" }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="SoilMoisture"
                stroke={moistureColor}
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="SoilTemperature"
                stroke={temperatureColor}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Soiltemp;
