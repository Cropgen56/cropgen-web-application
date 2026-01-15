// FarmReport.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { ArrowDownToLine, LoaderCircle, ChevronLeft } from "lucide-react";

import FarmReportSidebar from "../components/farmreport/farmreportsidebar/FarmReportSidebar";
import FarmReportContent from "../components/farmreport/farmreportsidebar/FarmReportContent";
import PremiumPageWrapper from "../components/subscription/PremiumPageWrapper";
import SubscriptionModal from "../components/subscription/SubscriptionModal";
import PricingOverlay from "../components/pricing/PricingOverlay";
import PaymentSuccessModal from "../components/subscription/PaymentSuccessModal";
import LoadingSpinner from "../components/comman/loading/LoadingSpinner";
import FieldDropdown from "../components/comman/FieldDropdown";

import {
  getFarmFields,
  updateFieldSubscription,
} from "../redux/slices/farmSlice";
import {
  setPaymentSuccess,
  clearPaymentSuccess,
  selectPaymentSuccess,
  selectShowPaymentSuccessModal,
} from "../redux/slices/subscriptionSlice";
import {
  fetchAOIs,
  createAOI,
  fetchForecastData,
} from "../redux/slices/weatherSlice";
import { clearIndexDataByType } from "../redux/slices/satelliteSlice";

import useFarmReportPDF from "../components/farmreport/useFarmReportPDF";
import img1 from "../assets/image/Group 31.png";

const FORECAST_CACHE_TTL = 5 * 60 * 1000;

const formatCoordinates = (data) => {
  if (!Array.isArray(data) || data.length === 0) return [];
  const coords = data.map((p) => [p.lng, p.lat]);
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) coords.push(first);
  return coords;
};

const FarmReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state?.auth?.user);
  const fieldsRaw = useSelector((state) => state?.farmfield?.fields);
  const fieldsLoading = useSelector((state) => state?.farmfield?.loading);
  const aoisRaw = useSelector((s) => s?.weather?.aois);
  const forecastData = useSelector((s) => s?.weather?.forecastData) || {};
  const paymentSuccess = useSelector(selectPaymentSuccess);
  const showPaymentSuccessModalRedux = useSelector(selectShowPaymentSuccessModal);

  const userId = user?.id;
  const fields = useMemo(() => fieldsRaw ?? [], [fieldsRaw]);
  const aois = useMemo(() => aoisRaw ?? [], [aoisRaw]);

  const [selectedField, setSelectedField] = useState(null);
  const [hasManuallySelected, setHasManuallySelected] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);
  const [isRefreshingSubscription, setIsRefreshingSubscription] = useState(false);
  const [aoisInitialized, setAoisInitialized] = useState(false);
  const [isFieldDataReady, setIsFieldDataReady] = useState(false);

  // Mobile/Tablet detection state
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(
    window.innerWidth < 1024
  );

  const mainReportRef = useRef();
  const mapRef = useRef(null);
  const aoiCreationRef = useRef(new Set());
  const attemptedAOIsRef = useRef(new Set());
  const forecastFetchRef = useRef(new Map());
  const isMountedRef = useRef(false);
  const prevSelectedFieldIdRef = useRef(null);

  const selectedFieldDetails = useMemo(
    () => (selectedField ? selectedField : null),
    [selectedField]
  );

  const { isDownloading, downloadProgress, isPreparedForPDF, downloadFarmReportPDF } =
    useFarmReportPDF(selectedFieldDetails);

  // Handle window resize for responsive detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobileOrTablet(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Feature access computation
  const featureAccess = useMemo(() => {
    const hasSubscription = selectedFieldDetails?.subscription?.hasActiveSubscription;
    const planFeatures = selectedFieldDetails?.subscription?.plan?.features;

    const hasFeature = (feature) =>
      hasSubscription && (!planFeatures || planFeatures?.[feature]);

    return {
      hasFarmReportAccess:
        hasSubscription &&
        (!planFeatures ||
          planFeatures?.satelliteImagery ||
          planFeatures?.cropHealthAndYield ||
          planFeatures?.vegetationIndices ||
          planFeatures?.weatherAnalytics),
      hasCropHealthAndYield: hasFeature("cropHealthAndYield"),
      hasWeatherAnalytics: hasFeature("weatherAnalytics"),
      hasVegetationIndices: hasFeature("vegetationIndices"),
      hasWaterIndices: hasFeature("waterIndices"),
      hasEvapotranspiration: hasFeature("evapotranspirationMonitoring"),
      hasAgronomicInsights: hasFeature("agronomicInsights"),
      hasWeeklyAdvisoryReports: hasFeature("weeklyAdvisoryReports"),
      hasCropGrowthMonitoring: hasFeature("cropGrowthMonitoring"),
      hasSubscription,
    };
  }, [selectedFieldDetails]);

  const showSidebar = useMemo(() => !hasManuallySelected, [hasManuallySelected]);

  // Clear satellite data when field changes
  useEffect(() => {
    const currentFieldId = selectedFieldDetails?._id;

    if (
      prevSelectedFieldIdRef.current &&
      prevSelectedFieldIdRef.current !== currentFieldId
    ) {
      dispatch(clearIndexDataByType());
    }

    prevSelectedFieldIdRef.current = currentFieldId;
  }, [selectedFieldDetails, dispatch]);

  // Fetch fields and AOIs on mount
  useEffect(() => {
    if (!userId) return;
    dispatch(getFarmFields(userId)).unwrap().catch(console.error);

    if (!isMountedRef.current) {
      dispatch(fetchAOIs())
        .unwrap()
        .then(() => setAoisInitialized(true))
        .catch(() => setAoisInitialized(true));
      isMountedRef.current = true;
    }
  }, [dispatch, userId]);

  // Auto-select latest field for mobile/tablet only
  useEffect(() => {
    if (isMobileOrTablet && fields.length > 0 && !selectedField) {
      setSelectedField(fields[fields.length - 1]);
    }
  }, [fields, selectedField, isMobileOrTablet]);

  // Set field data ready state
  useEffect(() => {
    setIsFieldDataReady(
      selectedFieldDetails?.field && selectedFieldDetails.field.length >= 3
    );
  }, [selectedFieldDetails]);

  // AOI creation logic
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
      .catch(() => attemptedAOIsRef.current.delete(aoiNeedsCreation))
      .finally(() => {
        setTimeout(() => aoiCreationRef.current.delete(aoiNeedsCreation), 1000);
      });
  }, [aoiNeedsCreation, dispatch, selectedFieldDetails]);

  // Fetch forecast data
  useEffect(() => {
    if (!selectedFieldDetails || aois.length === 0) return;
    const matchingAOI = aois.find((a) => a.name === selectedFieldDetails._id);
    if (!matchingAOI?.id) return;

    const geoId = matchingAOI.id;
    const lastTs = forecastFetchRef.current.get(geoId) || 0;
    if (Date.now() - lastTs < FORECAST_CACHE_TTL) return;

    forecastFetchRef.current.set(geoId, Date.now());
    dispatch(fetchForecastData({ geometry_id: geoId }));
  }, [selectedFieldDetails, aois, dispatch]);

  // Handlers
  const handleFieldSelect = useCallback(
    (field) => {
      dispatch(clearIndexDataByType());
      setSelectedField(field);
      setHasManuallySelected(true);
      setIsFieldDataReady(false);
    },
    [dispatch]
  );

  const handleBackToFieldSelection = useCallback(() => {
    dispatch(clearIndexDataByType());
    setSelectedField(null);
    setHasManuallySelected(false);
    setIsFieldDataReady(false);
  }, [dispatch]);

  const handleSubscribe = useCallback(() => {
    if (!selectedFieldDetails) {
      message.warning("Please select a field first");
      return;
    }

    const areaInHectares =
      selectedFieldDetails?.areaInHectares ||
      selectedFieldDetails?.acre * 0.404686 ||
      5;

    setPricingFieldData({
      id: selectedFieldDetails._id,
      name: selectedFieldDetails.fieldName || selectedFieldDetails.farmName,
      areaInHectares,
      cropName: selectedFieldDetails.cropName,
    });
    setShowPricingOverlay(true);
    setShowMembershipModal(false);
  }, [selectedFieldDetails]);

  const handlePaymentSuccess = useCallback(
    async (successData) => {
      try {
        setShowPricingOverlay(false);
        setPricingFieldData(null);

        const subscription = successData?.subscription;
        const fieldId = selectedFieldDetails?._id;

        if (fieldId && subscription) {
          setIsRefreshingSubscription(true);
          dispatch(updateFieldSubscription({ fieldId, subscription }));
        }

        dispatch(
          setPaymentSuccess({
            ...successData,
            fieldName:
              successData.fieldName ||
              selectedFieldDetails?.farmName ||
              selectedFieldDetails?.fieldName,
          })
        );

        if (userId) {
          await dispatch(getFarmFields(userId)).unwrap();
        }

        setTimeout(() => setIsRefreshingSubscription(false), 300);
      } catch {
        setIsRefreshingSubscription(false);
        message.error("Failed to update subscription status. Please refresh.");
      }
    },
    [dispatch, selectedFieldDetails, userId]
  );

  const handleDownloadPDF = useCallback(() => {
    downloadFarmReportPDF(mainReportRef);
  }, [downloadFarmReportPDF]);

  // Render the header with back button and PDF download
  const renderHeader = () => (
    <div className="mb-2 flex items-center gap-2 flex-wrap bg-[#2d4339] rounded-lg p-2">
      {/* Only show back button on desktop */}
      {!isMobileOrTablet && (
        <button
          className="bg-[#5a7c6b] text-white px-3 py-1.5 rounded-md text-sm shadow hover:bg-[#4a6b5a] transition-colors flex items-center gap-1"
          onClick={handleBackToFieldSelection}
        >
          <ChevronLeft size={16} />
          Back
        </button>
      )}

      <button
        disabled={!featureAccess.hasSubscription || isDownloading}
        onClick={handleDownloadPDF}
        className={`px-3 py-1.5 rounded-md text-sm shadow transition-all flex items-center gap-1 ${
          featureAccess.hasSubscription
            ? "bg-[#5a7c6b] text-white hover:bg-[#4a6b5a]"
            : "bg-gray-500 text-gray-300 cursor-not-allowed"
        }`}
      >
        {isDownloading ? (
          <>
            <LoaderCircle className="animate-spin" size={14} />
            Generating...
          </>
        ) : (
          <>
            <ArrowDownToLine size={14} />
            PDF
          </>
        )}
      </button>

      {!featureAccess.hasSubscription && (
        <span className="text-xs text-white/70">Subscribe to download</span>
      )}

      <div className="ml-auto text-white text-sm font-medium bg-[#5a7c6b] px-2 py-1 rounded-md">
        📍{" "}
        {selectedFieldDetails?.fieldName ||
          selectedFieldDetails?.farmName ||
          "Field"}
      </div>
    </div>
  );

  // Render the report content
  const renderReportContent = () => (
    <PremiumPageWrapper
      isLocked={!featureAccess.hasFarmReportAccess}
      onSubscribe={handleSubscribe}
      title="Farm Report"
    >
      <div ref={mainReportRef}>
        {!isRefreshingSubscription && (
          <FarmReportContent
            selectedFieldDetails={selectedFieldDetails}
            fields={fields}
            mapRef={mapRef}
            isFieldDataReady={isFieldDataReady}
            isPreparedForPDF={isPreparedForPDF}
            forecastData={forecastData}
            featureAccess={featureAccess}
            onSubscribe={handleSubscribe}
          />
        )}
      </div>
    </PremiumPageWrapper>
  );

  // Loading state
  if (fieldsLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-[#344E41]">
        <LoadingSpinner />
        <p className="text-white mt-4 text-lg">Loading your fields...</p>
      </div>
    );
  }

  // No fields state
  if (fields?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-[#344E41] px-4">
        <img
          src={img1}
          alt="No Fields"
          className="w-[350px] h-[350px] mb-6 opacity-60"
        />
        <h2 className="text-2xl font-semibold text-white">
          Add Farm to See the Farm Report
        </h2>
        <button
          onClick={() => navigate("/addfield")}
          className="mt-6 px-5 py-2 rounded-lg bg-white text-[#344E41] font-medium hover:bg-gray-200 transition"
        >
          Add Field
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Modals */}
      <SubscriptionModal
        isOpen={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        onSubscribe={handleSubscribe}
        onSkip={() => {
          setShowMembershipModal(false);
          message.info("You can activate premium anytime from locked sections");
        }}
        fieldName={selectedFieldDetails?.fieldName || selectedFieldDetails?.farmName}
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
              }}
              onPaymentSuccess={handlePaymentSuccess}
              userArea={pricingFieldData.areaInHectares}
              selectedField={pricingFieldData}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <PaymentSuccessModal
        isOpen={showPaymentSuccessModalRedux}
        onClose={() => dispatch(clearPaymentSuccess())}
        fieldName={
          paymentSuccess?.fieldName ||
          selectedFieldDetails?.fieldName ||
          selectedFieldDetails?.farmName
        }
        planName={paymentSuccess?.planName}
        features={paymentSuccess?.features || []}
        daysLeft={paymentSuccess?.daysLeft}
        transactionId={paymentSuccess?.transactionId}
      />

      {/* Loading Overlays */}
      <AnimatePresence>
        {isRefreshingSubscription && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-[2px] flex items-center justify-center"
          >
            <LoadingSpinner />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDownloading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-md w-full mx-4"
            >
              <div className="relative">
                <LoaderCircle
                  className="animate-spin text-[#344E41]"
                  size={64}
                  strokeWidth={2}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold text-[#344E41]">
                    {Math.round(downloadProgress)}%
                  </span>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Generating PDF Report
                </h3>
                <p className="text-sm text-gray-600">
                  {downloadProgress < 30
                    ? "Processing images..."
                    : downloadProgress < 60
                    ? "Rendering charts..."
                    : downloadProgress < 85
                    ? "Building sections..."
                    : "Finalizing..."}
                </p>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-[#344E41] to-[#5a7c6b] h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${downloadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout */}
      <div className="flex h-screen overflow-hidden bg-[#344E41] text-white">
        {/* ===== DESKTOP VIEW ===== */}
        <div className="hidden lg:flex w-full h-full">
          {/* Desktop Sidebar with Animation */}
          <AnimatePresence>
            {showSidebar && (
              <motion.div
                initial={{ x: -280, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -280, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="min-w-[250px] max-w-[20vw] h-full border-r border-[#5a7c6b] bg-[#2d4339]"
              >
                <FarmReportSidebar
                  setSelectedField={handleFieldSelect}
                  setIsSidebarVisible={() => {}}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop Main Content */}
          <div className="flex-1 p-2 h-screen overflow-y-auto bg-[#344E41]">
            {hasManuallySelected && selectedFieldDetails ? (
              <>
                {renderHeader()}
                {renderReportContent()}
              </>
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <div className="flex flex-col items-center text-center opacity-80">
                  <img src={img1} alt="" className="w-[250px] h-[250px] mb-4" />
                  <p className="text-xl font-semibold text-white">
                    Select a Field to Generate Report
                  </p>
                  <p className="text-sm mt-2 text-white/70">
                    Choose from the sidebar
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== TABLET/MOBILE VIEW ===== */}
        <div className="lg:hidden flex-1 px-3 py-4 h-screen overflow-y-auto">
          {/* Mobile/Tablet Dropdown */}
          <div className="mb-4">
            <FieldDropdown
              fields={fields}
              selectedField={selectedField}
              setSelectedField={setSelectedField}
            />
          </div>

          {/* Mobile/Tablet Content - Auto shows with selected field */}
          {selectedField ? (
            <>
              {renderHeader()}
              {renderReportContent()}
            </>
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <div className="flex flex-col items-center text-center opacity-60">
                <img src={img1} alt="" className="w-[200px] h-[200px] mb-4" />
                <p className="text-xl font-semibold">Loading...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FarmReport;