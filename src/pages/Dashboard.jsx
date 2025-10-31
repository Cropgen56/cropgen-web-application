import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { getFarmFields } from "../redux/slices/farmSlice";
import MapView from "../components/dashboard/mapview/MapView";
import CropHealth from "../components/dashboard/crophealth/CropHealthCard";
import ForeCast from "../components/dashboard/forecast/ForeCast";
import PlantGrowthActivity from "../components/dashboard/plantgrowthactivity/PlantGrowthActivity";
import Insights from "../components/dashboard/insights/Insights";
import CropAdvisory from "../components/dashboard/cropadvisory/CropAdvisory";
import "../styles/dashboard.css";
import NdviGraph from "../components/dashboard/satellite-index/vegitation-index/VegetationIndex";
import WaterIndex from "../components/dashboard/satellite-index/water-index/WaterIndex";
import logo from "../assets/image/login/logo.svg";
import tut from "../assets/image/login/video.mp4";
import forcast from "../assets/image/login/doughnut.png";
import ndvi from "../assets/image/login/index-image.png";
import report from "../assets/image/login/report-cards.png";
import {
  fetchAOIs,
  createAOI,
  fetchForecastData,
} from "../redux/slices/weatherSlice";
import EvapotranspirationDashboard from "../components/dashboard/satellite-index/ETChart";
import { useNavigate } from "react-router-dom";
// Constants
const SELECTED_FIELD_KEY = "selectedFieldId";

// Utility: Convert lat/lng objects to [lng, lat] format and close the polygon if necessary
const formatCoordinates = (data) => {
  if (!data || data.length === 0) return [];
  const coords = data.map((point) => [point.lng, point.lat]);
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    coords.push(first);
  }
  return coords;
};

