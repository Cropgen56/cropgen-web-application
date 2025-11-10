import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { message } from "antd";
import { getFarmFields } from "../redux/slices/farmSlice";
import { getOperationsByFarmField } from "../redux/slices/operationSlice";
import OperationSidebar from "../components/operation/operationsidebar/OperationSidebar";
import Calendar from "../components/operation/operationcalender/OperationCalender";
import { useNavigate } from "react-router-dom";
import img1 from "../assets/image/Group 31.png";
import PremiumPageWrapper from "../components/subscription/PremiumPageWrapper";
import SubscriptionModal from "../components/subscription/SubscriptionModal";
import PricingOverlay from "../components/pricing/PricingOverlay";
import {
  checkFieldSubscriptionStatus,
  setCurrentField,
  displayMembershipModal,
  hideMembershipModal,
  selectCurrentFieldHasSubscription
} from "../redux/slices/membershipSlice";

const SUBSCRIPTION_CHECK_INTERVAL = 5 * 60 * 1000;

const Operation = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.auth?.user);
  const authToken = useSelector((state) => state?.auth?.token);
  const fields = useSelector((state) => state?.farmfield?.fields);
  const navigate = useNavigate();

  const userId = user?.id;

  // Add membership selectors
  const showMembershipModal = useSelector(state => state.membership.showMembershipModal);
  const currentFieldHasSubscription = useSelector(selectCurrentFieldHasSubscription);
  const fieldSubscriptions = useSelector(state => state.membership.fieldSubscriptions);

  // Initialize selectedField as null until fields are fetched
  const [selectedField, setSelectedField] = useState(null);
  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);

  // Fetch fields once when userId is available
  useEffect(() => {
    if (userId) {
      dispatch(getFarmFields(userId));
    }
  }, [dispatch, userId]);

  // Set the default selectedField when fields are available
  useEffect(() => {
    if (fields?.length > 0 && !selectedField) {
      setSelectedField(fields[0]._id);
    }
  }, [fields, selectedField]);

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

  // Fetch operations when selectedField changes
  useEffect(() => {
    if (selectedField) {
      dispatch(getOperationsByFarmField({ farmId: selectedField }));
    }
  }, [dispatch, selectedField]);

  const selectedFieldDetails = useMemo(() => {
    return fields.find((item) => item?._id === selectedField) || null;
  }, [fields, selectedField]);

  const handleSubscribe = useCallback(() => {
    if (selectedFieldDetails) {
      const areaInHectares = selectedFieldDetails?.areaInHectares ||
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
    message.info("You can activate premium anytime from the locked content sections");
  }, [dispatch]);

  const handleCloseMembershipModal = useCallback(() => {
    dispatch(hideMembershipModal());
  }, [dispatch]);

  const handleClosePricing = useCallback(() => {
    setShowPricingOverlay(false);
    setPricingFieldData(null);

    if (selectedField && authToken) {
      dispatch(checkFieldSubscriptionStatus({
        fieldId: selectedField,
        authToken
      }));
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
          Add Farm to make an Operation
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
      {/* Membership Modal */}
      <SubscriptionModal
        isOpen={showMembershipModal}
        onClose={handleCloseMembershipModal}
        onSubscribe={handleSubscribe}
        onSkip={handleSkipMembership}
        fieldName={selectedFieldDetails?.fieldName || selectedFieldDetails?.farmName}
      />

      {/* Pricing Overlay */}
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

      <div className="w-full h-full m-0 p-0 d-flex">
        <OperationSidebar
          setSelectedField={setSelectedField}
          selectedField={selectedField}
        />
        <div className="bg-[#5a7c6b]">
          <PremiumPageWrapper
            isLocked={!currentFieldHasSubscription}
            onSubscribe={handleSubscribe}
            title="Farm Operations Management"
          >
            <Calendar selectedField={selectedField} />
          </PremiumPageWrapper>
        </div>
      </div>
    </>
  );
};

export default Operation;