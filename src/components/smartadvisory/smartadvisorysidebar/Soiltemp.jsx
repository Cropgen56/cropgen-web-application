import React, { useMemo, useState, useRef, useEffect } from "react";
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
  const sampled = [];
  for (let i = 0; i < data.length; i += step) sampled.push(data[i]);
  const last = data[data.length - 1];
  if (!sampled.length || sampled[sampled.length - 1].rawDate !== last.rawDate) {
    sampled.push(last);
  }
  return sampled;
};

const CustomDropdown = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white text-[#2d473b] rounded-md px-4 py-2 font-medium text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-sm min-w-[120px] justify-between"
        aria-label="Select sampling step"
      >
        <span>{selectedOption?.label}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-md shadow-lg overflow-hidden z-10 border border-gray-200">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                option.value === value
                  ? "bg-[#2d473b] text-white font-semibold"
                  : "text-[#2d473b] hover:bg-gray-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Soiltemp = () => {
  const historicalWeather = useSelector((s) => s.weather?.historicalWeather);

  const fullData = useMemo(
    () => buildChartData(historicalWeather),
    [historicalWeather]
  );

  const [stepType, setStepType] = useState(3);

  const chartData = useMemo(
    () => sampleDataByStep(fullData, stepType),
    [fullData, stepType]
  );

  const moistureColor = "#86D72F";
  const temperatureColor = "#80d3f7";

  const dropdownOptions = [
    { value: 1, label: "1 day" },
    { value: 3, label: "3 days" },
    { value: 5, label: "5 days" },
  ];

  return (
    <div className="bg-[#2d473b] text-white rounded-xl shadow-lg w-full h-full flex flex-col p-6 md:p-8">
      <div className="w-full flex justify-between items-start mb-6">
        <div className="flex-1">
          <h2 className="text-[22px] font-bold mb-4">
            Soil Moisture & Temperature
          </h2>

          <div className="flex flex-wrap gap-6 items-center text-sm md:text-base">
            <div className="flex items-center gap-3">
              <span
                className="w-8 h-2.5 rounded-full"
                style={{ backgroundColor: moistureColor }}
              />
              <span>Soil moisture (%)</span>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="w-8 h-2.5 rounded-full"
                style={{ backgroundColor: temperatureColor }}
              />
              <span>Soil temperature (°C)</span>
            </div>

            <div className="ml-4 flex items-center gap-3">
              <label className="text-sm font-medium">Show every</label>
              <CustomDropdown
                value={stepType}
                onChange={setStepType}
                options={dropdownOptions}
              />
            </div>
          </div>
        </div>

        <img
          src={UPLOADED_LOGO}
          alt="logo"
          className="w-14 h-14 md:w-16 md:h-16 object-contain ml-6"
        />
      </div>

      <div className="mt-4">
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-200 text-lg">
            No historical weather data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 50, left: 20, bottom: 20 }}
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
                height={50}
                tickMargin={10}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                tick={{ fill: "white", fontSize: 12 }}
                axisLine={{ stroke: "white" }}
                tickLine={false}
                domain={[0, "dataMax + 5"]}
                width={50}
                tickMargin={8}
                label={{
                  value: "%",
                  angle: -90,
                  position: "insideLeft",
                  fill: "white",
                  dx: -10,
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "white", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                domain={["dataMin - 2", "dataMax + 2"]}
                width={50}
                tickMargin={8}
                label={{
                  value: "°C",
                  angle: 90,
                  position: "insideRight",
                  fill: "white",
                  dx: 10,
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
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
                itemStyle={{ color: "#000", padding: "4px 0" }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ color: "#fff", paddingBottom: "15px" }}
                iconSize={14}
                iconType="line"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="SoilMoisture"
                stroke={moistureColor}
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="SoilTemperature"
                stroke={temperatureColor}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
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