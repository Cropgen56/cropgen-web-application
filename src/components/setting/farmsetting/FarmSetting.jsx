import React, { useState } from "react";
import AddFarm from "./AddFarm";
import AllFarms from "./AllFarms";
import SettingsPanel from "../SettingsPanel";

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
    <SettingsPanel
      title={showAddFarm ? "Add / edit farm" : "Farm Settings"}
      description={
        showAddFarm
          ? "Update field details and subscription."
          : "Manage your farm subscriptions and details."
      }
      onBack={setShowSidebar}
      className="h-full bg-[#f8fbf9]"
    >
      {showAddFarm ? (
        <AddFarm
          onBackClick={handleBackToAllFarms}
          selectedFarm={selectedFarm}
        />
      ) : (
        <AllFarms onAddFarmClick={handleAddFarmClick} />
      )}
    </SettingsPanel>
  );
}
