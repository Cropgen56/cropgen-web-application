import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import img1 from "../assets/image/Group 31.png";
import { getFarmFields } from "../redux/slices/farmSlice";

import Sidebardiseasedetection from "../components/diseasedetection/sidebar/Sidebardiseasedetection";
import UploadCropImage from "../components/diseasedetection/uploadcropimage/UploadCropImage";

import PremiumPageWrapper from "../components/subscription/PremiumPageWrapper";
import SubscriptionModal from "../components/subscription/SubscriptionModal";
import PricingOverlay from "../components/pricing/PricingOverlay";

import ComingSoonSection from "../components/comman/loading/ComingSoonSection ";
import FieldDropdown from "../components/comman/FieldDropdown";

const DiseaseDetection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state?.auth?.user);
  const fieldsRaw = useSelector((state) => state?.farmfield?.fields);
  const fields = useMemo(() => fieldsRaw ?? [], [fieldsRaw]);

  const userId = user?.id;

  const [isSidebarVisible] = useState(true);
  const [selectedField, setSelectedField] = useState(null);
  const [showMembershipModalLocal, setShowMembershipModalLocal] =
    useState(false);

  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);

  // Load fields
  useEffect(() => {
    if (userId) dispatch(getFarmFields(userId));
  }, [dispatch, userId]);

  // Auto-select last added farm
  useEffect(() => {
    if (fields?.length > 0 && !selectedField) {
      setSelectedField(fields[fields.length - 1]);
    }
  }, [fields, selectedField]);

  const selectedFieldDetails = selectedField;

  const handleSubscribe = useCallback(() => {
    if (!selectedFieldDetails) {
      message.warning("Please select a field first");
      return;
    }

    const areaInHectares =
      selectedFieldDetails?.areaInHectares ||
      selectedFieldDetails?.acre * 0.404686 ||
      5;

    const fieldData = {
      id: selectedFieldDetails._id,
      name: selectedFieldDetails.fieldName || selectedFieldDetails.farmName,
      areaInHectares,
      cropName: selectedFieldDetails.cropName,
    };

    setPricingFieldData(fieldData);
    setShowPricingOverlay(true);
    setShowMembershipModalLocal(false);
  }, [selectedFieldDetails]);

  const handleSkipMembership = useCallback(() => {
    setShowMembershipModalLocal(false);
    message.info("You can activate premium anytime from the locked features");
  }, []);

  const handleCloseMembershipModal = useCallback(() => {
    setShowMembershipModalLocal(false);
  }, []);

  const handleClosePricing = useCallback(() => {
    setShowPricingOverlay(false);
    setPricingFieldData(null);
  }, []);

  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-[#5a7c6b] text-center px-4">
        <img
          src={img1}
          alt="No Fields"
          className="w-[400px] h-[400px] mb-6 opacity-70"
        />
        <h2 className="text-2xl font-semibold text-white">
          Add Farm to use Disease Detection
        </h2>

        <button
          onClick={() => navigate("/addfield")}
          className="mt-6 px-5 py-2 rounded-lg bg-white text-[#5a7c6b] font-medium hover:bg-gray-200 transition"
        >
          Add Field
        </button>
      </div>
    );
  }

  const hasSubscription = selectedField?.subscription?.hasActiveSubscription;

  const hasDiseaseDetectionPermission =
    hasSubscription &&
    selectedField?.subscription?.plan?.features?.diseaseDetectionAlerts;

  return (
    <>
      <SubscriptionModal
        isOpen={showMembershipModalLocal}
        onClose={handleCloseMembershipModal}
        onSubscribe={handleSubscribe}
        onSkip={handleSkipMembership}
        fieldName={
          selectedFieldDetails?.fieldName || selectedFieldDetails?.farmName
        }
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
              onClose={handleClosePricing}
              userArea={pricingFieldData.areaInHectares}
              selectedField={pricingFieldData}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="m-0 p-0 w-full flex flex-row">
        {/* Desktop Sidebar - Hidden on tablet/mobile */}
        {isSidebarVisible && (
          <div className="hidden lg:block">
            <Sidebardiseasedetection
              selectedField={selectedField}
              setSelectedField={setSelectedField}
              fields={fields}
              hasSubscription={hasSubscription}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="w-full bg-[#5f7e6f] m-0 p-0 lg:ml-[320px] h-screen overflow-y-auto overflow-x-hidden">
          {/* Tablet/Mobile Dropdown - Hidden on desktop */}
          <div className="lg:hidden p-3">
            <FieldDropdown
              fields={fields}
              selectedField={selectedField}
              setSelectedField={setSelectedField}
            />
          </div>

          {/* <PremiumPageWrapper
            isLocked={!hasDiseaseDetectionPermission}
            onSubscribe={handleSubscribe}
            title="Disease Detection"
          >
            <UploadCropImage selectedField={selectedField?._id} />
          </PremiumPageWrapper> */}

          <ComingSoonSection />
        </div>
      </div>
    </>
  );
};

export default DiseaseDetection;