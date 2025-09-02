import React, { useRef } from "react";
import rainIcon from "../../../assets/image/Vector (1).png";
import sunIcon from "../../../assets/image/Vector (2).png";
import cloudIcon from "../../../assets/image/Vector (2).png";
import thundering from "../../../assets/image/Vector (4).png";
import partiallyrainy from "../../../assets/image/Group 109.png";
import logo from "../../../assets/image/login/logo.svg";
import leftarrow from "../../../assets/image/mingcute_up-line.png";
import rightarrow from "../../../assets/image/Group (1).png";

const WeekWeather = ({ forecastData }) => {
  const scrollRef = useRef(null);

  if (!forecastData || !forecastData.forecast) {
    return (
      <div className="flex justify-center items-center h-[200px] [perspective:800px]">
        <img src={logo} alt="Loading..." className="w-[60px] h-[60px] animate-flip [transform-style:preserve-3d]" />
      </div>
    );
  }

  const { forecast } = forecastData;
  const daysToShow = forecast.time.length;

  const formatDate = (dateStr) => {
    const dateObj = new Date(dateStr);
    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${dayNames[dateObj.getDay()]}, ${dateObj.getDate()}${
      monthNames[dateObj.getMonth()]
    }`;
  };

  const getWeatherIcon = (precip, cloudCover, dayIndex) => {
    if (precip > 10) return rainIcon;
    if (precip > 0 && precip <= 10) return partiallyrainy;
    if (cloudCover > 70) return cloudIcon;
    if (cloudCover > 40) return partiallyrainy;
    if (dayIndex % 5 === 0 && precip > 0) return thundering;
    return sunIcon;
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  return (
    <div className="m-2">
      <div className="bg-white w-full border border-gray-300 rounded">
        {/* Navigation + Scrollable Cards */}
        <div className="flex items-start px-0 py-0 border-b border-gray-300">
          {/* Left button with underline */}
          <button
            onClick={scrollLeft}
            className="text-[10.5px] p-2 cursor-pointer flex-shrink-0 border-b border-gray-300 flex items-center justify-center"
            aria-label="Scroll left"
          >
            <img src={leftarrow} className="w-[21px]" alt="" />
          </button>

          {/* Forecast Cards */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto no-scrollbar flex-1"
          >
            {forecast.time.slice(0, daysToShow).map((dateStr, i) => {
              const maxTemp = Math.round(forecast.temp_max[i]);
              const minTemp = Math.round(forecast.temp_min[i]);
              const precipitation = forecast.precipitation[i];
              const cloudCover = forecast.cloud_cover[i];
              const icon = getWeatherIcon(precipitation, cloudCover, i);

              return (
                <div
                  key={dateStr}
                  className={`flex-shrink-0 flex flex-col items-center justify-center text-center pt-2 min-w-[120px] ${
                    i !== daysToShow - 1 ? "border-r border-gray-300" : ""
                  }`}
                >
                  {/* Date with underline */}
                  <p className="text-sm text-gray-500 mb-3 border-b border-gray-300 w-full pb-1">
                    {formatDate(dateStr)}
                  </p>
                  <img src={icon} alt="Weather Icon" className="w-8 h-8 mb-1" />
                  <p className="font-semibold">
                    {precipitation > 10
                      ? "Rain"
                      : precipitation > 0
                      ? "Partly Rain"
                      : cloudCover > 70
                      ? "Cloudy"
                      : "Sunny"}
                  </p>
                  <p className="text-sm">
                    {minTemp}° - {maxTemp}°
                  </p>
                  <p className="text-xs text-gray-500">{precipitation}mm</p>
                </div>
              );
            })}
          </div>

          {/* Right button with underline */}
          <button
            onClick={scrollRight}
            className="text-[10.5px] p-2 cursor-pointer flex-shrink-0 border-b border-gray-300 flex items-center justify-center"
            aria-label="Scroll left"
          >
            <img src={rightarrow} className="w-[21px]" alt="" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeekWeather;
