import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
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

/* ================= CONSTANTS ================= */

const UPLOADED_LOGO = "/logo.png";

const DROPDOWN_OPTIONS = Object.freeze([
  { value: 1, label: "1 day" },
  { value: 3, label: "3 days" },
  { value: 5, label: "5 days" },
]);

const MOISTURE_COLOR = "#86D72F";
const TEMPERATURE_COLOR = "#80d3f7";

/* ================= HELPERS ================= */

const formatDateLabel = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

const buildChartData = (historicalWeather) => {
  const daily = historicalWeather?.daily;
  if (!daily?.time?.length) return [];

  const times = daily.time;
  const soilMoist = daily.soil_moisture_5cm ?? [];
  const soilTemp = daily.soil_temp_5cm ?? [];

  const len = Math.min(times.length, soilMoist.length, soilTemp.length);
  const result = new Array(len);

  for (let i = 0; i < len; i++) {
    const moisture = Number(soilMoist[i]);
    const temp = Number(soilTemp[i]);

    result[i] = {
      date: formatDateLabel(times[i]),
      SoilMoisture: Number.isFinite(moisture)
        ? +(moisture * 100).toFixed(1)
        : null,
      SoilTemperature: Number.isFinite(temp) ? +temp.toFixed(1) : null,
      rawDate: times[i],
    };
  }

  return result;
};

const sampleDataByStep = (data, step) => {
  if (!data.length || step <= 1) return data;

  const sampled = [];
  for (let i = 0; i < data.length; i += step) {
    sampled.push(data[i]);
  }

  const last = data[data.length - 1];
  if (sampled.at(-1)?.rawDate !== last.rawDate) {
    sampled.push(last);
  }

  return sampled;
};

/* ================= DROPDOWN ================= */

const CustomDropdown = React.memo(({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = useMemo(
    () => DROPDOWN_OPTIONS.find((o) => o.value === value),
    [value],
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = useCallback(
    (v) => {
      onChange(v);
      setOpen(false);
    },
    [onChange],
  );

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="bg-white text-[#2d473b] rounded-md px-4 py-2 font-medium text-sm flex items-center justify-between min-w-[120px] shadow-sm"
      >
        {selected?.label}
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-md shadow-lg z-10">
          {DROPDOWN_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => handleSelect(o.value)}
              className={`w-full text-left px-4 py-2 text-sm ${
                o.value === value
                  ? "bg-[#2d473b] text-white font-semibold"
                  : "hover:bg-gray-100 text-[#2d473b]"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

/* ================= MAIN COMPONENT ================= */

const Soiltemp = () => {
  const historicalWeather = useSelector((s) => s.weather?.historicalWeather);

  const [step, setStep] = useState(3);

  const fullData = useMemo(
    () => buildChartData(historicalWeather),
    [historicalWeather],
  );

  const chartData = useMemo(
    () => sampleDataByStep(fullData, step),
    [fullData, step],
  );

  return (
    <div className="bg-[#2d473b] text-white rounded-xl shadow-lg p-6 md:p-8 mb-2">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-[22px] font-bold mb-4">
            Soil Moisture & Temperature
          </h2>

          <div className="flex flex-wrap gap-6 items-center text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-8 h-2.5 rounded-full"
                style={{ background: MOISTURE_COLOR }}
              />
              Soil moisture (%)
            </div>

            <div className="flex items-center gap-2">
              <span
                className="w-8 h-2.5 rounded-full"
                style={{ background: TEMPERATURE_COLOR }}
              />
              Soil temperature (°C)
            </div>

            <div className="flex items-center gap-2">
              <span>Show every</span>
              <CustomDropdown value={step} onChange={setStep} />
            </div>
          </div>
        </div>

        <img
          src={UPLOADED_LOGO}
          alt="logo"
          className="w-14 h-14 object-contain"
        />
      </div>

      {/* Chart */}
      <div className="mt-4">
        {!chartData.length ? (
          <div className="h-[300px] flex items-center justify-center text-gray-300">
            No historical weather data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#ffffff20" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "#fff" }} />
              <YAxis yAxisId="left" tick={{ fill: "#fff" }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "#fff" }}
              />
              <Tooltip />
              <Legend />

              <Line
                yAxisId="left"
                dataKey="SoilMoisture"
                stroke={MOISTURE_COLOR}
                strokeWidth={3}
                connectNulls
              />
              <Line
                yAxisId="right"
                dataKey="SoilTemperature"
                stroke={TEMPERATURE_COLOR}
                strokeWidth={3}
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
