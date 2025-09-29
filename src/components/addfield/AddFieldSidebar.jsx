import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
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
  const { crops, loading, error } = useSelector((state) => state.crops);

  console.log("Crops from Redux:", crops);

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
                <FormSelect
                  label="Crop Name"
                  value={cropName}
                  onChange={setCropName}
                    options={crops.map((crop) => crop.cropName)} 
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
                <FormSelect
                  label="Type Of Irrigation"
                  value={typeOfIrrigation}
                  onChange={setTypeOfIrrigation}
                  options={["open-irrigation", "drip-irrigation", "sprinkler"]}
                />
                {/* TYPE OF FARMING */}
                <FormSelect
                  label="Type Of Farming"
                  value={typeOfFarming}
                  onChange={setTypeOfFarming}
                  options={["Organic", "Inorganic", "Integrated"]}
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
                <FormSelect
                  label="Crop Name"
                  value={cropName}
                  onChange={setCropName}
                    options={crops.map((crop) => crop.cropName)} 
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

                <FormSelect
                  label="Type Of Irrigation"
                  value={typeOfIrrigation}
                  onChange={setTypeOfIrrigation}
                  options={["open-irrigation", "drip-irrigation", "sprinkler"]}
                />
                <FormSelect
                  label="Type Of Farming"
                  value={typeOfFarming}
                  onChange={setTypeOfFarming}
                  options={["Organic", "Inorganic", "Integrated"]}
                />
              </div>
            </form>

            <footer className="flex justify-center">
              <button
                className="border-none outline-none rounded-md bg-[#344e41] text-white font-semibold w-3/4 h-9 transition-all duration-400 ease-in-out"
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

// 🔁 Reusable form input
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
      className="border border-[#344e41] w-full outline-none rounded px-3 py-2 bg-[#344E41] text-gray-300 placeholder-gray-300"
    />
  </div>
);

// 🔁 Reusable form select
const FormSelect = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1">
    <label className="font-semibold text-sm">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-[#344e41] w-full outline-none rounded px-3 py-2 bg-[#344E41] text-gray-300"
    >
      <option value="" disabled>
        Select {label}
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

// Full crop list used for desktop view


export default AddFieldSidebar;
