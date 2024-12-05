import React from "react";
import MapView from "../components/dashboard/mapview/MapView";
import CropHealth from "../components/dashboard/crophealth/CropHealth";
import ForeCast from "../components/dashboard/forecast/ForeCast";
import PlantGrowthActivity from "../components/dashboard/plantgrowthactivity/PlantGrowthActivity";
import Insights from "../components/dashboard/insights/Insights";
import CropAdvisory from "../components/dashboard/cropadvisory/CropAdvisory";
import "../style/Dashboard.css";
import NdviGraph from "../components/dashboard/ndvigraph/NdviGraph";

const Dashboard = () => {
  return (
    <div className="dashboard float-end p-3 ">
      <MapView />
      <CropHealth />
      <ForeCast />
      <NdviGraph />
      <Insights />
      <CropAdvisory />
      <PlantGrowthActivity />
    </div>
  );
};

export default Dashboard;
