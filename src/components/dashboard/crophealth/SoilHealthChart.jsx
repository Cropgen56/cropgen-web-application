import React from "react";
import { useSelector } from "react-redux";
import soilTemperature from "../../../assets/image/dashboard/soil-temperature.svg";
import soilMoisture from "../../../assets/image/dashboard/soil-moisture.svg";
import soilLayerImage from "../../../assets/image/dashboard/soil-layer.svg";
import leftVector from "../../../assets/image/dashboard/Vector 143.png";
import rightVector from "../../../assets/image/dashboard/Vector 144.png";
import soil_Temperature from "../../../assets/image/dashboard/soil-temperature1.svg";
import soil_Moisture from "../../../assets/image/dashboard/soil-moisture1.svg";

const SoilHealthChart = () => {
  const forecastData = useSelector((state) => state.weather.forecastData) || {};

  // Use forecastData.current for latest values
  const latestTemp2cm = forecastData.current?.soil_temperature_surface || "N/A"; // 2cm data (soil_temperature_surface is closest)
  const latestMoisture2cm =
    forecastData.current?.soil_moisture_surface || "N/A"; // 2cm data
  const latestTemp5cm = forecastData.current?.soil_temperature_5cm || "N/A"; // 5cm data
  const latestMoisture5cm = forecastData.current?.soil_moisture_5cm || "N/A"; // 5cm data
  const latestTemp15cm = forecastData.current?.soil_temperature_15cm || "N/A"; // 15cm data
  const latestMoisture15cm = forecastData.current?.soil_moisture_15cm || "N/A"; // 15cm data

  return (
    <div className="w-full max-w-[500px] sm:max-w-[600px] md:scale-[0.95] md:pl-1 lg:max-w-[600px] mx-auto bg-white p-4 rounded-2xl mt-3 ">

      <div className="flex items-center justify-end gap-2 md:gap-6 mt-4">
        <div className="flex items-center gap-1 md:gap-2 bg-[#344E41] border rounded-xl shadow-md p-2.5 w-42">
          <img
            src={soilTemperature}
            alt="Soil Temperature"
            className="w-5 lg:w-10 h-5 lg:h-10 object-contain"
          />
          <div className="flex flex-col gap-1 md:gap-2 items-center">
            <span className="text-white font-medium sm:whitespace-nowrap text-xs ">
              Soil Temperature
            </span>
            <span className="text-white font-bold text-md">
              {latestTemp2cm}°C
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2 bg-[#344E41] border rounded-xl shadow-md p-2.5 w-42">
          <img
            src={soilMoisture}
            alt="Soil Moisture"
            className="w-5 lg:w-10 h-5 lg:h-10 object-contain"
          />
          <div className="flex flex-col gap-1 md:gap-2 items-center">
            <span className="font-medium whitespace-nowrap text-xs text-white">
              Soil Moisture
            </span>
            <span className="text-white font-bold text-md">
              {latestMoisture2cm} m³/m³
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex flex-col items-center gap-1 w-[40%]">
          <h2 className="text-[#344E41] text-base font-bold text-center">
            Subsoil (5cm)
          </h2>
          <div className="flex flex-row gap-2 mb-2 mb:4">
            <div className="flex items-center gap-1 p-1.5">
              <img
                src={soil_Temperature}
                alt="Soil Temperature"
                className="w-5 lg:w-4 h-5 lg:h-4 object-contain"
              />
              <div className="flex flex-col gap-1 sm:gap-0 items-start">
                <span className="text-gray-600 font-medium text-xs whitespace-nowrap">
                  Soil Temperature
                </span>
                <span className="text-gray-900 font-semibold text-md">
                  {latestTemp5cm}°C
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 p-1.5">
              <img
                src={soil_Moisture}
                alt="Soil Moisture"
                className="w-5 lg:w-4 h-5 lg:h-4 object-contain"
              />
              <div className="flex flex-col gap-1 sm:gap-0 items-start">
                <span className="text-gray-600 font-medium text-xs whitespace-nowrap">
                  Soil Moisture
                </span>
                <span className="text-gray-900 font-semibold text-md">
                  {latestMoisture5cm} m³/m³
                </span>
              </div>
            </div>
          </div>

          <h2 className="text-[#344E41] font-bold text-base text-center">
            Parent Material (15cm)
          </h2>
          <div className="flex flex-row gap-4">
            <div className="flex items-center gap-1 sm:gap-0 p-1.5">
              <img
                src={soil_Temperature}
                alt="Soil Temperature"
                className="w-5 lg:w-4 h-5 lg:h-4 object-contain"
              />
              <div className="flex flex-col gap-1 items-start">
                <span className="text-gray-600 font-medium text-xs whitespace-nowrap">
                  Soil Temperature
                </span>
                <span className="text-gray-900 font-semibold text-md">
                  {latestTemp15cm}°C
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 p-1.5">
              <img
                src={soil_Moisture}
                alt="Soil Moisture"
                className="w-5 lg:w-4 h-5 lg:h-4 object-contain"
              />
              <div className="flex flex-col gap-1 sm:gap-0 items-start">
                <span className="text-gray-600 font-medium text-xs whitespace-nowrap">
                  Soil Moisture
                </span>
                <span className="text-gray-900 font-semibold text-md">
                  {latestMoisture15cm} m³/m³
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-[10%] flex justify-start lg:justify-center relative">
          <div className="relative w-[2px] h-[100px] bg-gray-300">
            <span className="absolute top-0 left-full w-4 h-[2px] bg-gray-300"></span>
            <span className="absolute top-1/2 left-full w-4 h-[2px] bg-gray-300 -translate-y-1/2"></span>
            <span className="absolute bottom-0 left-full w-4 h-[2px] bg-gray-300"></span>
          </div>
          <div className="absolute top-0 right-0 md:right-[-4px] ml-2 h-full flex flex-col justify-around gap-10">
            <span className="text-[10px] text-gray-600">5cm</span>
            <span className="text-[10px] text-gray-600">15cm</span>
          </div>
        </div>

        <div className="relative w-[50%] h-auto">
          <img
            src={soilLayerImage}
            alt="Soil Layer Graph"
            className="w-full h-[200px]"
          />
          <img
            src={leftVector}
            alt="left vector"
            className="absolute top-1 left-[25%] sm:left-[15%] w-18 h-18"
          />
          <img
            src={rightVector}
            alt="right vector"
            className="absolute top-0 right-[20%] sm:right-[15%] w-18 h-18"
          />
        </div>
      </div>
    </div>
  );
};

export default SoilHealthChart;