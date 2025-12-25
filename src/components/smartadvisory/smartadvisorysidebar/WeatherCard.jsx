import React from "react";
import { useSelector } from "react-redux";
import WeatherGraph from "./WeatherGraph";

const WeatherCard = ({ isTablet = false }) => {
  const forecastData = useSelector((s) => s.weather?.forecastData || s.weather);

  // current summary (safe guards)
  const current = (forecastData && forecastData.current) || null;
  const todayIndex = 0;
  const forecast = forecastData?.forecast || forecastData?.daily || null;

  const displayTemp =
    (current &&
      (current.temp ?? current.temp_mean ?? current.apparent_temperature)) ||
    (Array.isArray(forecast?.temp_mean)
      ? `${forecast.temp_mean[todayIndex]}°C`
      : "N/A");

  const displayWind = (current && (current.wind_speed ?? "N/A")) || "N/A";
  const displayHumidity =
    (current && (current.relative_humidity ?? current.humidity ?? "N/A")) ||
    "N/A";
  const displayPressure =
    (current && (current.surface_pressure ?? "N/A")) || "N/A";

  return (
    <div className="bg-[#344e41] rounded-lg p-4 text-white w-full shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg md:text-[22px] font-semibold">Weather</h2>
      </div>

      <div className="bg-white rounded-md mt-3 p-2">
        <WeatherGraph
          forecastData={
            forecastData?.forecast || forecastData?.daily || forecastData
          }
        />
      </div>

      <div className="bg-white text-black mt-3 rounded-md px-3 py-2 flex flex-wrap justify-between items-center text-sm font-medium gap-2">
        <div className="flex items-center gap-2">
          <span>☀️ Today</span>
          <span className="font-semibold ml-1">{displayTemp}</span>
        </div>
        <div>💨 {displayWind} km/h</div>
        <div>💧 {displayHumidity}%</div>
        <div>🌡 {displayPressure} hPa</div>
      </div>
    </div>
  );
};

export default WeatherCard;
