import React from "react";
import SmartAdvisorySidebar from "../components/smartadvisory/smartadvisorysidebar/SmartAdvisorySidebar";
import "../style/Smartadvisory.css";

const SmartAdvisory = () => {
  return (
    <div className="smart-advisory container-fluid m-0 p-0 d-flex">
      <div>
        <SmartAdvisorySidebar />
      </div>
      <div className="w-100"> </div>
    </div>
  );
};

export default SmartAdvisory;
