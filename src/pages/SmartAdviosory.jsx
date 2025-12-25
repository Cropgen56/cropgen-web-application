import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import SmartAdvisorySidebar from "../components/smartadvisory/smartadvisorysidebar/SmartAdvisorySidebar";
import SmartAdvisoryMap from "../components/smartadvisory/SmartAdvisoryMap";
import NDVIChartCard from "../components/smartadvisory/smartadvisorysidebar/Ndvigrapgh";
import IrrigationStatusCard from "../components/smartadvisory/smartadvisorysidebar/IrrigationStatusCard";
import NutrientManagement from "../components/smartadvisory/smartadvisorysidebar/NutrientManagement";
import WeatherCard from "../components/smartadvisory/smartadvisorysidebar/WeatherCard";
import PestDiseaseCard from "../components/smartadvisory/smartadvisorysidebar/PestDiseaseCard";
import FarmAdvisoryCard from "../components/smartadvisory/smartadvisorysidebar/Farmadvisory";
import Soiltemp from "../components/smartadvisory/smartadvisorysidebar/Soiltemp";

import PremiumPageWrapper from "../components/subscription/PremiumPageWrapper";
import SubscriptionModal from "../components/subscription/SubscriptionModal";
import PricingOverlay from "../components/pricing/PricingOverlay";

import { getFarmFields } from "../redux/slices/farmSlice";
import useIsTablet from "../components/smartadvisory/smartadvisorysidebar/Istablet";

import "leaflet/dist/leaflet.css";
import img1 from "../assets/image/Group 31.png";

