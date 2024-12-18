import React from "react";
import PersonaliseCropScheduleSidebar from "../components/personalizecropshedule/personalizecropshedulesidebar/PersonaliseCropSheduleSidebar";
import "../style/Personalisecropshedule.css";

const PersonaliseCropSchedule = () => {
  return (
    <div className="personalise-crop-shedule container-fluid m-0 p-0 d-flex">
      <div>
        <PersonaliseCropScheduleSidebar />
      </div>
      <div className="w-100"> </div>
    </div>
  );
};

export default PersonaliseCropSchedule;
