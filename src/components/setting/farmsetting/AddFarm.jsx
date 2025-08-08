import React, { useEffect, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { getFarmFields, updateFarmField, deleteFarmField  } from "../../../redux/slices/farmSlice";
import { useDispatch, useSelector } from "react-redux";
import { MapContainer, TileLayer, Polygon, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Modal, message } from "antd";
import AllFarms from "./AllFarms";


const AddFarm = ({selectedFarm }) => {
    const dispatch = useDispatch();
    const { fields: farms, status } = useSelector((state) => state.farmfield || { fields: [] });
    const user = useSelector((state) => state.auth.user);
    const userId = user?._id || user?.id;
    const [polygonCoordinates, setPolygonCoordinates] = useState(selectedFarm?.field || []);
    const [updating, setUpdating] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [showAllFarms, setShowAllFarms] = useState(false);
    const [selectedFarmState, setSelectedFarmState] = useState(selectedFarm || {});
    const isTabletSize = () => window.innerWidth <= 1024 && window.innerWidth > 768;


    const [formData, setFormData] = useState({
        farmName: selectedFarm?.fieldName || "",
        cropName: selectedFarm?.cropName || "",
        variety: selectedFarm?.variety || "",
        sowingDate: selectedFarm?.sowingDate?.split("T")[0] || "",
        typeOfIrrigation: selectedFarm?.typeOfIrrigation || "",
        typeOfFarming: selectedFarm?.typeOfFarming || "",
    });

    useEffect(() => {
        setFormData({
            farmName: selectedFarmState.fieldName || "",
            cropName: selectedFarmState.cropName || "",
            variety: selectedFarmState.variety || "",
            sowingDate: selectedFarmState.sowingDate?.split("T")[0] || "",
            typeOfIrrigation: selectedFarmState.typeOfIrrigation || "",
            typeOfFarming: selectedFarmState.typeOfFarming || "",
        });
        setPolygonCoordinates(selectedFarmState.field || []);
    }, [selectedFarmState]);


    useEffect(() => {
        if (status === "idle" && userId) {
            dispatch(getFarmFields(userId));
        }
    }, [dispatch, status, userId]);

    const [isTablet, setIsTablet] = useState(isTabletSize());

useEffect(() => {
    const handleResize = () => setIsTablet(isTabletSize());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
}, []);


    const handleFarmChange = (e) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, farmName: value }));

        const existingFarm = farms?.find((f) => f.fieldName?.toLowerCase() === value.toLowerCase());
        
        if (existingFarm) {
            setFormData({
                farmName: existingFarm.fieldName || "",
                cropName: existingFarm.cropName || "",
                variety: existingFarm.variety || "",
                sowingDate: existingFarm.sowingDate?.split("T")[0] || "",
                typeOfIrrigation: existingFarm.typeOfIrrigation || "",
                typeOfFarming: existingFarm.typeOfFarming || "",
            });

            setPolygonCoordinates(existingFarm.field || []); 
        } else {
            if (!selectedFarm?._id) {
                setPolygonCoordinates([]);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedFarm?._id) {
            message.error("No farm selected to update!");
            return;
        }

        const updatedData = {
            ...formData,
            fieldName: formData.farmName,
            latlng: polygonCoordinates, 
        };

        console.log("Payload sent to API:", updatedData);

        try {
            setUpdating(true); 
            await dispatch(updateFarmField({ fieldId: selectedFarm._id, updatedData })).unwrap()
            message.success("Farm updated successfully!");

            dispatch(getFarmFields(userId));
        } catch (err) {
            message.error("Failed to update farm.");
        } finally {
            setUpdating(false);
        }
    };

        const cropOptions = [
        "Barley",
        "Wheat",
        "Pearl Millet",
        "Sorghum",
        "Finger Millet",
        "Chickpea",
        "Red Gram",
        "Green Gram",
        "Black Gram",
        "Lentil",
        "Field Pea",
        "Horse Gram",
        "Cowpea",
        "Groundnut",
        "Mustard",
        "Soybean",
        "Sunflower",
        "Sesame",
        "Linseed",
        "Castor",
        "Safflower",
        "Niger",
        "Sugarcane",
        "Cotton",
        "Jute",
        "Tobacco",
        "Potato",
        "Tomato",
        "Brinjal",
        "Cabbage",
        "Cauliflower",
        "Onion",
        "Garlic",
        "Okra",
        "Carrot",
        "Radish",
        "Spinach",
        "Methi",
        "Green Peas",
        "Bitter Gourd",
        "Bottle Gourd",
        "Pumpkin",
        "Cucumber",
        "Beans",
        "Mango",
        "Banana",
        "Guava",
        "Apple",
        "Papaya",
        "Orange",
        "Lemon",
        "Pomegranate",
        "Grapes",
        "Pineapple",
        "Watermelon",
        "Muskmelon",
        "Turmeric",
        "Ginger",
        "Coriander",
        "Cumin",
        "Black Pepper",
        "Red Chilies",
        "Tea",
        "Coffee",
        "Coconut",
        "Arecanut",
        "Rubber",
        "Dragon Fruit",
        "Sponge Gourd",
        "Snake Gourd",
        "Ash Gourd",
        "Drumstick",
        "Chili",
        "Chia",
        "Rice",
        "Kiwi",
        "Amla",
        "Capsicum",
        "Other",
    ];

    const defaultCenter = [20.135245, 77.156935];

    const MoveMapToField = ({ coordinates }) => {
    const map = useMap();
        useEffect(() => {
            if (coordinates.length > 0) {
                const bounds = coordinates.map(c => [c.lat, c.lng]);
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
            }
        }, [coordinates, map]);
        return null;
    };

    const handleDeleteConfirm = async () => {
        try {
            if (!selectedFarm?._id) return message.error("No farm selected to delete!");

            await dispatch(deleteFarmField(selectedFarm._id)).unwrap();
            message.success("Farm deleted successfully!");
            setDeleteModalVisible(false);
            dispatch(getFarmFields(userId));

            setShowAllFarms(true);

        } catch (error) {
            message.error("Failed to delete farm.");
        }
    };

    if (showAllFarms) {
        return <AllFarms onAddFarmClick={(farm) => {
                setSelectedFarmState(farm);
                setShowAllFarms(false);
            }}
        />;

    }

    

