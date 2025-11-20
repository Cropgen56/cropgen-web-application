import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { message } from "antd";
import UploadCropImage from "../components/diseasedetection/uploadcropimage/UploadCropImage";
import Sidebardiseasedetection from "../components/diseasedetection/sidebar/Sidebardiseasedetection";
import { useNavigate } from "react-router-dom";
import img1 from "../assets/image/Group 31.png";
import { getFarmFields } from "../redux/slices/farmSlice";
import PremiumPageWrapper from "../components/subscription/PremiumPageWrapper";
import SubscriptionModal from "../components/subscription/SubscriptionModal";
import PricingOverlay from "../components/pricing/PricingOverlay";
import {
  checkFieldSubscriptionStatus,
  setCurrentField,
  displayMembershipModal,
  hideMembershipModal,
  selectHasDiseaseDetectionAlerts,
} from "../redux/slices/membershipSlice";
import ComingSoonSection from "../components/comman/loading/ComingSoonSection ";

const SUBSCRIPTION_CHECK_INTERVAL = 5 * 60 * 1000;

const DiseaseDetection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state?.auth?.user);
  const authToken = useSelector((state) => state?.auth?.token);
  const fields = useSelector((state) => state?.farmfield?.fields);
  const userId = user?.id;

  const showMembershipModal = useSelector(
    (state) => state.membership.showMembershipModal
  );
  const hasDiseaseDetectionAlerts = useSelector(selectHasDiseaseDetectionAlerts);
  const fieldSubscriptions = useSelector(
    (state) => state.membership.fieldSubscriptions
  );

  const [selectedField, setSelectedField] = useState(null);
  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);

  useEffect(() => {
    if (userId) {
      dispatch(getFarmFields(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (fields?.length > 0 && !selectedField) {
      setSelectedField(fields[0]._id);
    }
  }, [fields, selectedField]);

  useEffect(() => {
    if (selectedField && authToken) {
      dispatch(setCurrentField(selectedField));

      const fieldSub = fieldSubscriptions[selectedField];
      const shouldCheck =
        !fieldSub ||
        (fieldSub.lastChecked &&
          new Date() - new Date(fieldSub.lastChecked) >
            SUBSCRIPTION_CHECK_INTERVAL);

      if (shouldCheck) {
        dispatch(
          checkFieldSubscriptionStatus({
            fieldId: selectedField,
            authToken,
          })
        );
      }
    }
  }, [selectedField, authToken, dispatch, fieldSubscriptions]);

  useEffect(() => {
    if (!selectedField || !authToken) return;

    const interval = setInterval(() => {
      dispatch(
        checkFieldSubscriptionStatus({
          fieldId: selectedField,
          authToken,
        })
      );
    }, SUBSCRIPTION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [selectedField, authToken, dispatch]);

  const selectedFieldDetails = useMemo(() => {
    return fields.find((item) => item?._id === selectedField) || null;
  }, [fields, selectedField]);

  const handleSubscribe = useCallback(() => {
    if (selectedFieldDetails) {
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
      dispatch(hideMembershipModal());
    } else {
      message.warning("Please select a field first");
    }
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

  const handleClosePricing = useCallback(() => {
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
  }, [selectedField, authToken, dispatch]);

  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-[#5a7c6b] text-center px-4">
        <img
          src={img1}
          alt="No Fields"
          className="w-[400px] h-[400px] mb-6 opacity-70"
        />
        <h2 className="text-2xl font-semibold text-white">
          Add Farm to See the Disease Detection.
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

  return (
    <>
      <SubscriptionModal
        isOpen={showMembershipModal}
        onClose={handleCloseMembershipModal}
        onSubscribe={handleSubscribe}
        onSkip={handleSkipMembership}
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
              onClose={handleClosePricing}
              userArea={pricingFieldData.areaInHectares}
              selectedField={pricingFieldData}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#5f7e6f] h-screen flex flex-col md:flex-row">
        <Sidebardiseasedetection
          selectedField={selectedField}
          setSelectedField={setSelectedField}
          fields={fields}
        />
        {/* <PremiumPageWrapper
          isLocked={!hasDiseaseDetectionAlerts}
          onSubscribe={handleSubscribe}
          title="Disease Detection & Alerts"
        > */}

        <ComingSoonSection />
        {/* <UploadCropImage selectedField={selectedField} /> */}
        
        {/* </PremiumPageWrapper> */}
      </div>
    </>
  );
};

export default DiseaseDetection;