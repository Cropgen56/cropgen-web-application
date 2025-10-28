import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
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
            <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl p-6">
              <h5 className="text-[#344e41] mb-6 text-center text-lg font-semibold mt-3">
                Crop Details
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  options={crops.map((crop) => crop.cropName)}
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
                <FormInput
                  label="Sowing Date"
                  type="date"
                  value={sowingDate}
                  onChange={setSowingDate}
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
                  className="w-full h-11 bg-[#344e41] hover:bg-[#2b3e33] text-white font-semibold mt-8 rounded-md transition-all duration-300"
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
                  options={crops.map((crop) => crop.cropName)}
                  placeholder="Select Crop Name"
                />
                <FormInput
                  label="Variety"
                  value={variety}
                  onChange={setVariety}
                  placeholder="Enter crop variety"
                />
                <FormInput
                  label="Sowing Date"
                  type="date"
                  value={sowingDate}
                  onChange={setSowingDate}
                  className="date-white text-white bg-[#344E41]"
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