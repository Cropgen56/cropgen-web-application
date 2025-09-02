import React from "react";
import PersonaliseCropScheduleSidebar from "../components/personalizecropshedule/personalizecropshedulesidebar/PersonaliseCropSheduleSidebar";

const PersonaliseCropSchedule = () => {
  return (
    <div className="h-screen w-screen bg-[#5a7c6b] m-0 p-0 flex">
      <div>
        <PersonaliseCropScheduleSidebar />
      </div>
      <div className="w-full"> </div>
    </div>
  );
};

export default PersonaliseCropSchedule;