const Dashboard = () => {
  const dispatch = useDispatch();

  // Memoized selectors to prevent unnecessary re-renders
  const user = useSelector((state) => state?.auth?.user);
  // const fields = useSelector((state) => state?.farmfield?.fields) || [];
  // const aois = useSelector((state) => state?.weather?.aois) || [];
  const fieldsRaw = useSelector((state) => state?.farmfield?.fields);
  const fields = useMemo(() => fieldsRaw ?? [], [fieldsRaw]);

  const aoisRaw = useSelector((state) => state?.weather?.aois);
  const aois = useMemo(() => aoisRaw ?? [], [aoisRaw]);

  const forecastData = useSelector((state) => state.weather.forecastData) || [];
  const userId = user?.id;

  const [delayPassed, setDelayPassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayPassed(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const { forecast, units } = forecastData;

  const WELCOME_OVERLAY_KEY = "hasSeenWelcome"; // localStorage key
  const SESSION_SKIP_KEY = "skipPreviewThisSession"; // sessionStorage
  const [showAddFieldInfo, setShowAddFieldInfo] = useState(false);

  // State management
  const [markers, setMarkers] = useState([]);
  const [isAddingMarkers, setIsAddingMarkers] = useState(false);
  const [selectedField, setSelectedField] = useState(() => {
    return localStorage.getItem(SELECTED_FIELD_KEY) || "";
  });

  const [prevFieldsLength, setPrevFieldsLength] = useState(0);
  const [, setShowWelcome] = useState(false);
  const [showSelectFarmModal, setShowSelectFarmModal] = useState(false);
  const navigate = useNavigate();

  // const listVariants = {
  //   hidden: { opacity: 0, y: 20 },
  //   visible: (i) => ({
  //     opacity: 1,
  //     y: 0,
  //     transition: { delay: i * 1, duration: 0.6, ease: "easeOut" }, // 1s gap
  //   }),
  // };

  useEffect(() => {
    if (
      fields.length === 0 &&
      !localStorage.getItem(WELCOME_OVERLAY_KEY) &&
      !sessionStorage.getItem(SESSION_SKIP_KEY)
    ) {
      setShowWelcome(true);
    }
  }, [fields]);

  useEffect(() => {
    const skip = localStorage.getItem("skipAddFieldPreview");
    if (!skip && fields.length === 0) {
      setShowAddFieldInfo(true);
    }
  }, [fields]);

  useEffect(() => {
    if (fields.length > 0 && !selectedField) {
      setShowSelectFarmModal(true);
    } else {
      setShowSelectFarmModal(false);
    }
  }, [fields, selectedField]);

  // Memoized computed values
  const selectedFieldDetails = useMemo(() => {
    return fields.find((item) => item?._id === selectedField) || null;
  }, [fields, selectedField]);

  // Memoized callback for field selection
  const handleFieldSelection = useCallback((fieldId) => {
    setSelectedField(fieldId);
    localStorage.setItem(SELECTED_FIELD_KEY, fieldId);
  }, []);

  // Fetch fields and AOIs on component mount - only when userId changes
  useEffect(() => {
    if (userId) {
      dispatch(getFarmFields(userId));
      dispatch(fetchAOIs());
    }
  }, [dispatch, userId]);

  // Optimized field selection logic
  useEffect(() => {
    if (fields.length === 0) return;

    const isNewFieldAdded =
      fields.length > prevFieldsLength && prevFieldsLength > 0;
    const isInitialLoad = !selectedField && prevFieldsLength === 0;

    // Always select the latest field when a new one is added
    if (isNewFieldAdded) {
      const latestField = fields[fields.length - 1]?._id;
      if (latestField) {
        handleFieldSelection(latestField);
      }
    } else if (isInitialLoad) {
      const latestField = fields[fields.length - 1]?._id;
      if (latestField) {
        handleFieldSelection(latestField);
      }
    }

    setPrevFieldsLength(fields.length);
  }, [fields, prevFieldsLength, selectedField, handleFieldSelection]);

  // Prepare payload whenever a new field is selected
  const payload = useMemo(() => {
    if (!selectedFieldDetails?.field?.length) return null;

    const geometryCoords = formatCoordinates(selectedFieldDetails.field);

    return {
      name: selectedFieldDetails?._id,
      geometry: {
        type: "Polygon",
        coordinates: [geometryCoords],
      },
    };
  }, [selectedFieldDetails]);

  // Dispatch createAOI when payload changes, but only if AOI doesn't already exist
  useEffect(() => {
    if (payload && payload.geometry.coordinates[0].length > 0) {
      const existingAOI = aois.find((aoi) => aoi.name === payload.name);
      if (!existingAOI) {
        dispatch(createAOI(payload));
      }
    }
  }, [payload, dispatch, aois]);

  // Dispatch fetchForecastData when selectedFieldDetails or aois changes
  useEffect(() => {
    if (selectedFieldDetails && aois.length > 0) {
      const matchingAOI = aois.find(
        (aoi) => aoi.name === selectedFieldDetails._id
      );
      if (matchingAOI && matchingAOI.id) {
        dispatch(fetchForecastData({ geometry_id: matchingAOI.id }));
      }
    }
  }, [dispatch, selectedFieldDetails, aois]);

  // Memoized props objects to prevent unnecessary re-renders
  // const mapViewProps = useMemo(
  //   () => ({
  //     markers,
  //     setMarkers,
  //     isAddingMarkers,
  //     setIsAddingMarkers,
  //     selectedField,
  //     setSelectedField: handleFieldSelection,
  //     selectedFieldsDetials: selectedFieldDetails ? [selectedFieldDetails] : [],
  //     fields,
  //   }),
  //   [
  //     markers,
  //     isAddingMarkers,
  //     selectedField,
  //     handleFieldSelection,
  //     selectedFieldDetails,
  //     fields,
  //   ]
  // );

  // const cropHealthProps = useMemo(
  //   () => ({
  //     selectedFieldsDetials: selectedFieldDetails ? [selectedFieldDetails] : [],
  //     fields,
  //   }),
  //   [selectedFieldDetails, fields]
  // );

  // const ndviGraphProps = useMemo(
  //   () => ({
  //     selectedFieldsDetials: selectedFieldDetails ? [selectedFieldDetails] : [],
  //   }),
  //   [selectedFieldDetails]
  // );

  // const cropAdvisoryProps = useMemo(
  //   () => ({
  //     selectedFieldsDetials: selectedFieldDetails ? [selectedFieldDetails] : [],
  //   }),
  //   [selectedFieldDetails]
  // );

  // const plantGrowthProps = useMemo(
  //   () => ({
  //     selectedFieldsDetials: selectedFieldDetails ? [selectedFieldDetails] : [],
  //   }),
  //   [selectedFieldDetails]
  // );

  return (
    <div className="dashboard min-h-screen w-full overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden float-end p-1.5 lg:p-3">
      {/* Main content */}
      <MapView
        markers={markers}
        setMarkers={setMarkers}
        isAddingMarkers={isAddingMarkers}
        setIsAddingMarkers={setIsAddingMarkers}
        selectedField={selectedField}
        setSelectedField={handleFieldSelection}
        selectedFieldsDetials={
          selectedFieldDetails ? [selectedFieldDetails] : []
        }
        fields={fields}
      />

      {fields.length > 0 && (
        <>
          <CropHealth
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
            fields={fields}
          />
          <ForeCast forecastData={forecastData} />
          <NdviGraph
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
          />
          <WaterIndex
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
          />
          <EvapotranspirationDashboard forecast={forecast} units={units} />
          <Insights />
          <CropAdvisory
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
          />
          <PlantGrowthActivity
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
          />
        </>
      )}

      {/* Welcome Overlay */}
      <AnimatePresence mode="wait">
        {delayPassed && fields.length === 0 && !showAddFieldInfo && (
          <motion.div
            key="welcome"
            className="absolute inset-0 bg-black/80 flex flex-col lg:flex-row items-center lg:items-center justify-between z-[9999] text-white 
                 p-4 sm:p-6 md:p-8 lg:p-10 m-2 rounded-xl overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
          >
            {/* LEFT SIDE */}
            <div className="flex flex-col justify-between h-full max-w-lg w-full lg:w-auto text-center lg:text-left ml-5">
              <div className="mt-10 lg:mt-[30%]" />
              <div>
                <motion.h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-lg flex justify-start"
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  Hey!
                </motion.h1>

                <motion.h2
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white drop-shadow-md mt-4 flex  lg:flex-row items-center gap-2"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                >
                  New to
                  <img
                    src={logo}
                    alt="CropGen"
                    className="w-6 sm:w-8 lg:w-10 h-auto inline-block"
                  />
                  CropGen?
                </motion.h2>
              </div>

              {/* Bottom Section */}
              <div className="flex flex-col items-center lg:items-start">
                <motion.h4
                  className=" text-left text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed mb-10 sm:mb-8"
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <p className="flex flex-col">
                    Start your{" "}
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#5a7c6b] via-[#4caf50] to-[#a8e6a1] bg-clip-text text-transparent">
                      Smart Farming
                    </span>{" "}
                    journey with us. Add a field and start monitoring your farm
                    today.
                  </p>
                </motion.h4>

                <motion.div
                  className="relative flex flex-col items-center lg:items-start"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: "backOut", delay: 0.4 }}
                >
                  <motion.button
                    onClick={() => {
                      setShowAddFieldInfo(true);
                      navigate("/addfield");
                    }}
                    className="px-4 sm:px-5 md:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 rounded-xl 
                         text-sm sm:text-base md:text-lg text-white font-semibold shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    + Add Field
                  </motion.button>

                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="white"
                    className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 mt-3 sm:mt-4 mx-auto"
                    animate={{ y: [0, 12, 0] }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </motion.svg>
                </motion.div>
              </div>
            </div>

            {/* RIGHT SIDE Animations */}
            <motion.div
              className="relative w-full lg:w-1/2 flex items-center h-full justify-center mt-8 lg:mt-0"
              initial={{ opacity: 0, y: -80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.4 }}
            >
              <motion.img
                src={report}
                alt="Report"
                className="relative z-10 w-0 sm:w-0  lg:w-[520px] opacity-95 mt-6 sm:mt-12 lg:mt-20"
                animate={{ y: [0, -12, 0] }}
                transition={{
                  duration: 2.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.img
                src={forcast}
                alt="Forecast"
                className="absolute -top-6 sm:-top-8 lg:-top-10 left-[40px] sm:left-[50px] lg:left-[60px] 
                     w-28 sm:w-36 md:w-[160px] lg:w-[200px] opacity-90 mt-6 lg:mt-10"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.img
                src={ndvi}
                alt="NDVI"
                className="absolute -top-6 sm:-top-8 lg:-top-10 right-[40px] sm:right-[50px] lg:right-[60px] 
                     w-28 sm:w-36 md:w-[160px] lg:w-[200px] opacity-90 mt-6 lg:mt-10"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 2.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </motion.div>
        )}

        {showAddFieldInfo && (
          <motion.div
            key="addfield"
            className="absolute inset-0 bg-black/85 flex flex-col items-start justify-start text-white 
         p-6 sm:p-8 md:p-10 lg:p-12 m-2 rounded-xl z-[9999] overflow-y-auto"
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            {/* Skip Preview Button */}
            <motion.button
              onClick={() => {
                localStorage.setItem("skipAddFieldPreview", "true");
                setShowAddFieldInfo(false);
              }}
              className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg 
                 bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-semibold text-white 
                 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 sm:w-5 sm:h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25a2.25 2.25 0 00-2.25-2.25h-6a2.25 2.25 0 00-2.25 
             2.25v13.5a2.25 2.25 0 002.25 2.25h6a2.25 2.25 0 002.25-2.25V15m3 
             0l3-3m0 0l-3-3m3 3H9"
                />
              </svg>
              Skip Preview
            </motion.button>

            {/* Heading */}
            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold 
                 bg-gradient-to-r from-[#5a7c6b] via-[#4caf50] to-[#a8e6a1] 
                 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              How to Add a Field?
            </motion.h2>

            {/* Video Player */}
            <motion.div
              className="w-full flex justify-center mb-6 mt-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            >
              <video
                src={tut}
                autoPlay
                loop
                muted
                playsInline
                className="rounded-lg shadow-lg max-w-lg w-full h-auto"
              />
            </motion.div>

            {/* Instructions */}
            <motion.h3
              className="text-left text-2xl sm:text-3xl md:text-4xl font-bold 
                 bg-gradient-to-r from-[#5a7c6b] via-[#4caf50] to-[#a8e6a1] 
                 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Instructions:
            </motion.h3>

            <div className="w-full  text-left space-y-3 mb-10">
              {[
                "Open the Add Field section from your dashboard and navigate to the map view.",
                "Locate your farm on the map and use the 'Start Adding Markers' tool to carefully mark your field boundaries.",
                "Fill in all the necessary details such as crop name, sowing date, and other required information.",
                "Finally, click on 'Add Field' to save your field and start monitoring your crops in real-time.",
              ].map((step, i, arr) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-2 w-full"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1 + i * 0.4 }}
                >
                  {/* Arrow */}
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="white"
                    className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-[2px] flex-shrink-0"
                    style={{ transform: "rotate(-90deg)" }}
                    animate={{ x: [0, 6, 0] }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </motion.svg>

                  {/* Text + Button only for last step */}
                  {i === arr.length - 1 ? (
                    <div className="flex justify-between items-start w-full ">
                      <p
                        className="text-sm sm:text-xl font-bold text-green-600 leading-snug break-words  bg-gradient-to-r from-[#5a7c6b] via-[#4caf50] to-[#a8e6a1] 
                 bg-clip-text text-transparent   flex-1"
                      >
                        {step}
                      </p>
                      <motion.div
                        className="relative flex flex-col items-center lg:items-start"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          duration: 0.6,
                          ease: "backOut",
                          delay: 0.4,
                        }}
                      >
                        <motion.button
                          onClick={() => {
                            // Play exit animation
                            setShowAddFieldInfo(false);

                            // Delay navigation until animation finishes
                            setTimeout(() => {
                              navigate("/addfield");
                            }, 900); // match your transition={{ duration: 0.7 }}
                          }}
                          className="px-4 sm:px-5 md:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 rounded-xl 
             text-sm sm:text-base md:text-lg text-white font-semibold shadow-lg"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          + Start Adding Your Field
                        </motion.button>

                        <motion.svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="white"
                          className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 mt-3 sm:mt-4 mx-auto"
                          animate={{ y: [0, 12, 0] }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </motion.svg>
                      </motion.div>
                    </div>
                  ) : (
                    <p className="text-sm sm:text-base leading-snug">{step}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* show select farm modal if no field is selected */}
      <AnimatePresence>
        {showSelectFarmModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/90 p-6 rounded-2xl shadow-2xl text-center max-w-sm w-[90%] border border-green-200 relative overflow-hidden"
              initial={{ scale: 0.7, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 40 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <motion.div
                initial={{ rotate: -5, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 80 }}
              >
                <h2 className="text-2xl font-extrabold text-green-700 mb-3 tracking-wide">
                  Select a Farm
                </h2>
                <p className="text-gray-600 mb-6 text-base leading-relaxed">
                  Please select a farm first to continue using the dashboard.
                </p>
              </motion.div>
              <button
                onClick={() => setShowSelectFarmModal(false)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-500 ease-in-out cursor-pointer"
              >
                Go to Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(Dashboard);
