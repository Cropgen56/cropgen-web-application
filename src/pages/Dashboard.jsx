import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import { PlusIcon, X } from "lucide-react";
import {
  fetchAOIs,
  createAOI,
  fetchForecastData,
} from "../redux/slices/weatherSlice";
import EvapotranspirationDashboard from "../components/dashboard/satellite-index/ETChart";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import SubscriptionModal from "../components/subscription/SubscriptionModal";
import PremiumContentWrapper from "../components/subscription/PremiumContentWrapper";
import PaymentSuccessModal from "../components/subscription/PaymentSuccessModal";
import {
  checkFieldSubscriptionStatus,
  setCurrentField,
  displayMembershipModal,
  hideMembershipModal,
  setNewFieldAdded,
  selectCurrentFieldHasSubscription,
  selectCurrentFieldFeatures,
  selectCurrentFieldSubscription,
  selectHasSatelliteMonitoring,
  selectHasGrowthStageTracking,
  selectHasWeatherForecast,
  selectHasAdvisory,
  selectHasInsights,
  selectHasSoilMoistureTemp,
} from "../redux/slices/membershipSlice";
import {
  setPaymentSuccess,
  clearPaymentSuccess,
  selectPaymentSuccess,
  selectShowPaymentSuccessModal
} from "../redux/slices/subscriptionSlice";
import PricingOverlay from "../components/pricing/PricingOverlay";

