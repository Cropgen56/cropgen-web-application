import React from "react";
import "../style/Operation.css";
import SoilReportSidebar from "../components/soilreport/soilreportsidebar/SoilReportSidebar";
const SoilReport = () => {
  return (
    <div className="operation container-fluid m-0 p-0 d-flex">
      <div>
        <SoilReportSidebar />
      </div>
      <div className="w-100"> </div>
    </div>
  );
};

export default SoilReport;
