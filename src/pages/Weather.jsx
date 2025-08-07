import axios from "axios";
import React, { useState, useEffect } from "react";
import RainChances from "../components/weather/rainchances/RainChances";
import WindSpeed from "../components/weather/wind/WindSpeed";
import Temperature from "../components/weather/temperature/Temperature";
import Humidity from "../components/weather/humidity/Humidity";
import WeekWeather from "../components/weather/weather/WeekWeather";
import WeatherHistory from "../components/weather/weatherhistory/WeatherHistory";
import "../style/weather.css";
import { useDispatch, useSelector } from "react-redux";

import { getFarmFields } from "../redux/slices/farmSlice";
import { fetchWeatherData } from "../redux/slices/weatherSlice/index";
import WeatherSidebar from "../components/weather/weathersidebar/WeatherSidebar";

const Weather = () => {
  // const [forecast, setForecast] = useState([]);
  // const apiKey = "55914755213187993587f0bcd665271b";
  // const lat = 19.076;
  // const lon = 72.8777;

  // useEffect(() => {
  //   const fetchWeather = async () => {
  //     try {
  //       const response = await axios.get(
  //         `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=55914755213187993587f0bcd665271b&units=metric`
  //       );

  //       const dailyData = response.data.list.reduce((acc, reading) => {
  //         const dateObj = new Date(reading.dt * 1000);
  //         const date = ` ${dateObj
  //           .toLocaleDateString("en-US", { weekday: "short" })
  //           .toLocaleUpperCase()} ${dateObj.getDate()} ${dateObj.toLocaleDateString(
  //           "en-US",
  //           { month: "short" }
  //         )}`;

  //         if (!acc[date]) {
  //           acc[date] = {
  //             temp: reading.main.temp,
  //             icon: reading.weather[0].icon,
  //             description: reading.weather[0].description,
  //           };
  //         }
  //         return acc;
  //       }, {});

  //       setForecast(Object.entries(dailyData).slice(0, 5));
  //     } catch (error) {
  //       console.error("Error fetching weather data:", error);
  //     }
  //   };

  //   fetchWeather();
  // }, [lat, lon, apiKey]);

    const dispatch = useDispatch();
    const user = useSelector((state) => state?.auth?.user);
    const fields = useSelector((state) => state?.farmfield?.fields);
    const userId = user?.id;

      useEffect(() => {
        if (userId) {
          dispatch(getFarmFields(userId));
        }
      }, [dispatch, userId]);



  const { data, status, error } = useSelector((state) => state.weather);
  console.log(data);

  // State to control sidebar visibility
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Function to toggle sidebar visibility
  const toggleSidebarVisibility = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
 <div className="weather container-fluid m-0 p-0 w-full flex">
  {isSidebarVisible && <WeatherSidebar />}
  
<div className="weather-body ml-[320px] w-full h-screen overflow-y-auto overflow-x-hidden">
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
