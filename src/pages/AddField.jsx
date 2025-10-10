import React, { useState, useEffect } from "react";
import AddFieldMap from "../components/addfield/AddFieldMap";
import AddFieldSidebar from "../components/addfield/AddFieldSidebar";
import { useDispatch, useSelector } from "react-redux";
import { addFarmField } from "../redux/slices/farmSlice";
import { useNavigate } from "react-router-dom";
import * as turf from "@turf/turf";
import { message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import PricingOverlay from "../components/pricing/Pricing";

const AddField = () => {
  const [markers, setMarkers] = useState([]);
  const [isAddingMarkers, setIsAddingMarkers] = useState(false);
  const [isTabletView, setIsTabletView] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [fieldArea, setFieldArea] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = useSelector((state) => state?.auth?.user?.id);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsTabletView(width >= 768 && width <= 1024 && height <= 1366);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleAddMarkers = () => setIsAddingMarkers((prev) => !prev);
  const clearMarkers = () => setMarkers([]);

  const toggleSidebar = (visible) => setIsSidebarVisible(visible);

  const calculateArea = (coords) => {
    if (coords.length < 3) return 0; 
    
    const coordinates = coords.map((point) => [point.lng, point.lat]);
    coordinates.push(coordinates[0]);
    const polygon = turf.polygon([coordinates]);
    const area = turf.area(polygon);
    return area / 4046.86; 
  };

  const acresToHectares = (acres) => {
    return acres * 0.404686;
  };

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

    const areaInAcres = calculateArea(markers);
    const areaInHectares = acresToHectares(areaInAcres);

    setFieldArea(areaInHectares);

    dispatch(
      addFarmField({
        latlng: markers,
        userId,
        cropName,
        variety,
        sowingDate,
        typeOfIrrigation,
        farmName,
        acre: areaInAcres,
        typeOfFarming,
      })
    ).then((result) => {
      if (result?.payload?.success) {
        message.success("Field added successfully!");
        setShowOverlay(true);
        setPendingRedirect(true);
      }
    });
  };

  const handleClosePricing = () => {
    setShowOverlay(false);
    if (pendingRedirect) {
      navigate("/cropgen-analytics");
    }
  };

  const getCurrentArea = () => {
    if (markers.length < 3) return 0;
    const areaInAcres = calculateArea(markers);
    return acresToHectares(areaInAcres);
  };

  return (
    <div className="relative w-full h-screen">

      <AnimatePresence>
        {showOverlay && (
          <motion.div
            key="pricing-overlay"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-8 no-scrollbar"
          >
            <PricingOverlay 
              onClose={handleClosePricing} 
              userArea={fieldArea} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {isTabletView ? (
        // Tablet Layout
        <div className="w-full h-screen flex flex-col relative">
          {/* Map Top Half */}
          <div
            className={`relative w-full z-0 ${
              showOverlay ? "h-screen z-[30]" : "h-[60vh] z-0"
            }`}
          >
            <AddFieldMap
              markers={markers}
              setMarkers={setMarkers}
              isAddingMarkers={isAddingMarkers}
              toggleAddMarkers={toggleAddMarkers}
              clearMarkers={clearMarkers}
              isTabletView={isTabletView}
              onToggleSidebar={toggleSidebar}
              showUploadOverlay={showOverlay}
            />

            {/* Bottom Controls */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-4 z-50 pointer-events-auto">
              <button className="bg-[#344E41] text-white px-4 py-1 rounded">
                Calendar
              </button>
              <button
                onClick={clearMarkers}
                className="bg-[#344E41] text-white px-4 py-1 rounded"
              >
                Undo
              </button>
              <button
                onClick={toggleAddMarkers}
                className="bg-[#344E41] text-white px-4 py-1 rounded"
              >
                {isAddingMarkers ? "Stop" : "Add Field"}
              </button>
            </div>
          </div>

          {/* Sidebar Bottom Half */}
          <AnimatePresence>
            {isSidebarVisible && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className={`w-full h-[40vh] p-4 flex justify-center items-center overflow-y-auto bg-white pointer-events-auto ${
                  showOverlay ? "z-10" : "z-20"
                }`}
              >
                <AddFieldSidebar
                  saveFarm={saveFarm}
                  markers={markers}
                  isTabletView={true}
                  currentArea={getCurrentArea()}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        // Desktop Layout
        <div className="w-full h-screen flex">
          <AddFieldSidebar 
            saveFarm={saveFarm} 
            markers={markers} 
            currentArea={getCurrentArea()}
          />
          <AddFieldMap
            markers={markers}
            setMarkers={setMarkers}
            isAddingMarkers={isAddingMarkers}
            toggleAddMarkers={toggleAddMarkers}
            clearMarkers={clearMarkers}
            onToggleSidebar={toggleSidebar}
          />
        </div>
      )}
    </div>
  );
};

export default AddField;