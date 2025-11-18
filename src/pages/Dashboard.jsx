import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
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
  selectShowPaymentSuccessModal,
} from "../redux/slices/subscriptionSlice";
import PricingOverlay from "../components/pricing/PricingOverlay";

/* -------------------------
   Constants & Utilities
   ------------------------- */
const SELECTED_FIELD_KEY = "selectedFieldId";
const SUBSCRIPTION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const FORECAST_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const formatCoordinates = (data) => {
  if (!Array.isArray(data) || data.length === 0) return [];
  const coords = data.map((p) => [p.lng, p.lat]);
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) coords.push(first);
  return coords;
};

/* -------------------------
   Dashboard Component
   ------------------------- */
const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showSelectFarmModal, setShowSelectFarmModal] = useState(false);

  /* -------------------------
     Refs to avoid duplicate calls
     ------------------------- */
  const aoiCreationRef = useRef(new Set()); // tracks AOI names already being created
  const forecastFetchRef = useRef(new Map()); // map<geometryId, timestamp>
  const subscriptionCheckRef = useRef({
    lastCheckedForField: null,
    intervalId: null,
  });
  const isMountedRef = useRef(false);

  /* -------------------------
     Selectors (memoized by React/Redux)
     ------------------------- */
  const user = useSelector((s) => s?.auth?.user);
  const authToken = useSelector((s) => s?.auth?.token);
  const fieldsRaw = useSelector((s) => s?.farmfield?.fields);
  const fields = useMemo(() => fieldsRaw ?? [], [fieldsRaw]);

  const aoisRaw = useSelector((s) => s?.weather?.aois);
  const aois = useMemo(() => aoisRaw ?? [], [aoisRaw]);

  const forecastData = useSelector((s) => s?.weather?.forecastData) || {};
  const userId = user?.id;

  /* membership selectors */
  const showMembershipModal = useSelector(
    (s) => s.membership.showMembershipModal
  );
  const newFieldAdded = useSelector((s) => s.membership.newFieldAdded);
  const currentFieldHasSubscription = useSelector(
    selectCurrentFieldHasSubscription
  );
  const fieldSubscriptions = useSelector(
    (s) => s.membership.fieldSubscriptions
  );
  const currentFieldSubscription = useSelector(selectCurrentFieldSubscription);
  const currentFieldFeatures = useSelector(selectCurrentFieldFeatures);

  /* payment success selectors */
  const paymentSuccess = useSelector(selectPaymentSuccess);
  const showPaymentSuccessModalRedux = useSelector(
    selectShowPaymentSuccessModal
  );

  /* feature flags */
  const hasSatelliteMonitoring = useSelector(selectHasSatelliteMonitoring);
  const hasGrowthStageTracking = useSelector(selectHasGrowthStageTracking);
  const hasWeatherForecast = useSelector(selectHasWeatherForecast);
  const hasAdvisory = useSelector(selectHasAdvisory);
  const hasInsights = useSelector(selectHasInsights);
  const hasSoilMoistureTemp = useSelector(selectHasSoilMoistureTemp);

  /* -------------------------
     Local UI State
     ------------------------- */
  const [delayPassed, setDelayPassed] = useState(false);
  const [showAddFieldInfo, setShowAddFieldInfo] = useState(false);
  const [showVideoOverlay, setShowVideoOverlay] = useState(true);

  const [markers, setMarkers] = useState([]);
  const [isAddingMarkers, setIsAddingMarkers] = useState(false);

  // selectedField is stored as id string in localStorage; keep as primitive
  const [selectedField, setSelectedField] = useState(() => {
    return localStorage.getItem(SELECTED_FIELD_KEY) || "";
  });

  const [prevFieldsLength, setPrevFieldsLength] = useState(0);

  // pricing overlay state
  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);

  /* -------------------------
     Derived / memoized values
     ------------------------- */
  const selectedFieldDetails = useMemo(() => {
    return fields.find((f) => f?._id === selectedField) || null;
  }, [fields, selectedField]);

  const { forecast, units } = forecastData || {};

  /* -------------------------
     Minor UI delay to avoid flashes
     ------------------------- */
  useEffect(() => {
    const t = setTimeout(() => setDelayPassed(true), 1000);
    return () => clearTimeout(t);
  }, []);

  /* -------------------------
     INITIAL LOAD: fetch farm fields + AOIs (only once per user)
     - We fetch farm fields first, then AOIs if not already fetched for this user.
     ------------------------- */
  useEffect(() => {
    if (!userId) return;

    // fetch farm fields always when user changes
    dispatch(getFarmFields(userId));

    // fetch AOIs once per user (track with ref)
    // keep this a primitive-check (userId) to avoid extra calls
    if (!isMountedRef.current) {
      // first mount
      dispatch(fetchAOIs());
      isMountedRef.current = true;
    }
  }, [dispatch, userId]);

  /* -------------------------
     Maintain selected field:
     - If no selectedField and fields exist, pick latest field
     - If selectedField no longer exists (deleted), clear selection
     ------------------------- */
  useEffect(() => {
    if (!selectedField && fields.length > 0) {
      const latestField = fields[fields.length - 1]?._id;
      if (latestField) {
        setSelectedField(latestField);
        localStorage.setItem(SELECTED_FIELD_KEY, latestField);
      }
    }

    // ensure we don't hold an invalid selectedField
    if (selectedField && !fields.find((f) => f._id === selectedField)) {
      localStorage.removeItem(SELECTED_FIELD_KEY);
      setSelectedField("");
    }

    // track fields length to detect newly added fields
    if (fields.length !== prevFieldsLength) setPrevFieldsLength(fields.length);
  }, [fields, selectedField, prevFieldsLength]);

  /* -------------------------
     When a field is selected: immediately set current field in membership slice
     and run subscription status check right away (if token present).
     This effect runs only when selectedField or authToken changes.
     ------------------------- */
  useEffect(() => {
    if (!selectedField) return;

    // set current field for membership slice (single source of truth)
    dispatch(setCurrentField(selectedField));

    // If authToken present, check subscription status immediately (and update the "last checked" ref.)
    if (authToken) {
      // Avoid duplicate immediate checks for the same field
      if (subscriptionCheckRef.current.lastCheckedForField !== selectedField) {
        subscriptionCheckRef.current.lastCheckedForField = selectedField;
        dispatch(
          checkFieldSubscriptionStatus({ fieldId: selectedField, authToken })
        );
      }

      // Ensure only one periodic interval exists
      if (!subscriptionCheckRef.current.intervalId) {
        const id = setInterval(() => {
          dispatch(
            checkFieldSubscriptionStatus({ fieldId: selectedField, authToken })
          );
        }, SUBSCRIPTION_CHECK_INTERVAL);
        subscriptionCheckRef.current.intervalId = id;
      }
    }
    // clean-up: if authToken becomes unavailable, clear interval
    return () => {
      // don't clear interval here — only when component unmounts to keep periodic checks alive
    };
  }, [selectedField, authToken, dispatch]);

  /* Clear periodic subscription interval when component unmounts */
  useEffect(() => {
    return () => {
      if (subscriptionCheckRef.current.intervalId) {
        clearInterval(subscriptionCheckRef.current.intervalId);
        subscriptionCheckRef.current.intervalId = null;
        subscriptionCheckRef.current.lastCheckedForField = null;
      }
    };
  }, []);

  /* -------------------------
     Auto-open membership modal when a new field is added and it doesn't have a subscription
     (throttled small delay for UX)
     ------------------------- */
  useEffect(() => {
    if (newFieldAdded && fields.length > 0 && !currentFieldHasSubscription) {
      const timer = setTimeout(() => {
        dispatch(displayMembershipModal());
        dispatch(setNewFieldAdded(false));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [newFieldAdded, fields.length, currentFieldHasSubscription, dispatch]);

  /* -------------------------
     Welcome / add-field guidance logic
     ------------------------- */
  useEffect(() => {
    if (
      fields.length === 0 &&
      !localStorage.getItem("hasSeenWelcome") &&
      !sessionStorage.getItem("skipPreviewThisSession")
    ) {
      // show welcome overlay (you used a state setter before but not used; keep minimal behavior)
    }
  }, [fields.length]);

  useEffect(() => {
    const skip = localStorage.getItem("skipAddFieldPreview");
    if (!skip && fields.length === 0) setShowAddFieldInfo(true);
  }, [fields.length]);

  /* -------------------------
     AOI creation for selected field:
     - Create AOI only if not already present and not already requested.
     - Uses simple name = field._id to prevent collisions.
     ------------------------- */
  useEffect(() => {
    if (!selectedFieldDetails) return;
    if (
      !Array.isArray(selectedFieldDetails.field) ||
      selectedFieldDetails.field.length === 0
    )
      return;

    const aoiName = selectedFieldDetails._id;
    // Already created or pending?
    if (aoiCreationRef.current.has(aoiName)) return;

    // If AOI exists already in store, skip
    const exists = aois.find((a) => a.name === aoiName);
    if (exists) return;

    // mark and dispatch createAOI
    aoiCreationRef.current.add(aoiName);
    const geometryCoords = formatCoordinates(selectedFieldDetails.field);
    if (geometryCoords.length === 0) {
      // shouldn't happen, but guard
      return;
    }
    dispatch(
      createAOI({
        name: aoiName,
        geometry: { type: "Polygon", coordinates: [geometryCoords] },
      })
    );
  }, [selectedFieldDetails, aois, dispatch]);

  // show the select-farm modal when there are fields but no selectedField
  useEffect(() => {
    if (fields.length > 0 && !selectedField) {
      setShowSelectFarmModal(true);
    } else {
      setShowSelectFarmModal(false);
    }
  }, [fields, selectedField]);

  /* -------------------------
     Forecast fetching:
     - Fetch forecast only when AOI exists for the selected field
     - Cache recent fetch per AOI ID for FORECAST_CACHE_TTL to avoid repeated calls
     ------------------------- */
  useEffect(() => {
    if (!selectedFieldDetails || aois.length === 0) return;

    const matchingAOI = aois.find((a) => a.name === selectedFieldDetails._id);
    if (!matchingAOI || !matchingAOI.id) return;

    const geoId = matchingAOI.id;
    const lastTs = forecastFetchRef.current.get(geoId) || 0;
    const now = Date.now();
    if (now - lastTs < FORECAST_CACHE_TTL) return; // recently fetched

    // update timestamp and dispatch fetch
    forecastFetchRef.current.set(geoId, now);
    dispatch(fetchForecastData({ geometry_id: geoId }));
  }, [selectedFieldDetails, aois, dispatch]);

  /* -------------------------
     Handlers (memoized)
     ------------------------- */
  const handleFieldSelection = useCallback((fieldId) => {
    setSelectedField(fieldId);
    try {
      localStorage.setItem(SELECTED_FIELD_KEY, fieldId);
    } catch (e) {
      // ignore localStorage errors (e.g., private mode)
    }
  }, []);

  const handleSubscribe = useCallback(() => {
    if (!selectedFieldDetails) {
      message.warning("Please select a field first");
      return;
    }
    const areaInHectares =
      selectedFieldDetails?.areaInHectares ||
      (selectedFieldDetails?.acre ? selectedFieldDetails.acre * 0.404686 : 5);

    const fieldData = {
      id: selectedFieldDetails._id,
      name: selectedFieldDetails.farmName,
      areaInHectares,
      cropName: selectedFieldDetails.cropName,
    };

    setPricingFieldData(fieldData);
    setShowPricingOverlay(true);
    dispatch(hideMembershipModal());
  }, [selectedFieldDetails, dispatch]);

  const handleSkipMembership = useCallback(() => {
    dispatch(hideMembershipModal());
    message.info(
      "You can activate premium anytime from the locked content sections"
    );
  }, [dispatch]);

  const handleCloseMembershipModal = useCallback(() => {
    dispatch(hideMembershipModal());
  }, [dispatch]);

  const handlePaymentSuccess = useCallback(
    (successData) => {
      setShowPricingOverlay(false);
      setPricingFieldData(null);

      dispatch(
        setPaymentSuccess({
          ...successData,
          fieldName: successData.fieldName || selectedFieldDetails?.farmName,
        })
      );

      // immediately refresh subscription status for selectedField (if available)
      if (selectedField && authToken) {
        dispatch(
          checkFieldSubscriptionStatus({ fieldId: selectedField, authToken })
        );
      }
    },
    [dispatch, selectedField, authToken, selectedFieldDetails]
  );

  const handleCloseReduxPaymentSuccess = useCallback(() => {
    dispatch(clearPaymentSuccess());
  }, [dispatch]);

  /* -------------------------
     Render
     ------------------------- */
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

      {/* Pricing Overlay */}
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

      {/* Payment Success Modal (Redux) */}
      <PaymentSuccessModal
        isOpen={showPaymentSuccessModalRedux}
        onClose={handleCloseReduxPaymentSuccess}
        fieldName={paymentSuccess?.fieldName || selectedFieldDetails?.farmName}
        planName={paymentSuccess?.planName}
        features={paymentSuccess?.features || []}
        daysLeft={paymentSuccess?.daysLeft}
        transactionId={paymentSuccess?.transactionId}
      />

      {/* Map & Controls */}
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
        showFieldDropdown={true}
      />

      {/* Dashboard widgets (render only if fields exist) */}
      {fields.length > 0 && (
        <>
          <CropHealth
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
            fields={fields}
            isLocked={!hasSoilMoistureTemp}
            onSubscribe={handleSubscribe}
            usePremiumWrapper={true}
          />

          <PremiumContentWrapper
            isLocked={!hasWeatherForecast}
            onSubscribe={handleSubscribe}
            title="Weather Forecast"
          >
            <ForeCast forecastData={forecastData} />
          </PremiumContentWrapper>

          <NdviGraph
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
            isLocked={!hasSatelliteMonitoring}
            onSubscribe={handleSubscribe}
            usePremiumWrapper={true}
          />

          <WaterIndex
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
            isLocked={!hasSatelliteMonitoring}
            onSubscribe={handleSubscribe}
            usePremiumWrapper={true}
          />

          <PremiumContentWrapper
            isLocked={!hasSatelliteMonitoring}
            onSubscribe={handleSubscribe}
            title="Evapotranspiration Monitoring"
          >
            <EvapotranspirationDashboard forecast={forecast} units={units} />
          </PremiumContentWrapper>

          <PremiumContentWrapper
            isLocked={!hasInsights}
            onSubscribe={handleSubscribe}
            title="Farm Insights"
          >
            <Insights />
          </PremiumContentWrapper>

          <CropAdvisory
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
            isLocked={!hasAdvisory}
            onSubscribe={handleSubscribe}
            usePremiumWrapper={true}
          />

          <PlantGrowthActivity
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
            isLocked={!hasGrowthStageTracking}
            onSubscribe={handleSubscribe}
            usePremiumWrapper={true}
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
              />
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
        {fields.length > 0 && !selectedField && (
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
