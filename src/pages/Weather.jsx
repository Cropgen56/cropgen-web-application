import axios from "axios";
import React, { useState, useEffect } from "react";
import RainChances from "../components/weather/rainchances/RainChances";
import WindSpeed from "../components/weather/wind/WindSpeed";
import Temperature from "../components/weather/temperature/Temperature";
import Humidity from "../components/weather/humidity/Humidity";
import WeekWeather from "../components/weather/weather/WeekWeather";
import WeatherHistory from "../components/weather/weatherhistory/WeatherHistory";
import "../style/weather.css";

const Weather = () => {
  const [forecast, setForecast] = useState([]);
  const apiKey = "55914755213187993587f0bcd665271b";
  const lat = 19.076;
  const lon = 72.8777;
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );

        const dailyData = response.data.list.reduce((acc, reading) => {
          const dateObj = new Date(reading.dt * 1000);
          const date = ` ${dateObj
            .toLocaleDateString("en-US", { weekday: "short" })
            .toLocaleUpperCase()} ${dateObj.getDate()} ${dateObj.toLocaleDateString(
            "en-US",
            { month: "short" }
          )}`;

          if (!acc[date]) {
            acc[date] = {
              temp: reading.main.temp,
              icon: reading.weather[0].icon,
              description: reading.weather[0].description,
            };
          }
          return acc;
        }, {});

        setForecast(Object.entries(dailyData).slice(0, 5));
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    fetchWeather();
  }, [lat, lon, apiKey]);
  // State to control sidebar visibility
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Function to toggle sidebar visibility
  const toggleSidebarVisibility = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="weather container-fluid m-0 p-0 w-100">
      {/* weather sidebar */}
      {isSidebarVisible && (
        <div className="weather-sidebar">
          <div className="weather-sidebar-heading">
            <svg
              width="35"
              height="35"
              viewBox="0 0 35 35"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.2948 28.4375H23.6921C23.9692 28.4376 24.236 28.5429 24.4384 28.7321C24.6409 28.9213 24.7641 29.1803 24.783 29.4567C24.8018 29.7332 24.7151 30.0065 24.5402 30.2215C24.3653 30.4365 24.1154 30.577 23.8408 30.6148L23.6921 30.625H11.2948C11.0177 30.6249 10.7509 30.5197 10.5484 30.3305C10.3459 30.1413 10.2228 29.8823 10.2039 29.6058C10.185 29.3294 10.2718 29.056 10.4467 28.841C10.6216 28.6261 10.8715 28.4855 11.146 28.4477L11.2948 28.4375ZM6.92708 24.0917H28.0729C28.3483 24.0943 28.6126 24.2006 28.813 24.3896C29.0133 24.5785 29.1351 24.836 29.1539 25.1108C29.1727 25.3856 29.0871 25.6573 28.9143 25.8717C28.7415 26.0861 28.4941 26.2275 28.2217 26.2675L28.0729 26.2777H6.92708C6.64997 26.2776 6.38321 26.1724 6.18072 25.9832C5.97823 25.794 5.8551 25.535 5.83621 25.2585C5.81732 24.9821 5.90409 24.7087 6.07896 24.4938C6.25384 24.2788 6.5038 24.1382 6.77833 24.1004L6.92708 24.0917ZM17.5 4.38086C22.1215 4.38086 24.7421 7.43898 25.1227 11.1329H25.2394C25.9458 11.1318 26.6456 11.2699 27.2987 11.5393C27.9518 11.8087 28.5454 12.2042 29.0455 12.7032C29.5457 13.2021 29.9426 13.7947 30.2136 14.4471C30.4846 15.0995 30.6244 15.799 30.625 16.5054C30.624 17.2117 30.484 17.9108 30.2128 18.5629C29.9416 19.2149 29.5446 19.8072 29.0445 20.3059C28.5444 20.8045 27.9509 21.1997 27.298 21.4689C26.6451 21.7382 25.9456 21.8762 25.2394 21.875H9.76062C9.0544 21.8762 8.35487 21.7382 7.70198 21.4689C7.04909 21.1997 6.45564 20.8045 5.95552 20.3059C5.4554 19.8072 5.05841 19.2149 4.78722 18.5629C4.51603 17.9108 4.37596 17.2117 4.375 16.5054C4.37577 15.7991 4.5157 15.0998 4.7868 14.4476C5.0579 13.7953 5.45487 13.2029 5.95501 12.7041C6.45515 12.2053 7.04866 11.81 7.70164 11.5406C8.35463 11.2713 9.05428 11.1333 9.76062 11.1344H9.87729C10.2594 7.41565 12.8785 4.38232 17.5 4.38232"
                fill="#344E41"
              />
            </svg>

            <h2>Weather</h2>
            <svg
              width="30"
              height="30"
              className="weather-sidebar-close-button"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              onClick={toggleSidebarVisibility}
              style={{ cursor: "pointer" }}
            >
              <g clipPath="url(#clip0_302_105)">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.3662 15.8835C10.1319 15.6491 10.0002 15.3312 10.0002 14.9998C10.0002 14.6683 10.1319 14.3504 10.3662 14.116L17.4375 7.04478C17.6732 6.81708 17.989 6.69109 18.3167 6.69393C18.6445 6.69678 18.958 6.82824 19.1898 7.06C19.4215 7.29176 19.553 7.60528 19.5558 7.93303C19.5587 8.26077 19.4327 8.57652 19.205 8.81228L13.0175 14.9998L19.205 21.1873C19.4327 21.423 19.5587 21.7388 19.5558 22.0665C19.553 22.3943 19.4215 22.7078 19.1898 22.9395C18.958 23.1713 18.6445 23.3028 18.3167 23.3056C17.989 23.3085 17.6732 23.1825 17.4375 22.9548L10.3662 15.8835Z"
                  fill="#344E41"
                />
              </g>
              <defs>
                <clipPath id="clip0_302_105">
                  <rect
                    width="30"
                    height="30"
                    fill="white"
                    transform="matrix(0 -1 1 0 0 30)"
                  />
                </clipPath>
              </defs>
            </svg>
          </div>

          <div className="field">
            <div>
              <h2>Field</h2>
              <div className="field-info">
                <svg
                  width="71"
                  height="71"
                  viewBox="0 0 71 71"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.4575 2L2 31.3618L47.3503 69L56.0102 67.6206L67.7466 59.9353L69 50.8706L11.4575 2Z"
                    stroke="#344E41"
                    stroke-width="2"
                  />
                </svg>
                <div>
                  <h4>Field 1</h4>
                  <p className="ha">0.12ha</p>
                  <div className="field-details">
                    <p>24.154 N</p>
                    <p>56.165 E</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Main weather body */}
      <div className="weather-body">
        <WeekWeather />
        <WeatherHistory />
        <RainChances />
        <WindSpeed />
        <Temperature />
        <Humidity />
      </div>
    </div>
  );
};

export default Weather;
