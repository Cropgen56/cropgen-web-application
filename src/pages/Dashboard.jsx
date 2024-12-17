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

  // Set initial selected field when fields load
  useEffect(() => {
    if (fields.length > 0) {
      setSelectedField(fields[0]?._id);
    }
  }, [fields]);

  // Extract seleted field detials
  const selectedFieldsDetials = fields.filter(
    (item) => item?._id === selectedField
  );
  console.log(selectedFieldsDetials);

  return (
    <div className="dashboard float-end p-3">
      <MapView
        markers={markers}
        setMarkers={setMarkers}
        isAddingMarkers={isAddingMarkers}
        setIsAddingMarkers={setIsAddingMarkers}
        selectedField={selectedField}
        setSelectedField={setSelectedField}
        fields={fields}
      />
      <CropHealth selectedFieldsDetials={selectedFieldsDetials} />
      <ForeCast />
      <NdviGraph />
      <Insights />
      <CropAdvisory />
      <PlantGrowthActivity />
    </div>
  );
};

export default Dashboard;
