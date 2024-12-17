import React, { useState } from "react";
import AddFieldMap from "../components/addfield/AddFieldMap";
import AddFieldSidebar from "../components/addfield/AddFieldSidebar";
import { useDispatch, useSelector } from "react-redux";
import { addFarmField } from "../redux/slices/farmSlice";

const AddField = () => {
  const [markers, setMarkers] = useState([]);
  const [isAddingMarkers, setIsAddingMarkers] = useState(false);
  const dispatch = useDispatch();

  // Toggle marker adding mode
  const toggleAddMarkers = () => {
    setIsAddingMarkers((prev) => !prev);
  };

  // Clear markers
  const clearMarkers = () => {
    setMarkers([]);
  };

  // get user id
  const userId = useSelector((state) => state?.auth?.user?.id);

  // Save farm function (you can customize the farm data saving logic)
  const saveFarm = ({
    markers,
    cropName,
    variety,
    sowingDate,
    typeOfIrrigation,
    farmName,
  }) => {
    if (markers.length === 0) {
      alert("No markers added. Please add some markers first.");
      return;
    }

    console.log(markers);

    dispatch(
      addFarmField({
        latlng: markers,
        userId,
        cropName,
        variety,
        sowingDate,
        typeOfIrrigation,
        farmName,
      })
    );

    alert("Farm saved successfully!");
  };

  return (
    <div className="weather container-fluid m-0 p-0 w-100">
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
