import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { message } from "antd";
import { getFarmFields } from "../redux/slices/farmSlice";
import OperationSidebar from "../components/operation/operationsidebar/OperationSidebar";
import Calendar from "../components/operation/operationcalender/OperationCalender";
import { useNavigate } from "react-router-dom";
import img1 from "../assets/image/Group 31.png";
import PremiumPageWrapper from "../components/subscription/PremiumPageWrapper";
import SubscriptionModal from "../components/subscription/SubscriptionModal";
import PricingOverlay from "../components/pricing/PricingOverlay";
import FieldDropdown from "../components/comman/FieldDropdown";

const Operation = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.auth?.user);
  const authToken = useSelector((state) => state?.auth?.token);
  const fields = useSelector((state) => state?.farmfield?.fields);
  const navigate = useNavigate();

  const userId = user?.id;

  const [selectedField, setSelectedField] = useState(null);
  const [showMembershipModalLocal, setShowMembershipModalLocal] = useState(false);
  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);

  useEffect(() => {
    if (userId) {
      dispatch(getFarmFields(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (fields?.length > 0 && !selectedField) {
      setSelectedField(fields[fields.length - 1]);
    }
  }, [fields, selectedField]);

  const selectedFieldDetails = selectedField;

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
      setShowMembershipModalLocal(false);
    } else {
      message.warning("Please select a field first");
    }
  }, [selectedFieldDetails]);

  const handleSkipMembership = useCallback(() => {
    setShowMembershipModalLocal(false);
    message.info(
      "You can activate premium anytime from the locked content sections"
    );
  }, []);

  const handleCloseMembershipModal = useCallback(() => {
    setShowMembershipModalLocal(false);
  }, []);

  const handleClosePricing = useCallback(() => {
    setShowPricingOverlay(false);
    setPricingFieldData(null);
  }, []);

  if (fields?.length === 0) {
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

  const hasSubscription = selectedField?.subscription?.hasActiveSubscription;
  const hasFarmOperationsManagement =
    hasSubscription &&
    selectedField?.subscription?.plan?.features?.farmOperationsManagement;

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

      <div className="w-full h-full m-0 p-0 flex">
        {/* Desktop Sidebar - Hidden on tablet/mobile */}
        <div className="hidden lg:block">
          <OperationSidebar
            setSelectedField={setSelectedField}
            selectedField={selectedField}
            hasSubscription={hasSubscription}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-[#5a7c6b] h-screen overflow-y-auto">
          {/* Tablet/Mobile Dropdown - Hidden on desktop */}
          <div className="lg:hidden p-3">
            <FieldDropdown
              fields={fields}
              selectedField={selectedField}
              setSelectedField={setSelectedField}
            />
          </div>

          <PremiumPageWrapper
            isLocked={!hasFarmOperationsManagement}
            onSubscribe={handleSubscribe}
            title="Farm Operations Management"
          >
            <Calendar selectedField={selectedField?._id} />
          </PremiumPageWrapper>
        </div>
      </div>
    </>
  );
};

export default Operation;