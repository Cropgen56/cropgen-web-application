import React from "react";
import "./SoilMoistureTemperature.css";
import soilTemperatureImage from "../../../../assets/image/pngimages/soil-temperature.png";
import { useDispatch, useSelector } from "react-redux";
import { fetchSoilMoisture } from "../../../../redux/slices/satelliteSlice";
import { useEffect } from "react";

const SoilMoistureTemperature = ({ selectedFieldsDetials }) => {
  const dispatch = useDispatch();

  const farmDetails = selectedFieldsDetials[0];

  useEffect(() => {
    dispatch(fetchSoilMoisture(farmDetails));
  }, [selectedFieldsDetials]);

  const { SoilMoisture } = useSelector((state) => state.satellite);

  // Destructure data from soilMoisture
  const { Soil_Moisture, Soil_Temperature } = SoilMoisture?.data || {};

  // Format the data or provide default values if unavailable
  const soilMoistureValue =
    Soil_Moisture?.Soil_Moisture_mean?.toFixed(1) || "N/A";
  const soilTemperatureValue =
    Soil_Temperature?.Soil_Temperature_mean?.toFixed(1) || "N/A";

  return (
    <div className="soil-info">
      {/* Soil Moisture Section */}
      <div className="soil-stat">
        <div className="icon-container">
          <img src={soilTemperatureImage} alt="Soil Moisture" />
        </div>
        <div className="data-container">
          <p>Soil Moisture</p>
          <strong>{soilMoistureValue}%</strong>
        </div>
      </div>

      {/* Soil Temperature Section */}
      <div className="soil-stat">
        <div className="icon-container">
          <img src={soilTemperatureImage} alt="Soil Temperature" />
        </div>
        <div className="data-container">
          <p>Soil Temperature</p>
          <strong>{soilTemperatureValue}°C</strong>
        </div>
      </div>
    </div>
  );
};

export default SoilMoistureTemperature;
