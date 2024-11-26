import React, { useState } from "react";
import "../style/Setting.css";
import SettingSidebar from "../components/setting/settingsidebar/SettingSidebar";
import PersonalInfo from "../components/setting/personalinfo/PersonalInfo";
import WeatherSettings from "../components/setting/weathersetting/WeatherSetting";
const Setting = () => {
  // for seleted field
  const [selectedOption, setSelectedOption] = useState("personalInfo");

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  return (
    <div className="setting container-fluid m-0 p-0 d-flex">
      <div>
        <SettingSidebar
          handleOptionClick={handleOptionClick}
          selectedOption={selectedOption}
        />
      </div>
      <div className="w-100">
        {selectedOption === "personalInfo" && <PersonalInfo />}
        {selectedOption === "weatherSettings" && <WeatherSettings />}
      </div>
    </div>
  );
};

export default Setting;
