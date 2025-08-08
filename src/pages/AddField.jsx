import React, { useState, useEffect } from "react";
import AddFieldMap from "../components/addfield/AddFieldMap";
import AddFieldSidebar from "../components/addfield/AddFieldSidebar";
import { useDispatch, useSelector } from "react-redux";
import { addFarmField } from "../redux/slices/farmSlice";
import { useNavigate } from "react-router-dom";
import * as turf from "@turf/turf";
import { message } from "antd";

const AddField = () => {
  const [markers, setMarkers] = useState([]);
  const [isAddingMarkers, setIsAddingMarkers] = useState(false);
  const [isTabletView, setIsTabletView] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userId = useSelector((state) => state?.auth?.user?.id);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsTabletView(width >= 768 && width <= 1024 && height <= 1366);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleAddMarkers = () => setIsAddingMarkers((prev) => !prev);
  const clearMarkers = () => setMarkers([]);

  const saveFarm = ({
    cropName,
    variety,
    sowingDate,
    typeOfIrrigation,
    farmName,
    typeOfFarming,
  }) => {
    if (markers.length === 0) {
      message.error("No markers added. Please add some markers first.");
      return;
    }

    const calculateArea = (coords) => {
      const coordinates = coords.map((point) => [point.lng, point.lat]);
      coordinates.push(coordinates[0]);
      const polygon = turf.polygon([coordinates]);
      const area = turf.area(polygon);
      return area / 4046.86; // square meters to acres
    };

    dispatch(
      addFarmField({
        latlng: markers,
        userId,
        cropName,
        variety,
        sowingDate,
        typeOfIrrigation,
        farmName,
        acre: calculateArea(markers),
        typeOfFarming,
      })
    ).then((result) => {
      if (result?.payload?.success) {
        message.success("Field added successfully!");
        navigate("/cropgen-analytics");
      }
    });
  };

  return isTabletView ? (
    <div className="w-full h-screen flex flex-col relative">
      {/* Map Top Half */}
      <div className="relative w-full h-[60vh] z-0">
        <AddFieldMap
          markers={markers}
          setMarkers={setMarkers}
          isAddingMarkers={isAddingMarkers}
          toggleAddMarkers={toggleAddMarkers}
          clearMarkers={clearMarkers}
          isTabletView={isTabletView}
        />

        {/* Control Buttons */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-4 z-50 pointer-events-auto">
          <button className="bg-[#344E41] text-white px-4 py-1 rounded">Calendar</button>
          <button onClick={clearMarkers} className="bg-[#344E41] text-white px-4 py-1 rounded">Undo</button>
          <button onClick={toggleAddMarkers} className="bg-[#344E41] text-white px-4 py-1 rounded">
            {isAddingMarkers ? "Stop" : "Add Field"}
          </button>
        </div>

        {/* Transparent blocker on bottom half of map to allow sidebar clicks */}
        <div className="absolute top-1/2 left-0 w-full h-1/2 z-[10] pointer-events-none"></div>
      </div>

      {/* Sidebar Bottom Half */}
      <div className="w-full h-[40vh] p-4 flex justify-center items-center overflow-y-auto z-20 bg-white pointer-events-auto">
        <AddFieldSidebar
          saveFarm={saveFarm}
          markers={markers}
          isTabletView={true}
        />
      </div>
    </div>
  ) : (
    <div className="weather container-fluid m-0 p-0 w-full h-screen flex">
      <AddFieldSidebar saveFarm={saveFarm} markers={markers} />
      <AddFieldMap
        markers={markers}
        setMarkers={setMarkers}
        isAddingMarkers={isAddingMarkers}
        toggleAddMarkers={toggleAddMarkers}
        clearMarkers={clearMarkers}
      />
    </div>
  );
};

export default AddField;
