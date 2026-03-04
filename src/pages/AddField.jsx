import React, { useState, useEffect } from "react";
import AddFieldMap from "../components/addfield/AddFieldMap";
import AddFieldSidebar from "../components/addfield/AddFieldSidebar";
import { useDispatch, useSelector } from "react-redux";
import { addFarmField } from "../redux/slices/farmSlice";
import { useNavigate } from "react-router-dom";
import * as turf from "@turf/turf";
import { message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import PricingOverlay from "../components/pricing/PricingOverlay";

const AddField = () => {
  const [markers, setMarkers] = useState([]);
  const [isAddingMarkers, setIsAddingMarkers] = useState(false);
  const [isTabletView, setIsTabletView] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const [selectedField, setSelectedField] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = useSelector((state) => state?.auth?.user?.id);

  /* ================= RESPONSIVE ================= */

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobileView(width < 640);
      setIsTabletView(width < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ================= MAP ACTIONS ================= */

  const toggleAddMarkers = () => setIsAddingMarkers((prev) => !prev);

  const clearMarkers = () => setMarkers([]);

  const toggleSidebar = (visible) => setIsSidebarVisible(visible);

  /* ================= AREA CALCULATION ================= */

  const calculateArea = (coords) => {
    if (coords.length < 3) return 0;

    const coordinates = coords.map((point) => [point.lng, point.lat]);
    coordinates.push(coordinates[0]);

    const polygon = turf.polygon([coordinates]);
    const area = turf.area(polygon);

    return area / 4046.86; // acres
  };

  const acresToHectares = (acres) => acres * 0.404686;

  /* ================= SAVE FIELD ================= */

  const saveFarm = async ({
    cropName,
    variety,
    sowingDate,
    typeOfIrrigation,
    farmName,
    typeOfFarming,
  }) => {
    if (markers.length === 0) {
      message.error("No markers added. Please add markers first.");
      return;
    }

    const areaInAcres = calculateArea(markers);
    const areaInHectares = acresToHectares(areaInAcres);

    try {
      const result = await dispatch(
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
          areaInHectares,
        }),
      ).unwrap();

      if (result?.success) {
        message.success("Field added successfully!");

        const field = result.farmField;

        const fieldData = {
          id: field._id,
          fieldName: field.fieldName,
          cropName: field.cropName,
          acre: field.acre,
          subscription: field.subscription || null,
        };

        setSelectedField(fieldData);
        setShowOverlay(true);
        setPendingRedirect(true);
      } else {
        message.error("Failed to add field. Please try again.");
      }
    } catch (error) {
      console.error("Error adding field:", error);
      message.error("Failed to add field. Please try again.");
    }
  };

  /* ================= CLOSE PRICING ================= */

  const handleClosePricing = () => {
    setShowOverlay(false);
    setSelectedField(null);

    if (pendingRedirect) {
      navigate("/cropgen-analytics");
    }
  };

  /* ================= CURRENT AREA ================= */

  const getCurrentArea = () => {
    if (markers.length < 3) return 0;
    return acresToHectares(calculateArea(markers));
  };

  const getMapHeight = () => {
    if (isMobileView) return "35vh";
    return "40vh";
  };

  const getSidebarHeight = () => {
    if (isMobileView) return "65vh";
    return "60vh";
  };

  /* ================= RENDER ================= */

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <AnimatePresence>
        {showOverlay && selectedField && (
          <motion.div
            key="pricing-overlay"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <PricingOverlay
              onClose={handleClosePricing}
              selectedField={selectedField}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {isTabletView ? (
        <div className="w-full h-screen flex flex-col relative overflow-hidden">
          <div
            className={`relative w-full flex-shrink-0 ${
              showOverlay ? "h-screen z-[30]" : "z-0"
            }`}
            style={{ height: showOverlay ? "100vh" : getMapHeight() }}
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

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-4 z-50">
              <button className="bg-[#344E41] text-white px-3 py-1 rounded text-sm">
                Calendar
              </button>

              <button
                onClick={clearMarkers}
                className="bg-[#344E41] text-white px-3 py-1 rounded text-sm"
              >
                Undo
              </button>

              <button
                onClick={toggleAddMarkers}
                className="bg-[#344E41] text-white px-3 py-1 rounded text-sm"
              >
                {isAddingMarkers ? "Stop" : "Add Field"}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isSidebarVisible && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.4 }}
                className={`w-full flex-grow p-4 overflow-y-auto bg-white ${
                  showOverlay ? "z-10" : "z-20"
                }`}
                style={{ height: getSidebarHeight() }}
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
        <div className="w-full h-screen flex overflow-hidden">
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
