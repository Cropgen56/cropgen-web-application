import React, { useState } from "react";
// import "../style/Setting.css";
import SettingSidebar from "../components/setting/settingsidebar/SettingSidebar";
import PersonalInfo from "../components/setting/personalinfo/PersonalInfo"
import FarmSetting from "../components/setting/farmsetting/FarmSetting";

const Setting = () => {
  // for seleted field
  const [selectedOption, setSelectedOption] = useState("personalInfo");

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  return (
    <div className="bg-[#5A7C6B] h-full w-full container-fluid m-0 p-0 d-flex font-inter">
      <div>
        <SettingSidebar
          handleOptionClick={handleOptionClick}
          selectedOption={selectedOption}
        />
      </div>
      <div className="w-full">
        {selectedOption === "personalInfo" && <PersonalInfo />}
        {selectedOption === "farmSettings" && <FarmSetting />}
      </div>
    </div>
  );
};

export default Setting;
