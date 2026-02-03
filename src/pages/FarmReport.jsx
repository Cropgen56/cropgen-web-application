import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
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
import { clearIndexDataByType } from "../redux/slices/satelliteSlice";

import useFarmReportPDF from "../components/farmreport/useFarmReportPDF";
import { useAoiManagement } from "../components/dashboard/hooks/useAoiManagement";
import { useWeatherForecast } from "../components/dashboard/hooks/useWeatherForecast";

import img1 from "../assets/image/Group 31.png";

const FarmReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const user = useSelector((s) => s.auth?.user);
  const fields = useSelector((s) => s.farmfield?.fields || []);
  const fieldsLoading = useSelector((s) => s.farmfield?.loading);

  const paymentSuccess = useSelector(selectPaymentSuccess);
  const showPaymentSuccessModalRedux = useSelector(
    selectShowPaymentSuccessModal,
  );

  const [selectedField, setSelectedField] = useState(null);
  const [hasManuallySelected, setHasManuallySelected] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);
  const [isRefreshingSubscription, setIsRefreshingSubscription] =
    useState(false);

  const mainReportRef = useRef(null);

  /* ================= SELECTED FIELD ================= */
  const selectedFieldDetails = useMemo(
    () => (selectedField ? selectedField : null),
    [selectedField],
  );

  /* ================= FEATURE ACCESS (✅ FIXED) ================= */
  const featureAccess = useMemo(() => {
    const hasSubscription =
      selectedFieldDetails?.subscription?.hasActiveSubscription;

    const planFeatures =
      selectedFieldDetails?.subscription?.plan?.features || {};

    const hasFeature = (key) => hasSubscription && (planFeatures[key] ?? true);

    return {
      hasFarmReportAccess: !!hasSubscription,
      hasCropHealthAndYield: hasFeature("cropHealthAndYield"),
      hasWeatherAnalytics: hasFeature("weatherAnalytics"),
      hasVegetationIndices: hasFeature("vegetationIndices"),
      hasWaterIndices: hasFeature("waterIndices"),
      hasEvapotranspiration: hasFeature("evapotranspirationMonitoring"),
      hasAgronomicInsights: hasFeature("agronomicInsights"),
      hasWeeklyAdvisoryReports: hasFeature("weeklyAdvisoryReports"),
      hasCropGrowthMonitoring: hasFeature("cropGrowthMonitoring"),
      hasSubscription: !!hasSubscription,
    };
  }, [selectedFieldDetails]);

  /* ================= AOI + WEATHER ================= */
  const { aoiId } = useAoiManagement(selectedFieldDetails);
  const { forecast, units } = useWeatherForecast(aoiId);

  /* ================= PDF ================= */
  const {
    isDownloading,
    downloadProgress,
    isPreparedForPDF,
    downloadFarmReportPDF,
  } = useFarmReportPDF(selectedFieldDetails);

  /* ================= FETCH FIELDS ================= */
  useEffect(() => {
    if (user?.id) dispatch(getFarmFields(user.id));
  }, [dispatch, user?.id]);

  /* ================= CLEAR DATA ================= */
  useEffect(() => {
    dispatch(clearIndexDataByType());
  }, [selectedFieldDetails?._id, dispatch]);

  /* ================= HANDLERS ================= */
  const handleFieldSelect = useCallback((field) => {
    setSelectedField(field);
    setHasManuallySelected(true);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedField(null);
    setHasManuallySelected(false);
  }, []);

  const handleSubscribe = useCallback(() => {
    if (!selectedFieldDetails) {
      message.warning("Please select a field first");
      return;
    }

    setPricingFieldData({
      id: selectedFieldDetails._id,
      name: selectedFieldDetails.fieldName || selectedFieldDetails.farmName,
      areaInHectares:
        selectedFieldDetails.areaInHectares ||
        selectedFieldDetails.acre * 0.404686,
    });

    setShowPricingOverlay(true);
    setShowMembershipModal(false);
  }, [selectedFieldDetails]);

  const handleDownloadPDF = useCallback(() => {
    downloadFarmReportPDF(mainReportRef);
  }, [downloadFarmReportPDF]);

  /* ================= STATES ================= */
  if (fieldsLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#344E41]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!fields.length) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#344E41] text-white">
        <img src={img1} className="w-[280px] mb-6 opacity-60" />
        <button
          onClick={() => navigate("/addfield")}
          className="px-6 py-3 bg-white text-[#344E41] rounded-lg"
        >
          Add Field
        </button>
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <>
      <SubscriptionModal
        isOpen={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        onSubscribe={handleSubscribe}
      />

      <PaymentSuccessModal
        isOpen={showPaymentSuccessModalRedux}
        onClose={() => dispatch(clearPaymentSuccess())}
        fieldName={paymentSuccess?.fieldName}
      />

      <AnimatePresence>
        {showPricingOverlay && pricingFieldData && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PricingOverlay
              selectedField={pricingFieldData}
              onClose={() => setShowPricingOverlay(false)}
              onPaymentSuccess={() => {}}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex h-screen bg-[#344E41] text-white">
        <div className="hidden lg:flex">
          {isSidebarVisible && (
            <FarmReportSidebar
              setSelectedField={handleFieldSelect}
              setIsSidebarVisible={setIsSidebarVisible}
            />
          )}
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {!selectedField ? (
            <FieldDropdown
              fields={fields}
              selectedField={selectedField}
              setSelectedField={handleFieldSelect}
            />
          ) : (
            <>
              <div className="mb-3 flex justify-between bg-[#2d4339] p-2 rounded">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft size={16} /> Back
                </button>

                <button
                  onClick={handleDownloadPDF}
                  className="bg-[#0C2214] text-white px-4 py-1 rounded"
                >
                  {isDownloading ? "Generating..." : "PDF"}
                </button>
              </div>

              <PremiumPageWrapper title="Farm Report">
                <div ref={mainReportRef}>
                  <FarmReportContent
                    selectedFieldDetails={selectedFieldDetails}
                    forecast={forecast}
                    units={units}
                    isPreparedForPDF={isPreparedForPDF}
                    featureAccess={featureAccess}
                    onSubscribe={handleSubscribe}
                  />
                </div>
              </PremiumPageWrapper>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default FarmReport;