return isTablet ? (
    // === TABLET UI ===
    <div className="flex flex-col h-[100vh] overflow-y-auto">
        {/* MAP */}
        <div className="h-[60vh] w-full">
          <MapContainer
            center={polygonCoordinates?.length > 0 ? [polygonCoordinates[0].lat, polygonCoordinates[0].lng] : defaultCenter}
            zoom={15}
            className="w-full h-full rounded-lg"
          >
            <TileLayer
              url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              subdomains={["mt0", "mt1", "mt2", "mt3"]}
            />
            {polygonCoordinates.length > 0 && (
              <Polygon
                positions={polygonCoordinates.map(({ lat, lng }) => [lat, lng])}
                pathOptions={{ color: "yellow", fillOpacity: 0.2 }}
              />
            )}
            <MoveMapToField coordinates={polygonCoordinates} />
          </MapContainer>
        </div>

        {/* FORM + BUTTONS */}
       {/* FORM + BUTTONS */}
<div className="h-[30vh] px-3 py-2 flex flex-col">
  {/* Scrollable form */}
  <div className="flex-grow overflow-y-auto pr-1">
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
      {[
        { label: "Farm Name", name: "farmName", type: "text", value: formData.farmName, onChange: handleFarmChange },
        { label: "Crop Name", name: "cropName", type: "select", value: formData.cropName },
        { label: "Variety", name: "variety", type: "text", value: formData.variety },
        { label: "Sowing Date", name: "sowingDate", type: "date", value: formData.sowingDate },
        { label: "Type Of Irrigation", name: "typeOfIrrigation", type: "select", value: formData.typeOfIrrigation, options: ["Open", "Drip", "Sprinkler"] },
        { label: "Type Of Farming", name: "typeOfFarming", type: "select", value: formData.typeOfFarming, options: ["Organic", "Inorganic", "Integrated"] },
      ].map((field, index) => (
        <div key={index} className="flex flex-col gap-1">
          <label className="text-sm font-semibold">{field.label}</label>
          {field.type === "select" ? (
            <select
              name={field.name}
              value={field.value}
              onChange={handleChange}
              className="bg-[#344E41] text-gray-300 border border-[#344e41] rounded px-2 py-1"
            >
              <option value="" disabled>Select</option>
              {(field.options || cropOptions).map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              name={field.name}
              value={field.value}
              onChange={field.onChange || handleChange}
              placeholder={field.label}
              className="bg-[#344E41] text-gray-300 placeholder-gray-300 border border-[#344e41] rounded px-2 py-1"
            />
          )}
        </div>
      ))}
    </form>
  </div>

  {/* Buttons at bottom */}
  <div className="flex justify-between mt-3">
    <button
      type="button"
      onClick={() => setDeleteModalVisible(true)}
      className="flex items-center gap-1 px-4 py-2 border border-red-600 text-red-600 rounded-md hover:border-red-700 transition-colors duration-400 ease-in-out cursor-pointer"
    >
      Delete <Trash2 size={18} />
    </button>
    <button
      type="button"
      onClick={handleSubmit}
      className={`flex items-center gap-1 px-4 py-2 border ${updating ? "bg-[#5A7C6B] cursor-not-allowed" : "bg-[#344E41] text-white"} rounded-md transition-all duration-400 ease-in-out cursor-pointer`}
    >
      {updating ? "Updating..." : <>Update <Save size={18} /></>}
    </button>
  </div>
</div>


        {/* Modal */}
        <Modal
          title="Confirm Delete"
          open={deleteModalVisible}
          onOk={handleDeleteConfirm}
          onCancel={() => setDeleteModalVisible(false)}
          okText="Yes, Delete"
          okButtonProps={{ danger: true }}
          className="flex justify-center items-center"
        >
          <p>Are you sure you want to delete this farm? This action cannot be undone.</p>
        </Modal>
      </div>
) : (
    // === DESKTOP UI ===
    // KEEP YOUR EXISTING RETURN BLOCK HERE (unchanged)
    <>
       <div className="flex flex-col flex-grow justify-between gap-4 p-2 overflow-hidden overflow-y-auto">
            <form onSubmit={handleSubmit} className="flex flex-col-reverse lg:flex-row gap-3 lg:h-full w-full">
                {/* form Section */}
                <div className="flex flex-col gap-3 w-full lg:w-[30%] bg-white ">
                    <h5 className="mt-2 font-semibold text-[#344E41]">Crop Details</h5>

                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-sm">Farm Name</label>
                            <input
                                type="text"
                                name="farmName"
                                value={formData.farmName}
                                onChange={handleFarmChange}
                                placeholder="Enter farm name"
                                className="border border-[#344e41] w-full outline-none rounded px-2 py-1 bg-[#344E41] placeholder-gray-300 text-gray-300"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-sm">Crop Name</label>
                            <select
                                name="cropName"
                                value={formData.cropName}
                                onChange={handleChange}
                                className="border border-[#344e41] w-full outline-none rounded px-2 py-1 bg-[#344E41] text-gray-300">
                                
                                <option value="" disabled>Select Crop</option>
                                 {cropOptions.map((crop, index) => (
                                    <option key={index} value={crop}>
                                        {crop}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-sm">Variety</label>
                            <input
                                type="text"
                                name="variety"
                                value={formData.variety}
                                onChange={handleChange}
                                placeholder="Enter crop variety"
                                className="border border-[#344e41] w-full outline-none rounded px-2 py-1 bg-[#344E41] placeholder-gray-300 text-gray-300"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-sm">Sowing Date</label>
                            <input
                                type="date"
                                name="sowingDate"
                                value={formData.sowingDate}
                                onChange={handleChange}
                                className="border border-[#344e41] w-full outline-none rounded px-2 py-1 bg-[#344E41] text-gray-300"/>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-sm">Type Of Irrigation</label>
                            <select
                                name="typeOfIrrigation"
                                value={formData.typeOfIrrigation}
                                onChange={handleChange}
                                className="border border-[#344e41] w-full outline-none rounded px-2 py-1 bg-[#344E41] text-gray-300">
                                <option value="" disabled>Select Irrigation Type</option>
                                <option value="Open">Open Irrigation</option>
                                <option value="Drip">Drip Irrigation</option>
                                <option value="Sprinkler">Sprinkler Irrigation</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-sm">Type Of Farming</label>
                            <select
                                name="typeOfFarming"
                                value={formData.typeOfFarming}
                                onChange={handleChange}
                                className="border border-[#344e41] w-full outline-none rounded px-2 py-1 bg-[#344E41] text-gray-300" >
                                <option value="" disabled>Select Farming Type</option>
                                <option value="Organic">Organic</option>
                                <option value="Inorganic">Inorganic</option>
                                <option value="Integrated">Integrated</option>
                            </select>
                        </div>
                    </div>
                </div>


                {/* map Section */}
                <div className="flex flex-col gap-4 w-full lg:w-[70%] bg-white h-[300px] lg:h-auto">
                    <div className="flex-grow">
                        <MapContainer
                            center={polygonCoordinates?.length > 0 && polygonCoordinates[0]?.lat
                                    ? [polygonCoordinates[0].lat, polygonCoordinates[0].lng] 
                                    : defaultCenter}
                            zoom={15}
                            className="w-full h-full rounded-lg" >
                            
                            <TileLayer
                            url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                            subdomains={["mt0", "mt1", "mt2", "mt3"]} />

                            {polygonCoordinates.length > 0 && (
                                <Polygon
                                    positions={polygonCoordinates.map(({ lat, lng }) => [lat, lng])}
                                    pathOptions={{ color: "yellow", fillOpacity: 0.2 }}
                                />
                            )}
                            <MoveMapToField coordinates={polygonCoordinates} />
                        </MapContainer>
                    </div>
                </div>
            </form>

            <div className="flex items-center justify-between gap-2">
                <button
                    type="button"
                    onClick={() => setDeleteModalVisible(true)}
                    className="flex items-center gap-1 px-4 py-2 border-1 border-red-600 text-red-600 rounded-md hover:border-red-700 transition-colors duration-400 ease-in-out cursor-pointer">
                        Delete <Trash2 size={18} /> 
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    className={`flex items-center gap-1 px-4 py-2 border-1 ${updating ? "bg-[#5A7C6B] cursor-not-allowed" : "bg-[#344E41] text-white"} text-white rounded-md transition-all duration-400 ease-in-out cursor-pointer`}>
                        {updating ? "Updating..." : <> Update <Save size={18} /></>}
                </button>
            </div>

            <Modal
                title="Confirm Delete"
                open={deleteModalVisible}
                onOk={handleDeleteConfirm}
                onCancel={() => setDeleteModalVisible(false)}
                okText="Yes, Delete"
                okButtonProps={{ danger: true }}
                className="flex justify-center items-center" >
                <p>Are you sure you want to delete this farm? This action cannot be undone.</p>
            </Modal>

        </div>
    </>
);

};

export default AddFarm;


