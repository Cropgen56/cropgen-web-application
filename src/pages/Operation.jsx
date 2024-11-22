import React from "react";
import "../style/Operation.css";
import OperationSidebar from "../components/operation/operationsidebar/OperationSidebar";
import OperationCalender from "../components/operation/operationcalender/OperationCalender";
const Operation = () => {
  return (
    <div className="operation container-fluid m-0 p-0 d-flex">
      <div>
        <OperationSidebar />
      </div>
      <div className="w-100"> {/* <OperationCalender /> */}</div>
    </div>
  );
};

export default Operation;
