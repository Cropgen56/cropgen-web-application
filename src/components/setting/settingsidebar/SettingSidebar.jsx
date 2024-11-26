import React, { useState } from "react";
import { SettingDarkIcon } from "../../../assets/Icons";
import "./SettingSidebar.css";

const SettingSidebar = ({ handleOptionClick, selectedOption }) => {
  return (
    <div className="setting-sidebar">
      <div className="setting-sidebar-heading">
        <SettingDarkIcon />
        <h2>Setting</h2>
      </div>
      <div className="list-of-settings">
        <div
          className={`setting-option ${
            selectedOption === "personalInfo" ? "selected" : ""
          }`}
          onClick={() => handleOptionClick("personalInfo")}
        >
          Personal Info
        </div>
        <div
          className={`setting-option ${
            selectedOption === "weatherSettings" ? "selected" : ""
          }`}
          onClick={() => handleOptionClick("weatherSettings")}
        >
          Weather Settings
        </div>
      </div>
    </div>
  );
};

export default SettingSidebar;
