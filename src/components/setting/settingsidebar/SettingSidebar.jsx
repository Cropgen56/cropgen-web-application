import React from "react";
import { SettingDarkIcon } from "../../../assets/Icons";

const SettingSidebar = ({ handleOptionClick, selectedOption }) => {
  return (
    <div className="w-[20vw] h-screen bg-white m-0 p-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-row justify-start items-center px-4 py-3 gap-2 border-b border-[#344e41]">
        <SettingDarkIcon />
        <h2 className="text-lg text-[#344e41] mb-0">Setting</h2>
      </div>

      {/* Option Buttons (no scrolling) */}
      <div className="cursor-pointer overflow-hidden">
        <div
          className={`text-center p-4 text-sm lg:text-lg font-bold transition duration-400 ease-in-out ${
            selectedOption === "personalInfo"
              ? "bg-[#5A7C6B] text-white"
              : "bg-white text-[#344E41]"
          }`}
          onClick={() => handleOptionClick("personalInfo")}
        >
          Personal Info
        </div>
        <div
          className={`text-center p-4 text-sm lg:text-lg font-bold border-b border-[#344E4166] transition duration-400 ease-in-out ${
            selectedOption === "farmSettings"
              ? "bg-[#5a7c6b] text-white"
              : "bg-white text-[#344E41]"
          }`}
          onClick={() => handleOptionClick("farmSettings")}
        >
          Farm Settings
        </div>
      </div>
    </div>
  );
};

export default SettingSidebar;
