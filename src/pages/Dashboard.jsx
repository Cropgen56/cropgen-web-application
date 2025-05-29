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
  const [selectedField, setSelectedField] = useState("");

  const userId = user?.id;

  // Fetch fields on component mount
  useEffect(() => {
    if (userId) {
      dispatch(getFarmFields(userId));
    }
  }, [dispatch, userId]);

  // Set initial selected field to the last field when fields load
  useEffect(() => {
    if (fields.length > 0) {
      setSelectedField(fields[fields?.length - 1]?._id);
    }
  }, [fields]);

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
