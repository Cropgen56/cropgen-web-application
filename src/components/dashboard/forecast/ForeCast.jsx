import React, { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import "./ForeCast.css";
import {
  DropIcon,
  RainCloudIcon,
  WaveIcon,
  WindSpeedIcon,
  Dots,
} from "../../../assets/DashboardIcons";

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

  // Listen for changes in localStorage
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

    // Listen for storage events (triggered when localStorage changes in another tab/window)
    window.addEventListener("storage", handleStorageChange);

    // Also check localStorage on mount or when component updates
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
    if (condition?.toLowerCase()?.includes("rain")) return "🌧️";
    if (condition?.toLowerCase()?.includes("snow")) return "❄️";
    if (condition?.toLowerCase()?.includes("storm")) return "⛈️";
    if (
      condition?.toLowerCase()?.includes("clear") ||
      condition?.toLowerCase()?.includes("sunny")
    )
      return "☀️";
    if (condition?.toLowerCase()?.includes("cloud")) return "☁️";
    if (condition?.toLowerCase()?.includes("fog")) return "🌫️";

    if (temperature >= 35) return "🔥";
    if (temperature >= 25) return "☀️";
    if (temperature >= 15) return "⛅";
    if (temperature >= 5) return "🌥️";
    if (temperature >= -5) return "❄️";
    return "🧊";
  };

  const { currentConditions: weather = {}, days: weekForecast = [] } =
    weatherData;

  return (
    <Card body className="mt-4 mb-3 forecast shadow">
      <div className="forecast-container d-flex row">
        <div className="p-0 m-0 d-flex justify-content-between">
          <h3 className="ps-2 float-start">Forecast</h3>
          <Dots />
        </div>
        <div className="d-flex">
          {/* Today's Weather */}
          <div className="forecast-today">
            <h2 className="mb-3">Today's Weather</h2>
            <div className="today-weather px-5">
              <span className="weather-icon">
                {getWeatherIcon(
                  fahrenheitToCelsius(weather.temp),
                  weather.conditions
                )}
              </span>
              <div className="temperature">
                {fahrenheitToCelsius(weather.temp)}°C
              </div>
            </div>
            <div className="today-details">
              <div className="px-1">
                <WindSpeedIcon />
                <p>{weather.windspeed ?? "--"} km/h</p>
              </div>
              <div className="px-1">
                <DropIcon />
                <p>{weather.humidity ?? "--"}%</p>
              </div>
              <div className="px-1">
                <WaveIcon />
                <p>{weather.pressure ?? "--"} hPa</p>
              </div>
            </div>
          </div>
          {/* Weekly Weather */}
          <div className="week-weather">
            <div className="forecast-week w-100 py-2">
              <h2 className="ps-4 py-0 float-start">This Week</h2>
              <div className="weather-data-container">
                {weekForecast?.slice(0, 6).map((day, index) => (
                  <div
                    key={index}
                    className={`day-forecast ${
                      day.isHighlighted ? "highlighted" : ""
                    }`}
                  >
                    <div
                      className={`day ${
                        day.isHighlighted ? "highlighted" : ""
                      }`}
                    >
                      {new Date(day.datetime)
                        .toLocaleDateString("en-US", { weekday: "short" })
                        .toUpperCase()}
                    </div>
                    <div className="icon w-100 m-0 p-0">
                      <span className="day-icon">
                        {getWeatherIcon(
                          fahrenheitToCelsius(day.temp),
                          day.description
                        )}
                      </span>
                      <span
                        className={`day-temperature ${
                          day.isHighlighted ? "highlighted" : ""
                        }`}
                      >
                        {fahrenheitToCelsius(day.temp)}°C
                      </span>
                    </div>
                    <div
                      className={`rain-chance ${
                        day.isHighlighted ? "highlighted" : ""
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
    </Card>
  );
}

export default ForeCast;
