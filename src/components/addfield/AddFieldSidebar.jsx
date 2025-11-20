import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchCrops } from "../../redux/slices/cropSlice";

const AddFieldSidebar = ({ saveFarm, markers, isTabletView }) => {
  const [farmName, setFarmName] = useState("");
  const [cropName, setCropName] = useState("");
  const [variety, setVariety] = useState("");
  const [sowingDate, setSowingDate] = useState("");
  const [typeOfIrrigation, setTypeOfIrrigation] = useState("");
  const [typeOfFarming, setTypeOfFarming] = useState("");
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const toggleSidebarVisibility = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const dispatch = useDispatch();
  const { crops } = useSelector((state) => state.crops);

  useEffect(() => {
    dispatch(fetchCrops());
  }, [dispatch]);

  const handleAddField = () => {
    const today = new Date();
    if (!farmName.trim()) return message.error("Please enter the Farm Name.");
    if (!cropName.trim()) return message.error("Please select a Crop Name.");
    if (!variety.trim()) return message.error("Please enter the Variety.");
    if (!sowingDate.trim())
      return message.error("Please select the Sowing Date.");
    if (new Date(sowingDate) > today)
      return message.error("Sowing Date cannot be in the future.");
    if (!typeOfIrrigation.trim())
      return message.error("Please select the Type of Irrigation.");
    if (markers.length === 0) return message.warning("Please add Field !.");

    saveFarm({
      markers,
      cropName,
      variety,
      sowingDate,
      typeOfIrrigation,
      farmName,
      typeOfFarming,
    });

    // Reset all fields
    setFarmName("");
    setCropName("");
    setVariety("");
    setSowingDate("");
    setTypeOfIrrigation("");
    setTypeOfFarming("");
  };

  if (!isSidebarVisible) return null;

  return (
    <>
      {isTabletView ? (
        // 📱 Tablet View
        <div className="flex-1 flex flex-col justify-center items-center px-4 pb-4 text-[#344e41] z-[9999]">
          <div className="flex justify-center items-center p-2">
            <div className="w-full max-w-6xl bg-white shadow-lg rounded-xl p-6 mx-auto">
              <h5 className="text-[#344e41] mb-6 text-center text-lg font-bold ">
                Crop Details
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* FARM NAME */}
                <FormInput
                  label="Farm Name"
                  value={farmName}
                  onChange={setFarmName}
                  placeholder="Enter farm name"
                />
                {/* CROP NAME */}
                <CustomDropdown
                  label="Crop Name"
                  value={cropName}
                  onChange={setCropName}
                  options={crops.map((crop) => crop.cropName).sort((a, b) => a.localeCompare(b))}
                  placeholder="Select Crop Name"
                />
                {/* VARIETY */}
                <FormInput
                  label="Variety"
                  value={variety}
                  onChange={setVariety}
                  placeholder="Enter crop variety"
                />
                {/* SOWING DATE */}
                <CustomDatePicker
                  label="Sowing Date"
                  value={sowingDate}
                  onChange={setSowingDate}
                  placeholder="Select sowing date"
                  maxDate={new Date()} // Prevent future dates
                />
                {/* TYPE OF IRRIGATION */}
                <CustomDropdown
                  label="Type Of Irrigation"
                  value={typeOfIrrigation}
                  onChange={setTypeOfIrrigation}
                  options={["open-irrigation", "drip-irrigation", "sprinkler"]}
                  placeholder="Select Irrigation Type"
                />
                {/* TYPE OF FARMING */}
                <CustomDropdown
                  label="Type Of Farming"
                  value={typeOfFarming}
                  onChange={setTypeOfFarming}
                  options={["Organic", "Inorganic", "Integrated"]}
                  placeholder="Select Farming Type"
                />
              </div>

              <div className="mt-6">
                <button
                  className="w-full h-11 bg-[#344e41] hover:bg-[#2b3e33] text-white font-semibold mt-4 rounded-md transition-all duration-300"
                  onClick={handleAddField}
                >
                  Add Field
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // 🖥️ Desktop View
        <div className="w-[22vw] m-0 p-0 h-full">
          <div className="flex flex-row justify-between items-center border-b border-[#344e41] p-2.5 cursor-pointer">
            <h2 className="flex items-center gap-1 text-base text-[#344e41]">
              All Fields
            </h2>
            <ArrowLeft
              size={20}
              color="#344E41"
              strokeWidth={2}
              onClick={toggleSidebarVisibility}
            />
          </div>

          <div className="flex flex-col justify-between h-[calc(100vh-64px)]">
            <form className="p-3 text-[#344e41]">
              <h5 className="text-[#344e41] mb-3">Crop Details</h5>
              <div className="flex flex-col gap-2">
                <FormInput
                  label="Farm Name"
                  value={farmName}
                  onChange={setFarmName}
                  placeholder="Enter farm name"
                />
                <CustomDropdown
                  label="Crop Name"
                  value={cropName}
                  onChange={setCropName}
                  options={crops.map((crop) => crop.cropName).sort((a, b) => a.localeCompare(b))}
                  placeholder="Select Crop Name"
                />
                <FormInput
                  label="Variety"
                  value={variety}
                  onChange={setVariety}
                  placeholder="Enter crop variety"
                />
                <CustomDatePicker
                  label="Sowing Date"
                  value={sowingDate}
                  onChange={setSowingDate}
                  placeholder="Select sowing date"
                  maxDate={new Date()} // Prevent future dates
                />
                <CustomDropdown
                  label="Type Of Irrigation"
                  value={typeOfIrrigation}
                  onChange={setTypeOfIrrigation}
                  options={["open-irrigation", "drip-irrigation", "sprinkler"]}
                  placeholder="Select Irrigation Type"
                />
                <CustomDropdown
                  label="Type Of Farming"
                  value={typeOfFarming}
                  onChange={setTypeOfFarming}
                  options={["Organic", "Inorganic", "Integrated"]}
                  placeholder="Select Farming Type"
                />
              </div>
            </form>

            <footer className="flex justify-center">
              <button
                className="border-none outline-none rounded-md bg-[#344e41] text-white font-semibold w-3/4 h-9 transition-all duration-400 ease-in-out hover:bg-[#2b3e33]"
                onClick={handleAddField}
              >
                Add Field
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

// Reusable form input
const FormInput = ({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}) => (
  <div className="flex flex-col gap-1">
    <label className="font-semibold text-sm">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="border border-[#344e41] w-full outline-none rounded px-3 py-2 bg-[#344E41] text-white placeholder-gray-300 focus:ring-2 focus:ring-[#344e41] focus:ring-opacity-50"
    />
  </div>
);
// Custom Date Picker Component
const CustomDatePicker = ({ label, value, onChange, placeholder, maxDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const datePickerRef = useRef(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDateSelect = (day) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    const formattedDate = selectedDate.toISOString().split('T')[0];
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isDateDisabled = (day) => {
    if (!maxDate) return false;
    const checkDate = new Date(currentYear, currentMonth, day);
    return checkDate > maxDate;
  };

  const renderCalendar = () => {
    const totalDays = daysInMonth(currentMonth, currentYear);
    const startDay = firstDayOfMonth(currentMonth, currentYear);
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-6 w-6"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
      const isSelected = value && 
        new Date(value).getDate() === day &&
        new Date(value).getMonth() === currentMonth &&
        new Date(value).getFullYear() === currentYear;
      
      const isDisabled = isDateDisabled(day);
      const isToday = 
        new Date().getDate() === day &&
        new Date().getMonth() === currentMonth &&
        new Date().getFullYear() === currentYear;

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isDisabled && handleDateSelect(day)}
          disabled={isDisabled}
          className={`
            h-6 w-6 rounded text-xs flex items-center justify-center
            transition-all duration-150
            ${isSelected 
              ? 'bg-white text-[#344E41] font-bold' 
              : isToday
              ? 'bg-[#4a6b5a] text-white'
              : isDisabled
              ? 'text-gray-500 cursor-not-allowed'
              : 'text-white hover:bg-[#2b3e33]'
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="flex flex-col gap-1" ref={datePickerRef}>
      <label className="font-semibold text-sm">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-3 py-2 bg-[#344E41] text-white rounded
            border border-[#344e41] outline-none
            flex items-center justify-between
            hover:bg-[#2b3e33] transition-all duration-200
            focus:ring-2 focus:ring-[#344e41] focus:ring-opacity-50
            ${!value ? 'text-gray-300' : 'text-white'}
          `}
        >
          <span className="flex items-center gap-2">
            <Calendar size={14} />
            <span className="truncate text-sm">
              {value ? formatDisplayDate(value) : placeholder}
            </span>
          </span>
          <ChevronDown
            size={18}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Date Picker Calendar - Compact */}
        {isOpen && (
          <div className="absolute z-50 w-56 mt-1 bg-[#344E41] border border-[#2b3e33] rounded shadow-lg p-2">
            {/* Month/Year Navigation */}
            <div className="flex items-center justify-between mb-2 text-white">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-0.5 hover:bg-[#2b3e33] rounded transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="text-xs font-semibold">
                {monthNames[currentMonth].slice(0, 3)} {currentYear}
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-0.5 hover:bg-[#2b3e33] rounded transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Days of Week Headers */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={`${day}-${index}`} className="h-5 w-6 flex items-center justify-center text-xs text-gray-300">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-0.5">
              {renderCalendar()}
            </div>

            {/* Today Button */}
            <div className="mt-2 pt-2 border-t border-[#2b3e33]">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  setCurrentMonth(today.getMonth());
                  setCurrentYear(today.getFullYear());
                  handleDateSelect(today.getDate());
                }}
                className="w-full py-1 text-xs text-white bg-[#2b3e33] hover:bg-[#253429] rounded transition-colors"
              >
                Today
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};



// Custom Dropdown Component
const CustomDropdown = ({ label, value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  const formatOptionDisplay = (option) => {
    // Format the display text (e.g., "open-irrigation" -> "Open Irrigation")
    return option
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="flex flex-col gap-1" ref={dropdownRef}>
      <label className="font-semibold text-sm">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-3 py-2 bg-[#344E41] text-white rounded
            border border-[#344e41] outline-none
            flex items-center justify-between
            hover:bg-[#2b3e33] transition-all duration-200
            focus:ring-2 focus:ring-[#344e41] focus:ring-opacity-50
            ${!value ? 'text-gray-300' : 'text-white'}
          `}
        >
          <span className="truncate">
            {value ? formatOptionDisplay(value) : placeholder}
          </span>
          <ChevronDown
            size={20}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""
              }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-[#344E41] border border-[#2b3e33] rounded shadow-lg max-h-60 overflow-auto">
            {options.length > 0 ? (
              options.map((option, index) => (
                <div
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`
                    px-3 py-2 cursor-pointer text-white
                    hover:bg-[#2b3e33] transition-colors duration-150
                    ${value === option ? "bg-[#2b3e33]" : ""}
                    ${index !== options.length - 1 ? "border-b border-[#2b3e33]" : ""}
                  `}
                >
                  {formatOptionDisplay(option)}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-300">No options available</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddFieldSidebar;