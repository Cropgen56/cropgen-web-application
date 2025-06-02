import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFarmFields } from "../redux/slices/farmSlice";
import { getOperationsByFarmField } from "../redux/slices/operationSlice";
import OperationSidebar from "../components/operation/operationsidebar/OperationSidebar";
import Calendar from "../components/operation/operationcalender/OperationCalender";
import "../style/Operation.css";

const Operation = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.auth?.user);
  const fields = useSelector((state) => state?.farmfield?.fields);

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

  return (
    <div className="operation container-fluid m-0 p-0 d-flex">
      <OperationSidebar
        setSelectedField={setSelectedField}
        selectedField={selectedField}
      />
      <div className="operation-body">
        <Calendar selectedField={selectedField} />
      </div>
    </div>
  );
};

export default Operation;