const SmartAdvisory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isTablet = useIsTablet();

  const user = useSelector((s) => s.auth?.user);
  const fieldsRaw = useSelector((s) => s.farmfield?.fields ?? []);

 
  const [selectedField, setSelectedField] = useState(null);
  // Track if user has manually selected a field
  const [hasManuallySelected, setHasManuallySelected] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);

  const fields = useMemo(() => fieldsRaw ?? [], [fieldsRaw]);
  const selectedFieldsDetials = useMemo(
    () => (selectedField ? [selectedField] : []),
    [selectedField]
  );

  // Fetch fields on mount
  useEffect(() => {
    if (user?.id) dispatch(getFarmFields(user.id));
  }, [dispatch, user?.id]);


  const handleFieldSelect = useCallback((field) => {
    setSelectedField(field);
    setHasManuallySelected(true);
  }, []);


  const handleBackToFieldSelection = useCallback(() => {
    setSelectedField(null);
    setHasManuallySelected(false);
  }, []);

  // Handlers
  const handleSubscribe = useCallback(() => {
    if (!selectedField) {
      message.warning("Please select a field first");
      return;
    }
    const areaInHectares =
      selectedField?.areaInHectares ??
      (selectedField?.acre ? selectedField.acre * 0.404686 : 5);
    setPricingFieldData({
      id: selectedField._id,
      name: selectedField.fieldName || selectedField.farmName,
      areaInHectares,
      cropName: selectedField.cropName,
    });
    setShowPricingOverlay(true);
    setShowMembershipModal(false);
  }, [selectedField]);

  const handleSkipMembership = useCallback(() => {
    setShowMembershipModal(false);
    message.info(
      "You can activate premium anytime from the locked content sections"
    );
  }, []);

  const handleCloseMembershipModal = useCallback(
    () => setShowMembershipModal(false),
    []
  );
  const handleClosePricing = useCallback(() => {
    setShowPricingOverlay(false);
    setPricingFieldData(null);
  }, []);


  if (!fields || fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-[#5a7c6b] text-center px-4">
        <img
          src={img1}
          alt="No Fields"
          className="w-[400px] h-[400px] mb-6 opacity-70"
        />
        <h2 className="text-2xl font-semibold text-white">
          Add Farm to See the Smart Advisory
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
  const hasSmartAdvisorySystem =
    hasSubscription &&
    selectedField?.subscription?.plan?.features?.smartAdvisorySystem;

  const showSidebar = !hasManuallySelected;

  return (
    <>
      <SubscriptionModal
        isOpen={showMembershipModal}
        onClose={handleCloseMembershipModal}
        onSubscribe={handleSubscribe}
        onSkip={handleSkipMembership}
        fieldName={selectedField?.fieldName || selectedField?.farmName}
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

      <div className="flex h-screen overflow-hidden bg-[#5a7c6b] text-white">

        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="min-w-[280px] h-full border-r border-gray-700 bg-white text-black"
            >
              <SmartAdvisorySidebar
                setSelectedField={handleFieldSelect}
                setIsSidebarVisible={() => { }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 px-3 py-4 h-screen overflow-y-auto relative">
          {hasManuallySelected && selectedField ? (
            <>
              <div className="mb-4">
                <button
                  className="bg-[#344e41] text-white px-4 py-2 rounded-md text-sm shadow hover:bg-[#2d4339] transition-colors flex items-center gap-2"
                  onClick={handleBackToFieldSelection}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Select Another Farm
                </button>
              </div>

              <PremiumPageWrapper
                isLocked={!hasSmartAdvisorySystem}
                onSubscribe={handleSubscribe}
                title="Smart Advisory System"
              >
                {isTablet ? (
                  <div className="flex flex-col gap-4 w-full max-w-[1024px] mx-auto">
                    <div className="w-full h-[350px] rounded-lg overflow-hidden shadow relative">
                      <SmartAdvisoryMap
                        fields={fields}
                        selectedField={selectedField}
                        setSelectedField={setSelectedField}
                        selectedFieldsDetials={selectedFieldsDetials}
                        showFieldDropdown={false}
                        height="350px"
                      />
                    </div>
                    <NDVIChartCard selectedField={selectedField} />
                    <div className="flex flex-col gap-4 w-full">
                      <div className="bg-[#4b6b5b] rounded-lg p-2 overflow-hidden">
                        <IrrigationStatusCard />
                      </div>
                      <div className="bg-[#4b6b5b] rounded-lg p-2 overflow-hidden">
                        <NutrientManagement />
                      </div>
                      <div className="col-span-2 bg-[#4b6b5b] rounded-lg p-2 overflow-hidden">
                        <WeatherCard />
                      </div>
                      <div className="col-span-2 bg-[#4b6b5b] rounded-lg p-2 overflow-hidden">
                        <PestDiseaseCard />
                      </div>
                      <div className="col-span-2 bg-[#4b6b5b] rounded-lg p-2 overflow-x-auto">
                        <Soiltemp />
                      </div>
                    </div>
                    <div className="w-full bg-[#4b6b5b] rounded-lg p-2 overflow-hidden">
                      <FarmAdvisoryCard />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 w-full">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex flex-col lg:w-[65%]">
                        <div className="w-full h-[350px] rounded-lg overflow-hidden shadow relative">
                          <SmartAdvisoryMap
                            fields={fields}
                            selectedField={selectedField}
                            setSelectedField={setSelectedField}
                            selectedFieldsDetials={selectedFieldsDetials}
                            showFieldDropdown={false}
                            height="350px"
                          />
                        </div>
                        <NDVIChartCard selectedField={selectedField} />
                      </div>
                      <div className="lg:w-[35%]">
                        <IrrigationStatusCard />
                      </div>
                    </div>
                    <NutrientManagement />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 w-full">
                      <WeatherCard />
                      <PestDiseaseCard />
                    </div>
                    <div className="flex flex-row gap-4 w-full">
                      <div className="w-full overflow-x-auto">
                        <Soiltemp />
                      </div>
                    </div>
                    <div className="w-full">
                      <FarmAdvisoryCard />
                    </div>
                  </div>
                )}
              </PremiumPageWrapper>
            </>
          ) : (
            !showSidebar && (
              <div className="flex items-center justify-center h-full w-full">
                <div className="flex flex-col items-center text-center opacity-60">
                  <img src={img1} alt="" className="w-[300px] h-[300px] mb-4" />
                  <p className="text-2xl font-semibold">
                    Select a Field from the Sidebar
                  </p>
                </div>
              </div>
            )
          )}

          {showSidebar && (
            <div className="flex items-center justify-center h-full w-full">
              <div className="flex flex-col items-center text-center opacity-60">
                <img src={img1} alt="" className="w-[300px] h-[300px] mb-4" />
                <p className="text-2xl font-semibold">
                  Select a Field to Generate Smart Advisory
                </p>
                <p className="text-sm mt-2 opacity-80">
                  Choose a field from the sidebar to view detailed advisory
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SmartAdvisory;