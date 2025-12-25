import React, { useState } from "react";
import AddFarm from "./AddFarm";
import AllFarms from "./AllFarms";
import { ArrowLeft } from "lucide-react";

export default function FarmSetting({ setShowSidebar }) {
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
    <div className="max-w-[1200px] w-[98%] mx-auto my-2 p-2 px-4 lg:p-4 rounded-lg bg-white shadow-md h-[1000px] lg:h-[98%] flex flex-col box-border overflow-hidden overflow-y-hidden font-inter">
      <div className="px-4 py-2 text-[#344E41] border-b border-black/40">
        <div className="flex items-center justify-between">
          <h5 className="font-bold">Farm Settings</h5>
          <button
            onClick={() => setShowSidebar(true)}
            className="flex items-center gap-1 text-sm text-[#344E41] hover:text-[#1d3039]"
          >
            <ArrowLeft size={18} /> Back to Settings
          </button>
        </div>

        {!showAddFarm && (
          <p className="mt-1 mb-0.5 text-[#344E41] font-medium text-[15px] leading-[100%]">
            Manage your farm subscriptions and details.
          </p>
        )}
      </div>

      {showAddFarm ? (
        <AddFarm
          onBackClick={handleBackToAllFarms}
          selectedFarm={selectedFarm}
        />
      ) : (
        <AllFarms onAddFarmClick={handleAddFarmClick} />
      )}
    </div>
  );
}
