import React, { useRef } from "react";
import { Card } from "react-bootstrap";
import rainIcon from "../../../assets/image/Vector (1).png"; // raining
import sunIcon from "../../../assets/image/Vector (2).png"; // sunny
import cloudIcon from "../../../assets/image/Vector (2).png"; // clouds
import thundering from "../../../assets/image/Vector (4).png"; // thundering
import partiallyrainy from "../../../assets/image/Group 109.png"; // partially rainy

import "./WeekWeather.css";

const WeekWeather = ({ forecastData }) => {
  const scrollRef = useRef(null);

  if (!forecastData || !forecastData.forecast) return <p>Loading...</p>;

  const { forecast } = forecastData;
  const daysToShow = forecast.time.length;

  // Format date helper
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
    return `${dayNames[dateObj.getDay()]}, ${dateObj.getDate()} ${monthNames[dateObj.getMonth()]}`;
  };

  // Icon logic based on precip, cloud cover, and (optional) other data
  const getWeatherIcon = (precip, cloudCover, dayIndex) => {
    // Use your own logic and imported icons here

    // Example enhanced logic:
    if (precip > 10) return rainIcon; // heavy rain
    if (precip > 0 && precip <= 10) return partiallyrainy; // light rain
    if (cloudCover > 70) return cloudIcon; // cloudy
    if (cloudCover > 40) return partiallyrainy; // partly cloudy
    // For demonstration, randomly assign thundering on days divisible by 5
    if (dayIndex % 5 === 0 && precip > 0) return thundering;

    return sunIcon; // default sunny
  };

  // Scroll handler to scroll right by 200px
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  // Scroll handler to scroll left by 200px
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  return (
    <Card className="weekweather-card">
      <Card.Body>
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* Left scroll button */}
          <button
            onClick={scrollLeft}
            style={{
              fontSize: 20,
              padding: "6px 12px",
              marginRight: 8,
              cursor: "pointer",
            }}
            aria-label="Scroll left"
          >
            ◀
          </button>

          {/* Scrollable container */}
          <div
            ref={scrollRef}
            className="forecast-container"
            style={{
              display: "flex",
              overflowX: "auto",
              gap: "12px",
              flexGrow: 1,
              paddingBottom: 8,
            }}
          >
            {forecast.time.slice(0, daysToShow).map((dateStr, i) => {
              const maxTemp = Math.round(forecast.temp_max[i]);
              const minTemp = Math.round(forecast.temp_min[i]);
              const precipitation = forecast.precipitation[i];
              const cloudCover = forecast.cloud_cover[i];
              const icon = getWeatherIcon(precipitation, cloudCover, i);

              return (
                <div
                  className="day-card"
                  key={dateStr}
                  style={{
                    textAlign: "center",
                    minWidth: 100,
                    border: "1px solid #ccc",
                    borderRadius: 8,
                    padding: 8,
                    backgroundColor: "#f9f9f9",
                    flexShrink: 0,
                  }}
                >
                  <div
                    className="date"
                    style={{ fontWeight: "600", marginBottom: 6 }}
                  >
                    {formatDate(dateStr)}
                  </div>
                  <img
                    src={icon}
                    alt="Weather Icon"
                    className="icon"
                    style={{ width: 48, height: 48, marginBottom: 6 }}
                  />
                  <div className="temperature" style={{ marginBottom: 4 }}>
                    {minTemp}° - {maxTemp}°
                  </div>
                  <div className="rain" style={{ color: "#0066cc" }}>
                    {precipitation} mm
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right scroll button */}
          <button
            onClick={scrollRight}
            style={{
              fontSize: 20,
              padding: "6px 12px",
              marginLeft: 8,
              cursor: "pointer",
            }}
            aria-label="Scroll right"
          >
            ▶
          </button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default WeekWeather;
