import React, { useState } from "react";
import {TriangleRight,} from "lucide-react"; 

const AddFarm = ({ onBackClick }) => {
  const [formData, setFormData] = useState({
    crop: "",
    year: "",
    cropCycle: "",
    area: "",
    variety: "",
    seed: "",
    season: "",
    sowingDate: "",
    age: "",
    estimatedHarvest: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Farm data submitted:", formData);
  };

  return (
    <div className="flex flex-col flex-grow gap-4 p-2 overflow-hidden overflow-y-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 h-full">

        {/* Left Section */}
        <div className="flex flex-col gap-3 w-2/5 bg-white ">

          <div className="flex items-center justify-between gap-1">
            <label
              htmlFor="crop"
              className="block w-[25%] text-sm font-bold text-[#344E41]">
              Crop
            </label>
            <input
              type="text"
              id="crop"
              name="crop"
              value={formData.crop}
              onChange={handleChange}
              className="mt-1 block w-[75%] rounded-md border-1 border-[#344E41] text-sm p-2 focus:outline-none focus:ring-0 focus:border-[#344E41]"
              placeholder="Enter Crop"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="year"
              className="block w-[25%] text-sm font-bold text-[#344E41]">
              Year
            </label>
            <input
              type="text"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="mt-1 block w-[75%] rounded-md border-1 border-[#344E41] text-sm p-2 focus:outline-none focus:ring-0 focus:border-[#344E41]"
              placeholder="Enter Year"
            />
          </div>

          <div className="flex items-center gap-2 w-full">
            <label className="w-1/4 text-sm font-bold text-[#344E41]">
              Crop Cycle
            </label>

            <select
              id="crop"
              name="crop"
              value={formData.crop}
              onChange={handleChange}
              className="block w-1/2 rounded-md border-1 border-[#344E41] text-sm p-2 focus:outline-none focus:ring-0 focus:border-[#344E41]">
              <option value="" disabled>Select Crop</option>
              <option value="Wheat">Wheat</option>
              <option value="Rice">Rice</option>
              <option value="Maize">Maize</option>
            </select>

            <select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="block w-1/4 rounded-md border-1 border-[#344E41] text-sm p-2 focus:outline-none focus:ring-0 focus:border-[#344E41]" >
              <option value="" disabled>Year</option>
              {Array.from(
                { length: new Date().getFullYear() - 2000 + 1 },
                (_, i) => 2000 + i
              ).map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full">
            <label className="w-[25%] text-sm font-bold text-[#344E41]">
              Area
            </label>

            <input
              type="number"
              name="areaHec"
              value={formData.areaHec || ""}
              onChange={handleChange}
              placeholder="Hec"
              className="block w-[25%] rounded-md border-1 border-[#344E41] text-sm p-2 focus:outline-none focus:ring-0 focus:border-[#344E41]"
            />

            <div className="flex items-center w-[25%] rounded-md border-1 border-[#344E41] text-sm p-2 bg-gray-100">
              <TriangleRight
                size={20}
                strokeWidth={2}
                color="#000"
                className="ml-2 transform rotate-90"
              />
              <input
                type="number"
                name="areaSqft"
                value={formData.areaSqft || ""}
                readOnly
                placeholder="Sq.ft"
                className="w-full bg-gray-100 text-gray-500 text-sm cursor-not-allowed focus:outline-none focus:ring-0 focus:border-[#344E41]"
              />
            </div>

            <div className="flex items-center w-[25%] border rounded-md bg-[#344E41]">
              <TriangleRight
                size={20}
                strokeWidth={2}
                color="#fff"
                className="ml-2 transform rotate-90"
              />

              <input
                type="number"
                name="areaHac"
                value={formData.areaHac || ""}
                readOnly
                placeholder="Hac"
                className="w-full text-gray-500 sm:text-sm p-2 rounded-md border-0 bg-[#344E41] focus:outline-none focus:ring-0 focus:border-[#344E41] cursor-not-allowed"
              />
            </div>
          </div>


          <div className="flex items-center gap-2 w-full">
            <label
              htmlFor="variety"
              className="w-[25%] text-sm font-bold text-[#344E41]" >
              Variety
            </label>

            <select
              id="variety"
              name="variety"
              value={formData.variety}
              onChange={handleChange}
              className="w-[75%] rounded-md border-1 border-[#344E41] text-sm p-2 focus:outline-none focus:ring-0 focus:border-[#344E41]"
            >
              <option value="" disabled>Select Variety</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Organic">Organic</option>
              <option value="Local">Local</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full">
            <label
              htmlFor="seed"
              className="w-[25%] text-sm font-bold text-[#344E41]" >
              Seed
            </label>

            <input
              type="text"
              id="seed"
              name="seed"
              value={formData.seed}
              onChange={handleChange}
              placeholder="Enter Seed"
              className="w-[75%] rounded-md border-1 border-[#344E41] text-sm p-2 focus:outline-none focus:ring-0 focus:border-[#344E41]"
            />
          </div>

          <div className="flex items-center gap-2 w-full">
            <label
              htmlFor="season"
              className="w-[25%] text-sm font-bold text-[#344E41]">
              Season
            </label>

            <select
              id="season"
              name="season"
              value={formData.season}
              onChange={handleChange}
              className="w-[75%] rounded-md border-1 border-[#344E41] text-sm p-2 focus:outline-none focus:ring-0 focus:border-[#344E41]"
            >
              <option value="" disabled>Select Season</option>
              <option value="Rabi">Rabi</option>
              <option value="Kharif">Kharif</option>
              <option value="Zaid">Zaid</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full">
            <label
              htmlFor="sowingDate"
              className="w-[25%] text-sm font-bold text-[#344E41]" >
              Sowing Date
            </label>

            <div className="relative w-[75%]">
              <input
                type="date"
                id="sowingDate"
                name="sowingDate"
                value={formData.sowingDate}
                onChange={handleChange}
                className="block w-full rounded-md border-1 border-[#344E41] text-sm p-2 focus:outline-none focus:ring-0 focus:border-[#344E41]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full">
            <label
              htmlFor="age"
              className="w-[25%] text-sm font-bold text-[#344E41]" >
              Age
            </label>
            <input
              type="text"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter Age"
              className="block w-[75%] rounded-md border-1 border-[#344E41] text-sm p-2 focus:outline-none focus:ring-0 focus:border-[#344E41]"
            />
          </div>

          <div className="flex items-center gap-2 w-full">
            <label
              htmlFor="estimatedHarvest"
              className="w-[25%] text-sm font-bold text-[#344E41]">
              Estimated Harvest
            </label>

            <div className="relative w-[75%]">
              <input
                type="date"
                id="estimatedHarvest"
                name="estimatedHarvest"
                value={formData.estimatedHarvest}
                onChange={handleChange}
                className="block w-full rounded-md border-1 border-[#344E41] text-sm p-2 focus:outline-none focus:ring-0 focus:border-[#344E41]"
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        {/* <div className="flex flex-col gap-4 w-3/5 bg-white ">
      
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              // onClick={() => 
              className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600 transition-colors"
            >
              <Trash2 size={18} /> Delete
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition-colors"
            >
              <Save size={18} /> Update
            </button>
          </div>
        </div> */}
      </form>

      
      {/* <button
        onClick={onBackClick}
        className="mt-4 px-6 py-2 bg-gray-300 text-gray-800 rounded-md shadow-md hover:bg-gray-400 transition-colors self-center"
      >
        Back to All Farms
      </button> */}
    </div>
  );
};

export default AddFarm;
