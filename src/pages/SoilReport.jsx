import React from "react";
import SoilReportSidebar from "../components/soilreport/soilreportsidebar/SoilReportSidebar";
import "../style/Soilreport.css";
const SoilReport = () => {
  return (
    <div className="soil-report container-fluid m-0 p-0 d-flex">
      <div>
        <SoilReportSidebar />
      </div>
      <div className="w-100"> </div>
    </div>
  );
};

export default SoilReport;
