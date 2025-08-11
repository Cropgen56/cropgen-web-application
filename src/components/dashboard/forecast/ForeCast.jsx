import React, { useState, useEffect } from "react";
import {
  DropIcon,
  RainCloudIcon,
  WaveIcon,
  WindSpeedIcon,
  Dots,
} from "../../../assets/DashboardIcons";
import {
  Sun,
  RainSun,
  CloudeElectric,
  Cloudesun,
  RainCloude,
} from "../../../assets/image/weather/index.js";
import { useSelector } from "react-redux";

function ForeCast() {
  const forecastData = useSelector((state) => state.weather.forecastData) || {};

  const [weatherData, setWeatherData] = useState({
    currentConditions: {
      temp: forecastData.current?.temp || null,
      humidity: forecastData.current?.relative_humidity || null,
      pressure: forecastData.current?.surface_pressure || null,
      windspeed: forecastData.current?.wind_speed || null,
      precipitation: forecastData.current?.precipitation || null,
    },
    days: forecastData.forecast
      ? forecastData.forecast.time.slice(0, 16).map((date, index) => ({
          datetime: date,
          temp: forecastData.forecast.temp_mean[index] || null,
          precipprob: forecastData.forecast.precipitation[index] || 0,
          description: null,
        }))
      : [],
  });

  useEffect(() => {
    setWeatherData({
      currentConditions: {
        temp: forecastData.current?.temp || null,
        humidity: forecastData.current?.relative_humidity || null,
        pressure: forecastData.current?.surface_pressure || null,
        windspeed: forecastData.current?.wind_speed || null,
        precipitation: forecastData.current?.precipitation || null,
      },
      days: forecastData.forecast
        ? forecastData.forecast.time.slice(0, 16).map((date, index) => ({
            datetime: date,
            temp: forecastData.forecast.temp_mean[index] || null,
            precipprob: forecastData.forecast.precipitation[index] || 0,
            description: null,
          }))
        : [],
    });
  }, [forecastData]);

  const getWeatherIcon = (temperature, cloudCover) => {
    if (!cloudCover && !temperature) return "🧊";
    if (cloudCover >= 90)
      return <RainCloude className="w-8 h-8 lg:w-11 lg:h-11" />;
    if (cloudCover >= 70)
      return <RainSun className="w-8 h-8 lg:w-11 lg:h-11" />;
    if (cloudCover >= 40) return <Cloudesun />;
    if (cloudCover < 40) return <Sun />;

    if (temperature >= 35) return <Sun />;
    if (temperature >= 25) return <Cloudesun />;
    if (temperature >= 15) return <Cloudesun />;
    if (temperature >= 5) return <Cloudesun />;
    if (temperature >= -5) return "❄️";
    return "🧊";
  };

  const { currentConditions: weather = {}, days: weekForecast = [] } =
    weatherData;

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="mt-4 mb-3 bg-white p-2.5 sm:p-4 rounded-lg shadow-md overflow-x-auto scrollbar-hide scroll-smooth no-scrollbar">
      <div className="flex flex-col font-sans text-gray-800">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg sm:text-xl font-bold text-[#344E41] pl-2">
            Forecast
          </h3>
          <Dots />
        </div>

        <div className="flex flex-row overflow-hidden">
          {/* Today's Weather */}
          <div className="flex flex-col gap-6 items-center justify-center border-r border-[#344E41] text-center w-1/3 lg:w-[25%] py-2 lg:py-4 lg:pr-2 pr-0.5 shrink-0">
            <h2 className="text-xs md:text-sm text-gray-400">
              Weather's Today
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 items-center justify-center px-4 sm:px-5">
              <span className="text-2xl sm:text-xl md:text-lg lg:text-2xl">
                {getWeatherIcon(
                  weather.temp,
                  forecastData.current?.cloud_cover
                )}
              </span>
              <div className="text-sm lg:text-xl font-bold text-[#344E41]">
                {weather.temp}°C
              </div>
            </div>
            <div className="flex flex-col gap-1 lg:gap-2 sm:flex-row justify-center w-full sm:w-auto text-gray-600">
              <div className="flex items-center gap-0.5 lg:gap-2">
                <WindSpeedIcon />
                <span className="text-[10px] lg:text-sm whitespace-nowrap">
                  {weather.windspeed ?? "--"} km/h
                </span>
              </div>
              <div className="flex items-center gap-0.5 lg:gap-2">
                <DropIcon />
                <span className="text-[10px] lg:text-sm whitespace-nowrap">
                  {weather.humidity ?? "--"}%
                </span>
              </div>
              <div className="flex items-center gap-0.5 lg:gap-2">
                <WaveIcon />
                <span className="text-[10px] lg:text-sm whitespace-nowrap">
                  {weather.pressure ?? "--"} hPa
                </span>
              </div>
            </div>
          </div>

          {/* Weekly Weather */}
          <div className="flex flex-col items-start justify-center w-2/3 lg:w-[70%] pl-4 pt-2 overflow-x-auto no-scrollbar">
            <div className="flex flex-col gap-2">
              <h2 className="text-xs md:text-sm text-gray-400">This Week</h2>
              <div className="flex flex-row gap-3.5 lg:gap-2 w-max lg:w-full">
                {weekForecast.map((day, index) => {
                  const icon = getWeatherIcon(
                    day.temp,
                    forecastData.forecast?.cloud_cover?.[index] ||
                      forecastData.current?.cloud_cover
                  );
                  const temperature = day.temp;
                  const isToday = day.datetime === today;

                  return (
                    <div
                      key={index}
                      className={`flex flex-col items-center gap-1 text-center w-24 lg:w-32 p-3 lg:p-3 rounded-lg shrink-0
                            ${isToday ? "bg-[#5A7C6B] text-white" : ""}`}
                    >
                      <div
                        className={`font-semibold mb-1 text-xs lg:text-sm ${
                          isToday ? "text-white" : "text-black"
                        }`}
                      >
                        {new Date(day.datetime)
                          .toLocaleDateString("en-US", {
                            weekday: "short",
                          })
                          .toUpperCase()}
                      </div>
                      <div className="flex items-center justify-center gap-1 w-full">
                        <span className="text-base sm:text-lg md:text-[12px] lg:text-xl">
                          {icon}
                        </span>
                        <span
                          className={`ml-1 text-xs lg:text-base font-bold ${
                            isToday ? "text-white" : "text-[#344E41]"
                          }`}
                        >
                          {temperature}°C
                        </span>
                      </div>
                      <div
                        className={`mt-2 text-xs lg:text-sm font-bold ${
                          isToday ? "text-white" : "text-[#5A7C6B]"
                        }`}
                      >
                        {day.precipprob ?? 0}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForeCast;
