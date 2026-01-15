// Setting.jsx
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronLeft, User, Tractor, CreditCard } from "lucide-react";
import SettingSidebar from "../components/setting/settingsidebar/SettingSidebar";
import PersonalInfo from "../components/setting/personalinfo/PersonalInfo";
import FarmSetting from "../components/setting/farmsetting/FarmSetting";
import Pricing from "../components/setting/pricing/Pricing";

// Settings Dropdown Component for Mobile/Tablet
const SettingsDropdown = ({ selectedOption, setSelectedOption }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { id: "personalInfo", label: "Personal Info", icon: User },
    { id: "farmSettings", label: "Farm Settings", icon: Tractor },
    { id: "pricing", label: "Pricing", icon: CreditCard },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionId) => {
    setSelectedOption(optionId);
    setIsOpen(false);
  };

  const currentOption = options.find((opt) => opt.id === selectedOption);
  const CurrentIcon = currentOption?.icon || User;

  return (
    <div className="w-[250px] relative z-[1000]" ref={dropdownRef}>
      {/* Selected Option Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#344e41] text-white px-4 py-2.5 rounded-md shadow hover:bg-[#2d4339] transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <ChevronLeft
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "-rotate-90" : ""
            }`}
          />
          <CurrentIcon className="w-4 h-4" />
          <span className="text-sm font-medium">
            {currentOption?.label || "Settings"}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-20 overflow-hidden border border-gray-200">
            {options.map((option) => {
              const isSelected = option.id === selectedOption;
              const Icon = option.icon;

              return (
                <div
                  key={option.id}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                    isSelected
                      ? "bg-[#344e41] text-white"
                      : "hover:bg-[#344e41]/10 text-[#344e41]"
                  }`}
                  onClick={() => handleSelect(option.id)}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

const Setting = () => {
  const [selectedOption, setSelectedOption] = useState("personalInfo");
  const [showSidebar, setShowSidebar] = useState(true);

  // Mobile/Tablet detection state
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(
    window.innerWidth < 1024
  );

  // Handle window resize for responsive detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobileOrTablet(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setShowSidebar(false);
  };

  // Render the content based on selected option
  const renderContent = () => {
    switch (selectedOption) {
      case "personalInfo":
        return <PersonalInfo setShowSidebar={setShowSidebar} />;
      case "farmSettings":
        return <FarmSetting setShowSidebar={setShowSidebar} />;
      case "pricing":
        return <Pricing setShowSidebar={setShowSidebar} />;
      default:
        return <PersonalInfo setShowSidebar={setShowSidebar} />;
    }
  };

  return (
    <div className="bg-[#5A7C6B] h-screen w-full m-0 p-0 flex font-inter overflow-hidden">
      {/* ===== DESKTOP VIEW ===== */}
      <div className="hidden lg:flex w-full h-full">
        {/* Desktop Sidebar */}
        {showSidebar && (
          <div className="h-full">
            <SettingSidebar
              handleOptionClick={handleOptionClick}
              selectedOption={selectedOption}
            />
          </div>
        )}

        {/* Desktop Content */}
        <div className="flex-1 flex items-center overflow-y-auto">
          {renderContent()}
        </div>
      </div>

      {/* ===== TABLET/MOBILE VIEW ===== */}
      <div className="lg:hidden flex-1 px-3 py-4 h-screen overflow-y-auto">
        {/* Mobile/Tablet Dropdown */}
        <div className="mb-4">
          <SettingsDropdown
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
          />
        </div>

        {/* Mobile/Tablet Content */}
        <div className="w-full">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Setting;