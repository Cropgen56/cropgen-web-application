import React from "react";
import { useSelector } from "react-redux";
import { DropIcon, WaveIcon, WindSpeedIcon } from "../../../assets/DashboardIcons";
import { Sun, RainSun, Cloudesun, RainCloude } from "../../../assets/image/weather/index.js";

function ForeCast() {
  const forecastData = useSelector((state) => state.weather.forecastData) || {};

  const weatherData = {
    currentConditions: {
      temp: forecastData.current?.temp || null,
      humidity: forecastData.current?.relative_humidity || null,
      pressure: forecastData.current?.surface_pressure || null,
      windspeed: forecastData.current?.wind_speed || null,
      precipitation: forecastData.current?.precipitation || null,
      cloudCover: forecastData.current?.cloud_cover || 0,
    },
    days: forecastData.forecast
      ? forecastData.forecast.time.slice(0, 16).map((date, index) => ({
        datetime: date,
        temp: forecastData.forecast.temp_mean[index] || null,
        precipprob: forecastData.forecast.precipitation[index] || 0,
        cloudCover: forecastData.forecast.cloud_cover?.[index] || 0,
      }))
      : [],
  };

  const getWeatherIcon = (temperature, cloudCover) => {
    if (!cloudCover && !temperature) return "🧊";
    if (cloudCover >= 90) return <RainCloude className="w-8 h-8 lg:w-11 lg:h-11" />;
    if (cloudCover >= 70) return <RainSun className="w-8 h-8 lg:w-11 lg:h-11" />;
    if (cloudCover >= 40) return <Cloudesun />;
    if (cloudCover < 40) return <Sun />;

    if (temperature >= 35) return <Sun />;
    if (temperature >= 25) return <Cloudesun />;
    if (temperature >= 15) return <Cloudesun />;
    if (temperature >= 5) return <Cloudesun />;
    if (temperature >= -5) return "❄️";
    return "🧊";
  };

  const { currentConditions: weather = {}, days: weekForecast = [] } = weatherData;
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="mt-8">
      {/* Full-width Main Gradient Card */}
      <div className="relative  bg-gradient-to-br from-[#5A7C6B] to-[#344E41] rounded-2xl shadow-lg text-white flex flex-col overflow-hidden px-6 py-3">

        {/* Flex Container for Today's Weather + Scrollable Week */}
        <div className="relative z-10 flex items-start w-full gap-6 flex-col lg:flex-row">

          {/* Today's Weather */}
          <div className="flex flex-col items-center">
            <div className="p-[2px] rounded-xl bg-gradient-to-br from-[#6B9080] to-[#3D5A40] shadow-xl">
              <div className="bg-gradient-to-br from-[#6B9080] to-[#3D5A40] rounded-xl p-4 flex-shrink-0 w-[200px] flex flex-col items-center shadow-xl h-full">
                <h3 className="text-sm lg:text-base font-semibold mb-2">Today's Weather</h3>
                <div className="flex items-center justify-center mb-2 text-4xl text-white">
                  {getWeatherIcon(weather.temp, weather.cloudCover)}
                </div>
                <div className="text-2xl lg:text-3xl font-bold mb-2">
                  {weather.temp ?? "--"}°C
                </div>
                <div className="flex flex-col gap-2 text-xs lg:text-sm w-full">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <WindSpeedIcon /> {weather.windspeed ?? "--"} km/h
                    </span>
                    <span className="flex items-center gap-1">
                      <DropIcon /> {weather.humidity ?? "--"}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <WaveIcon /> {weather.pressure ?? "--"} hPa
                    </span>
                    <span>{weather.precipitation ?? "--"} mm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative z-10 flex items-start w-full gap-6">

            {/* Today's Weather (left) - unchanged */}

            <div className="flex flex-col flex-1 w-full"> {/* removed mt-10 */}
              {/* Weekly Weather Heading (left-aligned like cards) */}
              <h3 className="text-[22px] font-bold text-gray-200 mb-2 pl-2">
                Weekly Weather
              </h3>

              {/* Scrollable Forecast Cards */}
              <div className="flex overflow-x-auto no-scrollbar gap-4 py-2 w-full">
                {weekForecast.map((day, index) => {
                  const icon = getWeatherIcon(day.temp, day.cloudCover);
                  const isToday = day.datetime === today;

                  return (
                    <div
                      key={index}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl min-w-[130px] h-[150px] transition-all
              ${isToday ? "bg-[#344E41] text-white" : "bg-white/20 text-white"}
              flex-shrink-0`}
                    >
                      <span className="text-sm font-semibold mb-1">
                        {new Date(day.datetime).toLocaleDateString("en-US", { weekday: "short" })}
                      </span>
                      <span className="text-3xl mb-1">{icon}</span>
                      <span className="text-lg font-bold">{day.temp ?? "--"}°C</span>
                      <span className="text-sm mt-1">{day.precipprob ?? 0}%</span>
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
