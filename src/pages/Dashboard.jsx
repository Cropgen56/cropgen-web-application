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
import PaymentSuccessModal from "../components/subscription/PaymentSuccessModal";
import {
  checkFieldSubscriptionStatus,
  setCurrentField,
  displayMembershipModal,
  hideMembershipModal,
  setNewFieldAdded,
  selectCurrentFieldHasSubscription,
  selectIsCheckingSubscription,
  optimisticSubscriptionUpdate,
} from "../redux/slices/membershipSlice";
import {
  setPaymentSuccess,
  clearPaymentSuccess,
  selectPaymentSuccess,
  selectShowPaymentSuccessModal,
} from "../redux/slices/subscriptionSlice";
import PricingOverlay from "../components/pricing/PricingOverlay";
import LoadingSpinner from "../components/comman/loading/LoadingSpinner";

const SELECTED_FIELD_KEY = "selectedFieldId";
const SUBSCRIPTION_CHECK_INTERVAL = 5 * 60 * 1000;
const FORECAST_CACHE_TTL = 5 * 60 * 1000;

const formatCoordinates = (data) => {
  if (!Array.isArray(data) || data.length === 0) return [];
  const coords = data.map((p) => [p.lng, p.lat]);
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) coords.push(first);
  return coords;
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showSelectFarmModal, setShowSelectFarmModal] = useState(false);
  const [isRefreshingSubscription, setIsRefreshingSubscription] = useState(false);
  const [aoisInitialized, setAoisInitialized] = useState(false);

  const aoiCreationRef = useRef(new Set());
  const attemptedAOIsRef = useRef(new Set());
  const forecastFetchRef = useRef(new Map());
  const subscriptionCheckRef = useRef({
    lastCheckedForField: null,
    intervalId: null,
  });
  const isMountedRef = useRef(false);

  const user = useSelector((s) => s?.auth?.user);
  const authToken = useSelector((s) => s?.auth?.token);
  const fieldsRaw = useSelector((s) => s?.farmfield?.fields);
  const fields = useMemo(() => fieldsRaw ?? [], [fieldsRaw]);

  const aoisRaw = useSelector((s) => s?.weather?.aois);
  const aois = useMemo(() => aoisRaw ?? [], [aoisRaw]);

  const forecastData = useSelector((s) => s?.weather?.forecastData) || {};
  const userId = user?.id;

  const showMembershipModal = useSelector(
    (s) => s.membership.showMembershipModal
  );
  const newFieldAdded = useSelector((s) => s.membership.newFieldAdded);
  const currentFieldHasSubscription = useSelector(
    selectCurrentFieldHasSubscription
  );
  const isCheckingSubscription = useSelector(selectIsCheckingSubscription);

  const paymentSuccess = useSelector(selectPaymentSuccess);
  const showPaymentSuccessModalRedux = useSelector(
    selectShowPaymentSuccessModal
  );

  const [delayPassed, setDelayPassed] = useState(false);
  const [showAddFieldInfo, setShowAddFieldInfo] = useState(false);
  const [showVideoOverlay, setShowVideoOverlay] = useState(true);

  const [markers, setMarkers] = useState([]);
  const [isAddingMarkers, setIsAddingMarkers] = useState(false);

  const [selectedField, setSelectedField] = useState(() => {
    return localStorage.getItem(SELECTED_FIELD_KEY) || "";
  });

  const [prevFieldsLength, setPrevFieldsLength] = useState(0);

  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);

  const selectedFieldDetails = useMemo(() => {
    return fields.find((f) => f?._id === selectedField) || null;
  }, [fields, selectedField]);

  const { forecast, units } = forecastData || {};

  useEffect(() => {
    const t = setTimeout(() => setDelayPassed(true), 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!userId) return;
    
    dispatch(getFarmFields(userId));
    
    if (!isMountedRef.current) {
      dispatch(fetchAOIs())
        .unwrap()
        .then(() => {
          setAoisInitialized(true);
        })
        .catch(() => {
          setAoisInitialized(true);
        });
      isMountedRef.current = true;
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (!Array.isArray(fields) || fields.length === 0) {
      setPrevFieldsLength(0);
      return;
    }

    const findNewest = (arr) => {
      return arr.slice().sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (tb !== ta) return tb - ta;
        if (a._id && b._id) return b._id.localeCompare(a._id);
        return 0;
      })[0];
    };

    const newestField = findNewest(fields);

    if (!selectedField && newestField) {
      setSelectedField(newestField._id);
      try {
        localStorage.setItem(SELECTED_FIELD_KEY, newestField._id);
      } catch (e) {}
    } else {
      if (fields.length > prevFieldsLength && newestField) {
        setSelectedField(newestField._id);
        try {
          localStorage.setItem(SELECTED_FIELD_KEY, newestField._id);
        } catch (e) {}
      }
    }

    setPrevFieldsLength(fields.length);
  }, [fields, selectedField, prevFieldsLength]);

  const aoiNeedsCreation = useMemo(() => {
    if (!aoisInitialized || !selectedFieldDetails?._id) return null;
    
    const aoiName = selectedFieldDetails._id;
    const exists = aois.some((a) => a.name === aoiName);
    const attempted = attemptedAOIsRef.current.has(aoiName);
    const creating = aoiCreationRef.current.has(aoiName);
    
    return !exists && !attempted && !creating ? aoiName : null;
  }, [aoisInitialized, selectedFieldDetails, aois]);

  useEffect(() => {
    if (!aoiNeedsCreation || !selectedFieldDetails) return;

    const geometryCoords = formatCoordinates(selectedFieldDetails.field);
    if (geometryCoords.length === 0) return;

    aoiCreationRef.current.add(aoiNeedsCreation);
    attemptedAOIsRef.current.add(aoiNeedsCreation);

    dispatch(
      createAOI({
        name: aoiNeedsCreation,
        geometry: { type: "Polygon", coordinates: [geometryCoords] },
      })
    )
      .unwrap()
      .then(() => {})
      .catch(() => {
        attemptedAOIsRef.current.delete(aoiNeedsCreation);
      })
      .finally(() => {
        setTimeout(() => aoiCreationRef.current.delete(aoiNeedsCreation), 1000);
      });
  }, [aoiNeedsCreation, dispatch, selectedFieldDetails]);

  useEffect(() => {
    if (!selectedField) return;

    dispatch(setCurrentField(selectedField));

    if (authToken) {
      if (subscriptionCheckRef.current.lastCheckedForField !== selectedField) {
        subscriptionCheckRef.current.lastCheckedForField = selectedField;
        dispatch(
          checkFieldSubscriptionStatus({ fieldId: selectedField, authToken })
        );
      }

      if (!subscriptionCheckRef.current.intervalId) {
        const id = setInterval(() => {
          dispatch(
            checkFieldSubscriptionStatus({ fieldId: selectedField, authToken })
          );
        }, SUBSCRIPTION_CHECK_INTERVAL);
        subscriptionCheckRef.current.intervalId = id;
      }
    }
  }, [selectedField, authToken, dispatch]);

  useEffect(() => {
    return () => {
      if (subscriptionCheckRef.current.intervalId) {
        clearInterval(subscriptionCheckRef.current.intervalId);
        subscriptionCheckRef.current.intervalId = null;
        subscriptionCheckRef.current.lastCheckedForField = null;
      }
    };
  }, []);

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
    const skip = localStorage.getItem("skipAddFieldPreview");
    if (!skip && fields.length === 0) setShowAddFieldInfo(true);
  }, [fields.length]);

  useEffect(() => {
    if (fields.length > 0 && !selectedField) {
      setShowSelectFarmModal(true);
    } else {
      setShowSelectFarmModal(false);
    }
  }, [fields, selectedField]);

  useEffect(() => {
    if (!selectedFieldDetails || aois.length === 0) return;

    const matchingAOI = aois.find((a) => a.name === selectedFieldDetails._id);
    if (!matchingAOI || !matchingAOI.id) return;

    const geoId = matchingAOI.id;
    const lastTs = forecastFetchRef.current.get(geoId) || 0;
    const now = Date.now();
    if (now - lastTs < FORECAST_CACHE_TTL) return;

    forecastFetchRef.current.set(geoId, now);
    dispatch(fetchForecastData({ geometry_id: geoId }));
  }, [selectedFieldDetails, aois, dispatch]);

  useEffect(() => {
    if (isCheckingSubscription) {
      setIsRefreshingSubscription(true);
    } else {
      const timer = setTimeout(() => {
        setIsRefreshingSubscription(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isCheckingSubscription]);

  const handleFieldSelection = useCallback((fieldId) => {
    setSelectedField(fieldId);
    try {
      localStorage.setItem(SELECTED_FIELD_KEY, fieldId);
    } catch (e) {}
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
    async (successData) => {
      try {
        setShowPricingOverlay(false);
        setPricingFieldData(null);

        if (selectedField && successData.subscription) {
          dispatch(
            optimisticSubscriptionUpdate({
              fieldId: selectedField,
              subscription: successData.subscription,
            })
          );
        }

        dispatch(
          setPaymentSuccess({
            ...successData,
            fieldName: successData.fieldName || selectedFieldDetails?.farmName,
          })
        );

        setIsRefreshingSubscription(true);

        if (selectedField && authToken) {
          await dispatch(
            checkFieldSubscriptionStatus({ fieldId: selectedField, authToken })
          ).unwrap();

          setTimeout(() => {
            setIsRefreshingSubscription(false);
          }, 300);
        } else {
          setIsRefreshingSubscription(false);
        }
      } catch (error) {
        setIsRefreshingSubscription(false);
        message.error("Failed to update subscription status. Please refresh the page.");
      }
    },
    [dispatch, selectedField, authToken, selectedFieldDetails]
  );

  const handleCloseReduxPaymentSuccess = useCallback(() => {
    dispatch(clearPaymentSuccess());
  }, [dispatch]);

  return (
    <div className="dashboard min-h-screen w-full overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden float-end p-1.5 lg:p-3">
      <SubscriptionModal
        isOpen={showMembershipModal}
        onClose={handleCloseMembershipModal}
        onSubscribe={handleSubscribe}
        onSkip={handleSkipMembership}
        fieldName={selectedFieldDetails?.farmName}
      />

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
              onClose={() => {
                setShowPricingOverlay(false);
                setPricingFieldData(null);
                if (selectedField && authToken) {
                  dispatch(
                    checkFieldSubscriptionStatus({
                      fieldId: selectedField,
                      authToken,
                    })
                  );
                }
              }}
              onPaymentSuccess={handlePaymentSuccess}
              userArea={pricingFieldData.areaInHectares}
              selectedField={pricingFieldData}
            />
          </motion.div>
        )}
      </AnimatePresence>

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

      <PaymentSuccessModal
        isOpen={showPaymentSuccessModalRedux}
        onClose={handleCloseReduxPaymentSuccess}
        fieldName={paymentSuccess?.fieldName || selectedFieldDetails?.farmName}
        planName={paymentSuccess?.planName}
        features={paymentSuccess?.features || []}
        daysLeft={paymentSuccess?.daysLeft}
        transactionId={paymentSuccess?.transactionId}
      />

      <AnimatePresence>
        {isRefreshingSubscription && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-[2px] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl p-6 shadow-2xl flex flex-col items-center gap-3"
            >
              <LoadingSpinner />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {fields.length > 0 && !isRefreshingSubscription && (
        <>
          <CropHealth
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
            fields={fields}
            onSubscribe={handleSubscribe}
          />

          <ForeCast onSubscribe={handleSubscribe} />

          <NdviGraph
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
            onSubscribe={handleSubscribe}
          />

          <WaterIndex
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
            onSubscribe={handleSubscribe}
          />

          <EvapotranspirationDashboard
            forecast={forecast}
            units={units}
            onSubscribe={handleSubscribe}
          />

          <Insights onSubscribe={handleSubscribe} />

          <CropAdvisory
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
            onSubscribe={handleSubscribe}
          />

          <PlantGrowthActivity
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
            onSubscribe={handleSubscribe}
          />
        </>
      )}

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
    </div>
  );
};

export default React.memo(Dashboard);