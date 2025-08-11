import React, { useState } from "react";
import SettingSidebar from "../components/setting/settingsidebar/SettingSidebar";
import PersonalInfo from "../components/setting/personalinfo/PersonalInfo";
import FarmSetting from "../components/setting/farmsetting/FarmSetting";

const Setting = () => {
  const [selectedOption, setSelectedOption] = useState("personalInfo");
  const [showSidebar, setShowSidebar] = useState(true); // NEW

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setShowSidebar(false); // Hide sidebar when any option is clicked
  };

  return (
    <div className="bg-[#5A7C6B] h-full w-full container-fluid m-0 p-0 d-flex font-inter">
      {showSidebar && (
        <div>
          <SettingSidebar
            handleOptionClick={handleOptionClick}
            selectedOption={selectedOption}
          />
        </div>
      )}
      <div className="w-full flex items-center">
        {selectedOption === "personalInfo" && (
          <PersonalInfo setShowSidebar={setShowSidebar} />
        )}
        {selectedOption === "farmSettings" && (
          <FarmSetting setShowSidebar={setShowSidebar} />
        )}
      </div>
    </div>
  );
};

export default Setting;

