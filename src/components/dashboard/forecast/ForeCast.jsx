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

function ForeCast() {
  const [weatherData, setWeatherData] = useState(() => {
    const data = localStorage.getItem("weatherData");
    return data
      ? JSON.parse(data)
      : {
          currentConditions: {
            temp: null,
            humidity: null,
            pressure: null,
            windspeed: null,
            precipitation: null,
          },
          days: [],
        };
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const data = localStorage.getItem("weatherData");
      setWeatherData(
        data
          ? JSON.parse(data)
          : {
              currentConditions: {
                temp: null,
                humidity: null,
                pressure: null,
                windspeed: null,
                precipitation: null,
              },
              days: [],
            }
      );
    };

    window.addEventListener("storage", handleStorageChange);
    handleStorageChange();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const fahrenheitToCelsius = (fahrenheit) => {
    return fahrenheit ? Math.round(((fahrenheit - 32) * 5) / 9) : 0;
  };

  const getWeatherIcon = (temperature, condition) => {
    if (!condition && !temperature) return "🧊";
    if (condition?.toLowerCase()?.includes("rain")) return <RainCloude />;
    if (condition?.toLowerCase()?.includes("snow")) return "❄️";
    if (condition?.toLowerCase()?.includes("storm")) return <CloudeElectric />;
    if (
      condition?.toLowerCase()?.includes("clear") ||
      condition?.toLowerCase()?.includes("sunny")
    )
      return <Sun />;
    if (condition?.toLowerCase()?.includes("cloud")) return <RainSun />;
    if (condition?.toLowerCase()?.includes("fog")) return "🌫️";

    if (temperature >= 35) return <Sun />;
    if (temperature >= 25) return <Sun />;
    if (temperature >= 15) return <Cloudesun />;
    if (temperature >= 5) return <Cloudesun />;
    if (temperature >= -5) return "❄️";
    return "🧊";
  };

  const { currentConditions: weather = {}, days: weekForecast = [] } =
    weatherData;

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="mt-4 mb-3 bg-white p-3 sm:p-4 rounded-lg shadow-md">
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
      <div className="flex flex-col font-sans text-gray-800">
        <div className="flex justify-between items-center p-0 m-0">
          <h3 className="text-lg sm:text-xl font-bold text-[#344E41] pl-2">
            Forecast
          </h3>
          <Dots />
        </div>
        <div className="flex flex-row overflow-hidden">
          {/* Today's Weather */}
          <div className="flex flex-col items-center justify-center border-r border-[#344E41] text-center w-1/2 sm:w-2/5 md:w-1/3 lg:w-1/4 py-4 shrink-0">
            <h2 className="text-base sm:text-sm md:text-base text-[#A2A2A2] mb-3">
              Weather's Today
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center px-4 sm:px-5">
              <span className="text-2xl sm:text-xl md:text-2xl mr-0 sm:mr-2">
                {getWeatherIcon(
                  fahrenheitToCelsius(weather.temp),
                  weather.conditions
                )}
              </span>
              <div className="text-lg sm:text-base md:text-lg font-bold text-[#344E41]">
                {fahrenheitToCelsius(weather.temp)}°C
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center mx-auto w-full sm:w-auto mt-4 text-gray-600 text-sm sm:text-xs md:text-sm">
              <div className="flex items-center px-1">
                <WindSpeedIcon />
                <p>{weather.windspeed ?? "--"} km/h</p>
              </div>
              <div className="flex items-center px-1">
                <DropIcon />
                <p>{weather.humidity ?? "--"}%</p>
              </div>
              <div className="flex items-center px-1">
                <WaveIcon />
                <p>{weather.pressure ?? "--"} hPa</p>
              </div>
            </div>
          </div>
          {/* Weekly Weather */}
          <div className="w-1/2 sm:w-3/5 md:w-2/3 lg:w-3/4 pl-4 pt-2 overflow-x-auto no-scrollbar">
            <div className="flex flex-col">
              <h2 className="text-base sm:text-sm md:text-base text-[#A2A2A2] ps-4 py-0">
                This Week
              </h2>
              <div className="flex flex-row space-x-4 sm:space-x-6 md:space-x-8 justify-start">
                {weekForecast?.slice(0, 7).map((day, index) => (
                  <div
                    key={index}
                    className={`flex flex-col items-center text-center w-20 sm:w-24 md:w-28 rounded-lg p-2 sm:p-3 shrink-0 ${
                      day.isHighlighted || day.datetime === today
                        ? "bg-[#5A7C6B] text-white"
                        : ""
                    }`}
                  >
                    <div
                      className={`font-semibold mb-1 text-xs sm:text-sm ${
                        day.isHighlighted || day.datetime === today
                          ? "text-white"
                          : "text-black"
                      }`}
                    >
                      {new Date(day.datetime)
                        .toLocaleDateString("en-US", { weekday: "short" })
                        .toUpperCase()}
                    </div>
                    <div className="flex items-center w-full">
                      <span className="text-base sm:text-lg md:text-xl">
                        {getWeatherIcon(
                          fahrenheitToCelsius(day.temp),
                          day.description
                        )}
                      </span>
                      <span
                        className={`text-sm sm:text-base md:text-lg font-bold ml-2 ${
                          day.isHighlighted || day.datetime === today
                            ? "text-white"
                            : "text-[#344E41]"
                        }`}
                      >
                        {fahrenheitToCelsius(day.temp)}°C
                      </span>
                    </div>
                    <div
                      className={`mt-2 text-xs sm:text-sm font-bold ${
                        day.isHighlighted || day.datetime === today
                          ? "text-white"
                          : "text-[#5A7C6B]"
                      }`}
                    >
                      {day.precipprob ?? 0}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForeCast;
