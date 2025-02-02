import React from "react";
import Card from "react-bootstrap/Card";
import "./ForeCast.css";
import {
  DropIcon,
  RainCloudIcon,
  WaveIcon,
  WindSpeedIcon,
} from "../../../assets/DashboardIcons";
import { Dots } from "../../../assets/DashboardIcons";
import { useSelector } from "react-redux";

function ForeCast() {
  const weather = JSON.parse(localStorage.getItem("weatherData"))
    ?.currentConditions || {
    temp: null,
    humidity: null,
    pressure: null,
    windspeed: null,
    precipitation: null,
  };

  function fahrenheitToCelsius(fahrenheit) {
    return ((fahrenheit - 32) * 5) / 9;
  }

  const weekForcast = JSON.parse(localStorage.getItem("weatherData")).days;

  const getWeatherIcon = (temperature, condition) => {
    if (condition.toLowerCase().includes("rain")) return "🌧️";
    if (condition.toLowerCase().includes("snow")) return "❄️";
    if (condition.toLowerCase().includes("storm")) return "⛈️";
    if (
      condition.toLowerCase().includes("clear") ||
      condition.toLowerCase().includes("sunny")
    )
      return "☀️";
    if (condition.toLowerCase().includes("cloud")) return "☁️";
    if (condition.toLowerCase().includes("fog")) return "🌫️";

    if (temperature >= 35) return "🔥";
    if (temperature >= 25) return "☀️";
    if (temperature >= 15) return "⛅";
    if (temperature >= 5) return "🌥️";
    if (temperature >= -5) return "❄️";
    return "🧊";
  };

  return (
    <Card body className="mt-4 mb-3 forecast shadow">
      <div className="forecast-container d-flex row">
        <div className="p-0 m-0 d-flex justify-content-between">
          {" "}
          <h3 className=" ps-2 float-start">Forecast</h3>
          <div>
            <Dots />
          </div>
        </div>
        <div className="d-flex">
          {/* todays weather */}{" "}
          <div className="forecast-today">
            <h2 className="mb-3">Weather's Today</h2>
            <div className="today-weather px-5">
              <span className="weather-icon">
                {" "}
                {getWeatherIcon(
                  Math.round(fahrenheitToCelsius(weather?.temp)),
                  weather?.conditions
                )}
              </span>
              <div className="temperature">
                {" "}
                {Math.round(fahrenheitToCelsius(weather?.temp)) || 30}°C
              </div>
            </div>
            <div className="today-details ">
              <div className="px-1">
                <WindSpeedIcon />
                <p>{weather?.windspeed} km/h</p>
              </div>
              <div className="px-1">
                <DropIcon />
                <p>{weather?.humidity}%</p>
              </div>
              <div className="px-1">
                <WaveIcon />
                <p>{weather?.pressure} h/pa</p>
              </div>
            </div>
          </div>
          {/* week weather */}
          <div className="week-weather">
            <div className="forecast-week w-100 py-2">
              <div className="forecast-week-heading">
                {" "}
                <h2 className="ps-4 py-0 float-start ">This Week</h2>
              </div>

              <div className="weather-data-container">
                {weekForcast?.slice(0, 6)?.map((day, index) => (
                  <div
                    key={index}
                    className={`day-forecast ${
                      day.isHighlighted ? "highlighted" : ""
                    }`}
                  >
                    <div
                      className={`day ${
                        day.isHighlighted ? "highlighted" : ""
                      } `}
                    >
                      {new Date(day.datetime)
                        .toLocaleDateString("en-US", { weekday: "short" })
                        .toUpperCase()}
                    </div>
                    <div className="icon w-100 m-0 p-0">
                      <span className="day-icon">
                        {getWeatherIcon(
                          Math.round(fahrenheitToCelsius(day?.temp)),
                          day?.description
                        )}
                      </span>
                      <span
                        className={`day-temperature ${
                          day.isHighlighted ? "highlighted" : ""
                        } `}
                      >
                        {Math.round(fahrenheitToCelsius(day?.temp))}°C
                      </span>
                    </div>
                    {/* <div className="temp"></div> */}
                    <div
                      className={`rani-chance  ${
                        day.isHighlighted ? "highlighted" : ""
                      } `}
                    >
                      {day.precipprob || 0}%
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
