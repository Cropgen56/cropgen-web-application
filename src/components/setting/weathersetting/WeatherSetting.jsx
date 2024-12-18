import React, { useState } from "react";
import "./WeatherSetting.css";

const WeatherSettings = () => {
  const [isColdAlertEnabled, setIsColdAlertEnabled] = useState(false);
  const [alertMark, setAlertMark] = useState(0);

  const toggleColdAlert = () => {
    setIsColdAlertEnabled(!isColdAlertEnabled);
  };

  const handleAlertMarkChange = (event) => {
    setAlertMark(event.target.value);
  };
  return (
    <div className="weather-settings-container">
      <div className="weather-settings-header">
        <h2>Weather Settings</h2>
      </div>

      {/* Cold Alert Toggle */}
      <div className="alert-toggle ">
        <span className="label-text">Cold alert</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={isColdAlertEnabled}
            onChange={toggleColdAlert}
          />
          <span className="slider"></span>
        </label>
      </div>
      <div className="alert-mark">
        <label htmlFor="alert-mark">Alert Mark °C</label>
        <input
          type="number"
          id="alert-mark"
          value={alertMark}
          onChange={handleAlertMarkChange}
        />
      </div>
      {/* Hot Alert Toggle */}
      <div className="alert-toggle ">
        <span className="label-text">Heat alert</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={isColdAlertEnabled}
            onChange={toggleColdAlert}
          />
          <span className="slider"></span>
        </label>
      </div>
      <div className="alert-mark">
        <label htmlFor="alert-mark">Alert Mark °C</label>
        <input
          type="number"
          id="alert-mark"
          value={alertMark}
          onChange={handleAlertMarkChange}
        />
      </div>
      {/* Rainfall Alert Toggle */}
      <div className="alert-toggle ">
        <span className="label-text">Rainfall alert</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={isColdAlertEnabled}
            onChange={toggleColdAlert}
          />
          <span className="slider"></span>
        </label>
      </div>
      <div className="alert-mark">
        <label htmlFor="alert-mark">Alert Mark mm</label>
        <input
          type="number"
          id="alert-mark"
          value={alertMark}
          onChange={handleAlertMarkChange}
        />
      </div>
      {/* Wind Alert Toggle */}
      <div className="alert-toggle ">
        <span className="label-text">Wind alert</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={isColdAlertEnabled}
            onChange={toggleColdAlert}
          />
          <span className="slider"></span>
        </label>
      </div>
      <div className="alert-mark">
        <label htmlFor="alert-mark">Alert Mark m/s</label>
        <input
          type="number"
          id="alert-mark"
          value={alertMark}
          onChange={handleAlertMarkChange}
        />
      </div>
    </div>
  );
};

export default WeatherSettings;
