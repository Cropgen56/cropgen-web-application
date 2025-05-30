import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFarmFields } from "../redux/slices/farmSlice";
import MapView from "../components/dashboard/mapview/MapView";
import CropHealth from "../components/dashboard/crophealth/CropHealth";
import ForeCast from "../components/dashboard/forecast/ForeCast";
import PlantGrowthActivity from "../components/dashboard/plantgrowthactivity/PlantGrowthActivity";
import Insights from "../components/dashboard/insights/Insights";
import CropAdvisory from "../components/dashboard/cropadvisory/CropAdvisory";
import "../style/Dashboard.css";
import NdviGraph from "../components/dashboard/ndvigraph/NdviGraph";

const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.auth?.user);
  const fields = useSelector((state) => state?.farmfield?.fields);

  const [markers, setMarkers] = useState([]);
  const [isAddingMarkers, setIsAddingMarkers] = useState(false);
  const [selectedField, setSelectedField] = useState(() => {
    // Get selected field from localStorage, or empty string if not set
    return localStorage.getItem("selectedFieldId") || "";
  });
  const [prevFieldsLength, setPrevFieldsLength] = useState(0);

  const userId = user?.id;

  // Fetch fields on component mount
  useEffect(() => {
    if (userId) {
      dispatch(getFarmFields(userId));
    }
  }, [dispatch, userId]);

  // Set default selected field when fields change
  useEffect(() => {
    if (fields.length > 0) {
      // Check if a new field was added
      if (fields.length > prevFieldsLength && prevFieldsLength !== 0) {
        const latestField = fields[fields.length - 1]?._id;
        setSelectedField(latestField);
        localStorage.setItem("selectedFieldId", latestField);
      } else if (!selectedField && prevFieldsLength === 0) {
        // Set latest field as default only on initial load with no prior selection
        const latestField = fields[fields.length - 1]?._id;
        setSelectedField(latestField);
        localStorage.setItem("selectedFieldId", latestField);
      }
      // Update previous fields length
      setPrevFieldsLength(fields.length);
    }
  }, [fields, prevFieldsLength, selectedField]);

  // Update localStorage when selectedField changes
  useEffect(() => {
    if (selectedField) {
      localStorage.setItem("selectedFieldId", selectedField);
    }
  }, [selectedField]);

  // Extract selected field details
  const selectedFieldsDetials =
    fields.filter((item) => item?._id === selectedField) || [];

  return (
    <div className="dashboard float-end p-3">
      <MapView
        markers={markers}
        setMarkers={setMarkers}
        isAddingMarkers={isAddingMarkers}
        setIsAddingMarkers={setIsAddingMarkers}
        selectedField={selectedField}
        setSelectedField={setSelectedField}
        selectedFieldsDetials={selectedFieldsDetials}
        fields={fields}
      />
      <CropHealth
        selectedFieldsDetials={selectedFieldsDetials}
        fields={fields}
      />
      <ForeCast />
      <NdviGraph selectedFieldsDetials={selectedFieldsDetials} />
      <Insights />
      <CropAdvisory selectedFieldsDetials={selectedFieldsDetials} />
      <PlantGrowthActivity selectedFieldsDetials={selectedFieldsDetials} />
    </div>
  );
};

export default Dashboard;
