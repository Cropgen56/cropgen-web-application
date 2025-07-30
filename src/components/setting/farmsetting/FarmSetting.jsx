import React, { useState } from "react";
import AddFarm from "./AddFarm";
import AllFarms from "./AllFarms";

export default function FarmSetting() {
  const [showAddFarm, setShowAddFarm] = useState(false); 

  const handleAddFarmClick = () => {
    setShowAddFarm(true);
  };

  const handleBackToAllFarms = () => {
    setShowAddFarm(false);
  };

  return (
    <div className="max-w-[1200px] w-[98%] mx-auto my-2 p-4 rounded-lg bg-white shadow-md h-[98%] flex flex-col box-border overflow-hidden overflow-y-hidden font-inter">
      <div className="text-left px-4 py-1 border-b border-black/40 font-bold text-[#344E41]">
        <h5>Farm Settings</h5>
      </div>

      {showAddFarm ? (
        <AddFarm onBackClick={handleBackToAllFarms} />
      ) : (
        <AllFarms onAddFarmClick={handleAddFarmClick} />
      )}
    </div>
  );
}
