import React, { useState } from "react";
import AddFarm from "./AddFarm";
import AllFarms from "./AllFarms";
import { ArrowLeft } from "lucide-react";

export default function FarmSetting() {
  const [showAddFarm, setShowAddFarm] = useState(false); 
  const [selectedFarm, setSelectedFarm] = useState(null); 

  const handleAddFarmClick = (farm = null) => {
    setSelectedFarm(farm); 
    setShowAddFarm(true);
  };

  const handleBackToAllFarms = () => {
    setShowAddFarm(false);
    setSelectedFarm(null);
  };

  return (
    <div className="max-w-[1200px] w-[98%] mx-auto my-2 p-2 lg:p-4 rounded-lg bg-white shadow-md h-[98%] flex flex-col box-border overflow-hidden overflow-y-hidden font-inter">
      <div className="flex items-center justify-between text-left px-4 py-1 border-b border-black/40 text-[#344E41]">
        <h5 className="font-bold">Farm Settings</h5>
        {showAddFarm && (
          <button 
            onClick={handleBackToAllFarms} 
            className="flex items-center gap-1 text-sm text-[#344E41] hover:text-[#1d3039]">
            <ArrowLeft size={18} /> Back
          </button>
        )}
      </div>

      {showAddFarm ? (
        <AddFarm onBackClick={handleBackToAllFarms} selectedFarm={selectedFarm}  />
      ) : (
        <AllFarms onAddFarmClick={handleAddFarmClick} />
      )}
    </div>
  );
}