// Constants
const SELECTED_FIELD_KEY = "selectedFieldId";
const SUBSCRIPTION_CHECK_INTERVAL = 5 * 60 * 1000;

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
  const navigate = useNavigate();

  // Add refs to track API calls to prevent duplicates
  const aoiCreationRef = useRef(new Set());
  const forecastFetchRef = useRef(new Set());
  const lastFetchedAOIsRef = useRef(null);
  const isInitialMount = useRef(true);

  // Memoized selectors to prevent unnecessary re-renders
  const user = useSelector((state) => state?.auth?.user);
  const authToken = useSelector((state) => state?.auth?.token);
  const fieldsRaw = useSelector((state) => state?.farmfield?.fields);
  const fields = useMemo(() => fieldsRaw ?? [], [fieldsRaw]);

  const aoisRaw = useSelector((state) => state?.weather?.aois);
  const aois = useMemo(() => aoisRaw ?? [], [aoisRaw]);

  const forecastData = useSelector((state) => state.weather.forecastData) || [];
  const userId = user?.id;

  // Add membership selectors
  const showMembershipModal = useSelector(state => state.membership.showMembershipModal);
  const newFieldAdded = useSelector(state => state.membership.newFieldAdded);
  const currentFieldHasSubscription = useSelector(selectCurrentFieldHasSubscription);
  const fieldSubscriptions = useSelector(state => state.membership.fieldSubscriptions);
  const currentFieldSubscription = useSelector(selectCurrentFieldSubscription);
  const currentFieldFeatures = useSelector(selectCurrentFieldFeatures);

  // Payment success selectors from Redux
  const paymentSuccess = useSelector(selectPaymentSuccess);
  const showPaymentSuccessModalRedux = useSelector(selectShowPaymentSuccessModal);

  // Feature-specific selectors for each component
  const hasSatelliteMonitoring = useSelector(selectHasSatelliteMonitoring);
  const hasGrowthStageTracking = useSelector(selectHasGrowthStageTracking);
  const hasWeatherForecast = useSelector(selectHasWeatherForecast);
  const hasAdvisory = useSelector(selectHasAdvisory);
  const hasInsights = useSelector(selectHasInsights);
  const hasSoilMoistureTemp = useSelector(selectHasSoilMoistureTemp);

  const [delayPassed, setDelayPassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayPassed(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const { forecast, units } = forecastData;

  const WELCOME_OVERLAY_KEY = "hasSeenWelcome";
  const SESSION_SKIP_KEY = "skipPreviewThisSession";
  const [showAddFieldInfo, setShowAddFieldInfo] = useState(false);
  const [showVideoOverlay, setShowVideoOverlay] = useState(true);

  // State management
  const [markers, setMarkers] = useState([]);
  const [isAddingMarkers, setIsAddingMarkers] = useState(false);
  const [selectedField, setSelectedField] = useState(() => {
    return localStorage.getItem(SELECTED_FIELD_KEY) || "";
  });

  const [prevFieldsLength, setPrevFieldsLength] = useState(0);
  const [, setShowWelcome] = useState(false);
  const [showSelectFarmModal, setShowSelectFarmModal] = useState(false);

  // State for pricing overlay
  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);

  // Check subscription status when field changes
  useEffect(() => {
    if (selectedField && authToken) {
      dispatch(setCurrentField(selectedField));

      const fieldSub = fieldSubscriptions[selectedField];
      const shouldCheck = !fieldSub ||
        (fieldSub.lastChecked &&
          new Date() - new Date(fieldSub.lastChecked) > SUBSCRIPTION_CHECK_INTERVAL);

      if (shouldCheck) {
        dispatch(checkFieldSubscriptionStatus({
          fieldId: selectedField,
          authToken
        }));
      }
    }
  }, [selectedField, authToken, dispatch, fieldSubscriptions]);

  // Periodic subscription check
  useEffect(() => {
    if (!selectedField || !authToken) return;

    const interval = setInterval(() => {
      dispatch(checkFieldSubscriptionStatus({
        fieldId: selectedField,
        authToken
      }));
    }, SUBSCRIPTION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [selectedField, authToken, dispatch]);

  const selectedFieldDetails = useMemo(() => {
    return fields.find((item) => item?._id === selectedField) || null;
  }, [fields, selectedField]);

  const handleFieldSelection = useCallback((fieldId) => {
    setSelectedField(fieldId);
    localStorage.setItem(SELECTED_FIELD_KEY, fieldId);
  }, []);

  const handleSubscribe = useCallback(() => {
    if (selectedFieldDetails) {
      const areaInHectares = selectedFieldDetails?.areaInHectares ||
        selectedFieldDetails?.acre * 0.404686 ||
        5;
      const fieldData = {
        id: selectedFieldDetails._id,
        name: selectedFieldDetails.farmName,
        areaInHectares,
        cropName: selectedFieldDetails.cropName,
      };

      setPricingFieldData(fieldData);
      setShowPricingOverlay(true);
      dispatch(hideMembershipModal());
    } else {
      message.warning("Please select a field first");
    }
  }, [selectedFieldDetails, dispatch]);

  const handleSkipMembership = useCallback(() => {
    dispatch(hideMembershipModal());
    message.info("You can activate premium anytime from the locked content sections");
  }, [dispatch]);

  const handleCloseMembershipModal = useCallback(() => {
    dispatch(hideMembershipModal());
  }, [dispatch]);

  // Handle payment success from pricing overlay - FIXED: Only use Redux
  const handlePaymentSuccess = useCallback((successData) => {
    // Close pricing overlay
    setShowPricingOverlay(false);
    setPricingFieldData(null);

    // Only dispatch to Redux (single source of truth)
    dispatch(setPaymentSuccess({
      ...successData,
      fieldName: successData.fieldName || selectedFieldDetails?.farmName,
    }));

    // Refresh subscription status
    if (selectedField && authToken) {
      dispatch(checkFieldSubscriptionStatus({
        fieldId: selectedField,
        authToken
      }));
    }
  }, [selectedField, authToken, dispatch, selectedFieldDetails]);

  // Handle closing Redux payment success modal
  const handleCloseReduxPaymentSuccess = useCallback(() => {
    dispatch(clearPaymentSuccess());
  }, [dispatch]);

  useEffect(() => {
    if (newFieldAdded && fields.length > 0 && !currentFieldHasSubscription) {
      const timer = setTimeout(() => {
        dispatch(displayMembershipModal());
        dispatch(setNewFieldAdded(false));
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [newFieldAdded, fields.length, currentFieldHasSubscription, dispatch]);

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

  useEffect(() => {
    if (selectedField && !fields.find((f) => f._id === selectedField)) {
      localStorage.removeItem(SELECTED_FIELD_KEY);
      setSelectedField("");
    }
  }, [fields, selectedField]);

  // Initial data fetching
  useEffect(() => {
    if (!userId) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;

      const fetchInitialData = async () => {
        await dispatch(getFarmFields(userId));

        if (lastFetchedAOIsRef.current !== userId) {
          dispatch(fetchAOIs());
          lastFetchedAOIsRef.current = userId;
        }
      };

      fetchInitialData();
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (fields.length === 0) return;

    const latestField = fields[fields.length - 1]?._id;

    if (!selectedField && latestField) {
      handleFieldSelection(latestField);
    }

    if (fields.length > prevFieldsLength && latestField) {
      handleFieldSelection(latestField);
    }

    setPrevFieldsLength(fields.length);
  }, [fields, selectedField, prevFieldsLength, handleFieldSelection]);

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

  // AOI creation
  useEffect(() => {
    if (!payload || !payload.geometry.coordinates[0].length) return;

    const aoiKey = payload.name;

    if (aoiCreationRef.current.has(aoiKey)) {
      return;
    }

    const existingAOI = aois.find((aoi) => aoi.name === aoiKey);
    if (existingAOI) {
      return;
    }

    aoiCreationRef.current.add(aoiKey);
    dispatch(createAOI(payload));
  }, [payload, dispatch, aois]);

  // Forecast fetching
  useEffect(() => {
    if (!selectedFieldDetails || aois.length === 0) return;

    const matchingAOI = aois.find(
      (aoi) => aoi.name === selectedFieldDetails._id
    );

    if (!matchingAOI || !matchingAOI.id) return;

    const forecastKey = `${matchingAOI.id}_${Date.now()}`;

    const recentFetch = Array.from(forecastFetchRef.current).find(key =>
      key.startsWith(matchingAOI.id) &&
      (Date.now() - parseInt(key.split('_')[1])) < 300000
    );

    if (recentFetch) {
      return;
    }

    forecastFetchRef.current = new Set(
      Array.from(forecastFetchRef.current).filter(key => {
        const timestamp = parseInt(key.split('_')[1]);
        return (Date.now() - timestamp) < 300000;
      })
    );

    forecastFetchRef.current.add(forecastKey);
    dispatch(fetchForecastData({ geometry_id: matchingAOI.id }));
  }, [dispatch, selectedFieldDetails, aois]);

  // Clean up refs when component unmounts
  useEffect(() => {
    return () => {
      aoiCreationRef.current.clear();
      forecastFetchRef.current.clear();
      isInitialMount.current = true;
    };
  }, []);

  useEffect(() => {
    if (currentFieldSubscription) {
      console.log('Current field subscription:', currentFieldSubscription);
      console.log('Current field features:', currentFieldFeatures);
    }
  }, [currentFieldSubscription, currentFieldFeatures]);

  return (
    <div className="dashboard min-h-screen w-full overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden float-end p-1.5 lg:p-3">
      {/* Membership Modal */}
      <SubscriptionModal
        isOpen={showMembershipModal}
        onClose={handleCloseMembershipModal}
        onSubscribe={handleSubscribe}
        onSkip={handleSkipMembership}
        fieldName={selectedFieldDetails?.farmName}
      />

      {/* Pricing Overlay with onPaymentSuccess callback */}
      <AnimatePresence>
        {showPricingOverlay && pricingFieldData && (
          <motion.div
            key="pricing-overlay"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-8"
          >
            <PricingOverlay
              onClose={() => setShowPricingOverlay(false)}
              userArea={pricingFieldData.areaInHectares}
              selectedField={pricingFieldData}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Success Modal - Redux State (ONLY ONE MODAL NOW) */}
      <PaymentSuccessModal
        isOpen={showPaymentSuccessModalRedux}
        onClose={handleCloseReduxPaymentSuccess}
        fieldName={paymentSuccess?.fieldName || selectedFieldDetails?.farmName}
        planName={paymentSuccess?.planName}
        features={paymentSuccess?.features || []}
        daysLeft={paymentSuccess?.daysLeft}
        transactionId={paymentSuccess?.transactionId}
      />

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
          {/* Crop Health - requires soilMoistureTemp feature */}
          <CropHealth
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
            fields={fields}
            isLocked={!hasSoilMoistureTemp}
            onSubscribe={handleSubscribe}
          />

          {/* Weather Forecast - requires weatherForecast feature */}
          <PremiumContentWrapper
            isLocked={!hasWeatherForecast}
            onSubscribe={handleSubscribe}
            title="Weather Forecast"
          >
            <ForeCast forecastData={forecastData} />
          </PremiumContentWrapper>

          {/* Satellite Monitoring - requires satelliteCropMonitoring feature */}
          <NdviGraph
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
            isLocked={!hasSatelliteMonitoring}
            onSubscribe={handleSubscribe}
          />

          <WaterIndex
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
            isLocked={!hasSatelliteMonitoring}
            onSubscribe={handleSubscribe}
          />

          <PremiumContentWrapper
            isLocked={!hasSatelliteMonitoring}
            onSubscribe={handleSubscribe}
            title="Evapotranspiration Monitoring"
          >
            <EvapotranspirationDashboard forecast={forecast} units={units} />
          </PremiumContentWrapper>

          {/* Insights - requires insights feature */}
          <PremiumContentWrapper
            isLocked={!hasInsights}
            onSubscribe={handleSubscribe}
            title="Farm Insights"
          >
            <Insights />
          </PremiumContentWrapper>

          {/* Crop Advisory - requires advisory feature */}
          <CropAdvisory
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
            isLocked={!hasAdvisory}
            onSubscribe={handleSubscribe}
          />

          {/* Plant Growth - requires growthStageTracking feature */}
          <PlantGrowthActivity
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
            isLocked={!hasGrowthStageTracking}
            onSubscribe={handleSubscribe}
          />
        </>
      )}

      {/* Welcome Video Overlay */}
      <AnimatePresence mode="wait">
        {delayPassed && fields.length === 0 && showVideoOverlay && (
          <motion.div
            key="welcome-video"
            className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-[9999] text-white p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <button
              onClick={() => setShowVideoOverlay(false)}
              className="absolute top-5 right-5 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all duration-300"
            >
              <X />
            </button>
            <div className="relative W-[90%] lg:w-[80%] aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/20">
              <iframe
                className="w-full h-full rounded-2xl"
                src="https://www.youtube.com/embed/U_sVgXnqYPk?autoplay=1&mute=1&loop=1&playlist=U_sVgXnqYPk"
                title="CropGen Tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
            <div className="flex flex-row items-center justify-center gap-4 mt-6">
              <button
                onClick={() => {
                  setShowAddFieldInfo(true);
                  setShowVideoOverlay(false);
                  navigate("/addfield");
                }}
                className="flex items-center gap-1 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-semibold text-base shadow-lg transition-all duration-500 ease-in-out cursor-pointer"
              >
                <PlusIcon className="w-5 h-5 mr-2" /> Add Your First Field
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Select Farm Modal */}
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