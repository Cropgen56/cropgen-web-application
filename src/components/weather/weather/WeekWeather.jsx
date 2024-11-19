// import axios from "axios";
// import React, { useState, useEffect } from "react";
// import { Container, Row, Col, Card } from "react-bootstrap";

// const WeekWeather = () => {
//   const [forecast, setForecast] = useState([]);
//   const apiKey = "55914755213187993587f0bcd665271b";
//   const lat = 19.076;
//   const lon = 72.8777;

//   useEffect(() => {
//     const fetchWeather = async () => {
//       try {
//         const response = await axios.get(
//           `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
//         );

//         // Process the data to extract daily forecast data
//         const dailyData = response.data.list.reduce((acc, reading) => {
//           const dateObj = new Date(reading.dt * 1000);
//           const date = `${dateObj.toLocaleDateString("en-US", {
//             weekday: "short",
//           })} ${dateObj.getDate()} ${dateObj.toLocaleDateString("en-US", {
//             month: "short",
//           })}`;

//           // Only store the data for one reading per day (e.g., for noon or midnight)
//           if (!acc[date]) {
//             acc[date] = {
//               temp: reading.main.temp,
//               icon: reading.weather[0].icon,
//               description: reading.weather[0].description,
//               feelsLike: reading.main.feels_like,
//               pressure: reading.main.pressure,
//               humidity: reading.main.humidity,
//               windSpeed: reading.wind.speed,
//               clouds: reading.clouds.all,
//             };
//           }
//           return acc;
//         }, {});

//         // Only keep data for the next 7 days
//         setForecast(Object.entries(dailyData).slice(0, 7)); // 7 days of forecast data
//       } catch (error) {
//         console.error("Error fetching weather data:", error);
//       }
//     };

//     fetchWeather();
//   }, [lat, lon, apiKey]);

//   // WeatherDay component inside WeekWeather.js
//   const WeatherDay = ({ day, data }) => {
//     return (
//       <div className="weather-day">
//         <h3>{day}</h3>
//         <img
//           src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
//           alt={data.description}
//           className="weather-icon"
//         />
//         <p>{data.description}</p>
//         <p>Temperature: {Math.round((data.temp * 9) / 5 + 32)}°F</p>
//         <p>Feels Like: {Math.round((data.feelsLike * 9) / 5 + 32)}°F</p>
//         <p>Pressure: {data.pressure} hPa</p>
//         <p>Humidity: {data.humidity}%</p>
//         <p>Wind Speed: {data.windSpeed} m/s</p>
//         <p>Clouds: {data.clouds}%</p>
//       </div>
//     );
//   };

//   return (
//     <Container fluid style={{ background: "#5f7e6f", height: "100vh" }}>
//       <Row>
//         <Col md={9} className="content">
//           <Card style={{ marginTop: 20 }}>
//             <div className="weather-container">
//               <div className="forecast-wrapper">
//                 {forecast.map(([day, data], index) => (
//                   <WeatherDay key={index} day={day} data={data} />
//                 ))}
//               </div>
//             </div>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default WeekWeather;

import React from "react";
import "./WeekWeather.css";
import { Card } from "react-bootstrap";

const WeekWeather = () => {
  const forecastData = [
    {
      date: "SUN, 9 Jun",
      icon: "https://img.icons8.com/color/48/000000/rain--v1.png",
      temperature: "3° - 30°",
      rain: "40mm",
    },
    {
      date: "MON, 10 Jun",
      icon: "https://img.icons8.com/color/48/000000/sun.png",
      temperature: "10° - 30°",
      rain: "0mm",
    },
    {
      date: "TUE, 11 Jun",
      icon: "https://img.icons8.com/color/48/000000/rain--v1.png",
      temperature: "3° - 30°",
      rain: "40mm",
    },
    {
      date: "WED, 12 Jun",
      icon: "https://img.icons8.com/color/48/000000/storm.png",
      temperature: "5° - 30°",
      rain: "0mm",
    },
    {
      date: "THU, 13 Jun",
      icon: "https://img.icons8.com/color/48/000000/partly-cloudy-day--v1.png",
      temperature: "3° - 30°",
      rain: "0mm",
    },
    {
      date: "FRI, 14 Jun",
      icon: "https://img.icons8.com/color/48/000000/rain--v1.png",
      temperature: "3° - 30°",
      rain: "20mm",
    },
    {
      date: "SAT, 15 Jun",
      icon: "https://img.icons8.com/color/48/000000/sun.png",
      temperature: "3° - 30°",
      rain: "40mm",
    },
  ];

  return (
    <Card className="weekweather-card">
      {" "}
      <Card.Body>
        <div className="forecast-container">
          {forecastData.map((day, index) => (
            <div className="day-card" key={index}>
              <div className="date">{day.date}</div>
              <img src={day.icon} alt="Weather Icon" className="icon" />
              <div className="temperature">{day.temperature}</div>
              <div className="rain">{day.rain}</div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default WeekWeather;
