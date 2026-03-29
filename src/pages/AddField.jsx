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
  /** When set, map opens centered on the user (browser geolocation). */
  const [initialMapCenter, setInitialMapCenter] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = useSelector((state) => state?.auth?.user?.id);

  /* ================= DEFAULT MAP: USER LOCATION ================= */

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setInitialMapCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        /* Denied or error — AddFieldMap keeps its default center */
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      },
    );
  }, []);

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
    <div className="relative w-full min-h-screen h-[100dvh] overflow-hidden bg-[#f8faf8]">
      <AnimatePresence>
        {showOverlay && selectedField && (
          <motion.div
            key="pricing-overlay"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
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
        <div className="w-full min-h-screen flex flex-col">
          <div
            className={`relative w-full flex-shrink-0 border-b border-[#344e41]/20 shadow-sm ${
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
              initialMapCenter={initialMapCenter}
            />
          </div>

          <AnimatePresence>
            {isSidebarVisible && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.3 }}
                className={`w-full flex-grow overflow-y-auto bg-white rounded-t-2xl -mt-4 relative z-20 shadow-[0_-4px_20px_rgba(52,78,65,0.08)] ${
                  showOverlay ? "z-10" : "z-20"
                }`}
                style={{ minHeight: getSidebarHeight() }}
              >
                <div className="pt-4 pb-6 px-4 sm:px-6">
                  <AddFieldSidebar
                    saveFarm={saveFarm}
                    markers={markers}
                    isTabletView={true}
                    currentArea={getCurrentArea()}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="w-full h-screen flex overflow-hidden">
          <div className="hidden sm:block flex-shrink-0 border-r border-[#344e41]/15 bg-white shadow-sm">
            <AddFieldSidebar
              saveFarm={saveFarm}
              markers={markers}
              currentArea={getCurrentArea()}
            />
          </div>

          <div className="flex-1 min-w-0 relative">
            <AddFieldMap
              markers={markers}
              setMarkers={setMarkers}
              isAddingMarkers={isAddingMarkers}
              toggleAddMarkers={toggleAddMarkers}
              clearMarkers={clearMarkers}
              onToggleSidebar={toggleSidebar}
              initialMapCenter={initialMapCenter}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddField;
