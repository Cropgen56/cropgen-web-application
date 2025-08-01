import React, { useState } from "react";
import { FieldIcon } from "../../assets/Globalicon";
// import "./AddFieldSidebar.css";
import cropename from "../../assets/cropname.json";
import { ArrowLeft, Calendar, ChevronDown } from "lucide-react";
import { message } from "antd";

const AddFieldSidebar = ({ saveFarm, markers }) => {
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Form state variables
  const [farmName, setFarmName] = useState("");
  const [cropName, setCropName] = useState("");
  const [variety, setVariety] = useState("");
  const [sowingDate, setSowingDate] = useState("");
  const [typeOfIrrigation, setTypeOfIrrigation] = useState("");
  const [typeOfFarming, setTypeOfFarming] = useState("");

  const toggleSidebarVisibility = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const fields = [
    { title: "Field 1", area: "0.12h", lat: "24.154", lon: "56.165" },
  ];

  const handleAddField = () => {
    const today = new Date();
    // Check if all required fields are filled
    if (!farmName.trim()) {
      message.error("Please enter the Farm Name.");
      return;
    }
    if (!cropName.trim()) {
      message.error("Please select a Crop Name.");
      return;
    }
    if (!variety.trim()) {
      message.error("Please enter the Variety.");
      return;
    }
    if (!sowingDate.trim()) {
      message.error("Please select the Sowing Date.");
      return;
    }
    const sowing = new Date(sowingDate);
    if (sowing > today) {
      message.error(
        "Sowing Date cannot be in the future. Please select a date on or before today."
      );
      return;
    }
    if (!typeOfIrrigation.trim()) {
      message.error("Please select the Type of Irrigation.");
      return;
    }

    if (markers.length === 0) {
      message.warning("Please add Field !.");
      return;
    }

    // If all fields are valid, save the farm
    saveFarm({
      markers,
      cropName,
      variety,
      sowingDate,
      typeOfIrrigation,
      farmName,
      typeOfFarming,
    });

    // Clear the form
    setFarmName("");
    setCropName("");
    setVariety("");
    setSowingDate("");
    setTypeOfIrrigation("");
    setTypeOfFarming("");
  };

  return (
    <>
      {isSidebarVisible && (
        <div className="w-[22vw] m-0 p-0 h-full">
          <div className="flex flex-row justify-between items-center border-b border-[#344e41] p-2.5 cursor-pointer">
            <h2 className="flex items-center gap-1 text-base text-[#344e41]">All Fields <ChevronDown size={20} color="#344E41" strokeWidth={2.5} /></h2>
            <ArrowLeft size={20} color="#344E41" strokeWidth={2} onClick={toggleSidebarVisibility}/>
          </div>

          {/* Crop Details Form */}
          <div className="flex flex-col justify-between h-[calc(100vh-64px)]">
            <form className="p-3 text-[#344e41]">
              <h5 className=" text-[#344e41] mb-3">Crop Details </h5>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1 cursor-pointer">
                  <label htmlFor="farm-name"className="text-[#344e41] font-semibold text-sm"> Farm Name</label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="Enter farm name"
                    className="border border-[#344e41] w-[90%] outline-none rounded px-2 py-1 bg-[#344E41] placeholder-gray-300 text-gray-300"
                  />
                </div>
                <div className=" flex flex-col gap-1 cursor-pointer">
                  <label htmlFor="cropName" className="text-[#344e41] font-semibold text-sm">Crop Name</label>
                  <select
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="select border border-[#344e41] w-[90%] outline-none rounded px-2 py-1 bg-[#344E41] text-gray-300"
                  >
                    <option value="" disabled>
                      Select Crop
                    </option>
                    <option value="Barley">Barley</option>
                    <option value="Wheat">Wheat</option>
                    <option value="PearlMillet">Pearl Millet</option>
                    <option value="Sorghum">Sorghum</option>
                    <option value="FingerMillet">Finger Millet</option>
                    <option value="Chickpea">Chickpea</option>
                    <option value="RedGram">Red Gram</option>
                    <option value="GreenGram">Green Gram</option>
                    <option value="BlackGram">Black Gram</option>
                    <option value="Lentil">Lentil</option>
                    <option value="FieldPea">Field Pea</option>
                    <option value="HorseGram">Horse Gram</option>
                    <option value="Cowpea">Cowpea</option>
                    <option value="Groundnut">Groundnut</option>
                    <option value="Mustard">Mustard</option>
                    <option value="Soybean">Soybean</option>
                    <option value="Sunflower">Sunflower</option>
                    <option value="Sesame">Sesame</option>
                    <option value="Linseed">Linseed</option>
                    <option value="Castor">Castor</option>
                    <option value="Safflower">Safflower</option>
                    <option value="Niger">Niger</option>
                    <option value="Sugarcane">Sugarcane</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Jute">Jute</option>
                    <option value="Tobacco">Tobacco</option>
                    <option value="Potato">Potato</option>
                    <option value="Tomato">Tomato</option>
                    <option value="Brinjal">Brinjal</option>
                    <option value="Cabbage">Cabbage</option>
                    <option value="Cauliflower">Cauliflower</option>
                    <option value="Onion">Onion</option>
                    <option value="Garlic">Garlic</option>
                    <option value="Okra">Okra</option>
                    <option value="Carrot">Carrot</option>
                    <option value="Radish">Radish</option>
                    <option value="Spinach">Spinach</option>
                    <option value="Methi">Methi</option>
                    <option value="GreenPeas">Green Peas</option>
                    <option value="BitterGourd">Bitter Gourd</option>
                    <option value="BottleGourd">Bottle Gourd</option>
                    <option value="Pumpkin">Pumpkin</option>
                    <option value="Cucumber">Cucumber</option>
                    <option value="Beans">Beans</option>
                    <option value="Mango">Mango</option>
                    <option value="Banana">Banana</option>
                    <option value="Guava">Guava</option>
                    <option value="Apple">Apple</option>
                    <option value="Papaya">Papaya</option>
                    <option value="Orange">Orange</option>
                    <option value="Lemon">Lemon</option>
                    <option value="Pomegranate">Pomegranate</option>
                    <option value="Grapes">Grapes</option>
                    <option value="Pineapple">Pineapple</option>
                    <option value="Watermelon">Watermelon</option>
                    <option value="Muskmelon">Muskmelon</option>
                    <option value="Turmeric">Turmeric</option>
                    <option value="Ginger">Ginger</option>
                    <option value="Coriander">Coriander</option>
                    <option value="Cumin">Cumin</option>
                    <option value="BlackPepper">Black Pepper</option>
                    <option value="RedChilies">Red Chilies</option>
                    <option value="Tea">Tea</option>
                    <option value="Coffee">Coffee</option>
                    <option value="Coconut">Coconut</option>
                    <option value="Arecanut">Arecanut</option>
                    <option value="Rubber">Rubber</option>
                    <option value="DragonFruit">Dragon Fruit</option>
                    <option value="SpongeGourd">Sponge Gourd</option>
                    <option value="SnakeGourd">Snake Gourd</option>
                    <option value="AshGourd">Ash Gourd</option>
                    <option value="Drumstick">Drumstick</option>
                    <option value="Chili">Chili</option>
                    <option value="Chia">Chia</option>
                    <option value="Rice">Rice</option>
                    <option value="Kiwi">Kiwi</option>
                    <option value="Amla">Amla</option>
                    <option value="Capsicum">Capsicum</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className=" flex flex-col gap-1 cursor-pointer">
                  <label htmlFor="variety" className="text-[#344e41] font-semibold text-sm">Variety</label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="Enter crop variety"
                    className="border border-[#344e41] w-[90%] outline-none rounded px-2 py-1 bg-[#344E41] placeholder-gray-300 text-gray-300"
                  />
                </div>
                <div className=" flex flex-col gap-1 cursor-pointer">
                  <label htmlFor="sowingDate" className="text-[#344e41] font-semibold text-sm">Sowing Date</label>
                  <input
                    type="date"
                    id="sowingDate"
                    name="sowingDate"
                    value={sowingDate}
                    onChange={(e) => setSowingDate(e.target.value)}
                    required
                    className="border border-[#344e41] w-[90%] outline-none rounded px-2 py-1 bg-[#344E41] placeholder-gray-300 text-gray-300"
                  />
                </div>
                <div className=" flex flex-col gap-1 cursor-pointer">
                  <label htmlFor="irrigationType" className="text-[#344e41] font-semibold text-sm">Type Of Irrigation</label>
                  <select
                    className="select border border-[#344e41] w-[90%] outline-none rounded px-2 py-1 bg-[#344E41] placeholder-gray-300 text-gray-300"
                    value={typeOfIrrigation}
                    onChange={(e) => setTypeOfIrrigation(e.target.value)}
                  >
                    <option value="" disabled>Select irrigation Type</option>
                    <option value="open-irrigation">Open Irrigation</option>
                    <option value="drip-irrigation">Drip Irrigation</option>
                    <option value="sprinkler">Sprinkler Irrigation</option>
                  </select>
                </div>
                <div className=" flex flex-col gap-1 cursor-pointer">
                  <label htmlFor="cropName" className="text-[#344e41] font-semibold text-sm">Type Of Farming</label>
                  <select
                    className="select border border-[#344e41] w-[90%] outline-none rounded px-2 py-1 bg-[#344E41] placeholder-gray-300 text-gray-300"
                    value={typeOfFarming}
                    onChange={(e) => setTypeOfFarming(e.target.value)}
                  >
                    {" "}
                    <option value="" disabled>Select Farming Type</option>
                    <option value="Organic">Organic</option>
                    <option value="Inorganic">Inorganic</option>
                    <option value="Integrated">Integrated</option>
                  </select>
                </div>
              </div>
            </form>

            <footer className=" flex justify-center">
              <button className="border-none outline-none rounded-md bg-[#344e41] text-white font-semibold w-3/4 h-9 transition-all duration-400 ease-in-out" onClick={handleAddField}>Add Field</button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default AddFieldSidebar;
