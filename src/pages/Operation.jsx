import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFarmFields } from "../redux/slices/farmSlice";
import { getOperationsByFarmField } from "../redux/slices/operationSlice";
import OperationSidebar from "../components/operation/operationsidebar/OperationSidebar";
import Calendar from "../components/operation/operationcalender/OperationCalender";
// import "../style/Operation.css";
import { useNavigate } from "react-router-dom";
import img1 from "../assets/image/Group 31.png"

const Operation = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.auth?.user);
  const fields = useSelector((state) => state?.farmfield?.fields);
  const navigate= useNavigate();

  const userId = user?.id;

  // Initialize selectedField as null until fields are fetched
  const [selectedField, setSelectedField] = useState(null);

  // Fetch fields once when userId is available
  useEffect(() => {
    if (userId) {
      dispatch(getFarmFields(userId));
    }
  }, [dispatch, userId]);

  // Set the default selectedField when fields are available
  useEffect(() => {
    if (fields?.length > 0 && !selectedField) {
      setSelectedField(fields[0]._id);
    }
  }, [fields, selectedField]);

  // Fetch operations when selectedField changes
  useEffect(() => {
    if (selectedField) {
      dispatch(getOperationsByFarmField({ farmId: selectedField }));
    }
  }, [dispatch, selectedField]);

  if (fields.length === 0) {
  return (
     <div className="flex flex-col items-center justify-center w-full h-screen bg-[#5a7c6b] text-center px-4">
  {/* Centered Background Image */}
  <img
    src={img1}
    alt="No Fields"
    className="w-[400px] h-[400px] mb-6 opacity-70"
  />

  {/* Text */}
  <h2 className="text-2xl font-semibold text-white">
    Add Farm to make an Operation
  </h2>

  {/* Optional Button */}
  <button
    onClick={() => navigate("/addfield")}
    className="mt-6 px-5 py-2 rounded-lg bg-white text-[#5a7c6b] font-medium hover:bg-gray-200 transition"
  >
    Add Field
  </button>
</div>
  );
}

  return (
    <div className="w-full h-full m-0 p-0 d-flex">
      <OperationSidebar
        setSelectedField={setSelectedField}
        selectedField={selectedField}
      />
      <div className="bg-[#5a7c6b]">
        <Calendar selectedField={selectedField} />
      </div>
    </div>
  );
};

export default Operation;
