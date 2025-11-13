import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import SmartAdvisorySidebar from "../components/smartadvisory/smartadvisorysidebar/SmartAdvisorySidebar";
import { getFarmFields } from "../redux/slices/farmSlice";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import img1 from "../assets/image/Group 31.png";
import { useNavigate } from "react-router-dom";
import SatelliteIndexScroll from "../components/smartadvisory/smartadvisorysidebar/SatelliteIndexScroll";
import NDVIChartCard from "../components/smartadvisory/smartadvisorysidebar/Ndvigrapgh";
import IrrigationStatusCard from "../components/smartadvisory/smartadvisorysidebar/IrrigationStatusCard";
import CropAdvisoryCard from "../components/smartadvisory/smartadvisorysidebar/CropAdvisoryCard";
import WeatherCard from "../components/smartadvisory/smartadvisorysidebar/WeatherCard";
import PestDiseaseCard from "../components/smartadvisory/smartadvisorysidebar/PestDiseaseCard";
import FarmAdvisoryCard from "../components/smartadvisory/smartadvisorysidebar/Farmadvisory";
import Fertigation from "../components/smartadvisory/smartadvisorysidebar/Fertigation";
import Soiltemp from "../components/smartadvisory/smartadvisorysidebar/Soiltemp";
import useIsTablet from "../components/smartadvisory/smartadvisorysidebar/Istablet";
import PremiumPageWrapper from "../components/subscription/PremiumPageWrapper";
import SubscriptionModal from "../components/subscription/SubscriptionModal";
import PricingOverlay from "../components/pricing/PricingOverlay";
import {
  checkFieldSubscriptionStatus,
  setCurrentField,
  displayMembershipModal,
  hideMembershipModal,
  selectHasSmartAdvisorySystem, // Updated import
} from "../redux/slices/membershipSlice";

const SUBSCRIPTION_CHECK_INTERVAL = 5 * 60 * 1000;

const SmartAdvisory = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.auth?.user);
  const authToken = useSelector((state) => state?.auth?.token);
  const fields = useSelector((state) => state?.farmfield?.fields);

  const showMembershipModal = useSelector(
    (state) => state.membership.showMembershipModal
  );
  const hasSmartAdvisorySystem = useSelector(selectHasSmartAdvisorySystem);
  const fieldSubscriptions = useSelector(
    (state) => state.membership.fieldSubscriptions
  );

  const [reportdata, setReportData] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);

  const isTablet = useIsTablet();
  const navigate = useNavigate();
  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      dispatch(getFarmFields(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (selectedField && authToken) {
      dispatch(setCurrentField(selectedField._id));

      const fieldSub = fieldSubscriptions[selectedField._id];
      const shouldCheck =
        !fieldSub ||
        (fieldSub.lastChecked &&
          new Date() - new Date(fieldSub.lastChecked) >
          SUBSCRIPTION_CHECK_INTERVAL);

      if (shouldCheck) {
        dispatch(
          checkFieldSubscriptionStatus({
            fieldId: selectedField._id,
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
          fieldId: selectedField._id,
          authToken,
        })
      );
    }, SUBSCRIPTION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [selectedField, authToken, dispatch]);

  const handleSubscribe = useCallback(() => {
    if (selectedField) {
      const areaInHectares =
        selectedField?.areaInHectares ||
        selectedField?.acre * 0.404686 ||
        5;
      const fieldData = {
        id: selectedField._id,
        name: selectedField.fieldName || selectedField.farmName,
        areaInHectares,
        cropName: selectedField.cropName,
      };

      setPricingFieldData(fieldData);
      setShowPricingOverlay(true);
      dispatch(hideMembershipModal());
    } else {
      message.warning("Please select a field first");
    }
  }, [selectedField, dispatch]);

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
          fieldId: selectedField._id,
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
        {isSidebarVisible && (
          <div className="min-w-[280px] h-full border-r border-gray-700 bg-white text-black">
            <SmartAdvisorySidebar
              setReportData={setReportData}
              setSelectedField={setSelectedField}
              setIsSidebarVisible={setIsSidebarVisible}
            />
          </div>
        )}

        <div className="flex-1 p-4 h-screen overflow-y-auto relative">
          {!isSidebarVisible && (
            <div className="mb-4">
              <button
                className="bg-[#344e41] text-white px-4 py-2 rounded-md text-sm shadow"
                onClick={() => {
                  setIsSidebarVisible(true);
                  setReportData(null);
                }}
              >
                Select Another Farm
              </button>
            </div>
          )}

          {reportdata ? (
            <PremiumPageWrapper
              isLocked={!hasSmartAdvisorySystem}
              onSubscribe={handleSubscribe}
              title="Smart Advisory System"
            >
              {isTablet ? (
                <div className="flex flex-col gap-4 w-full max-w-[1024px] mx-auto">
                  <div className="w-full h-[300px] rounded-lg overflow-hidden shadow relative">
                    <MapContainer
                      center={[reportdata.lat, reportdata.lng]}
                      zoom={15}
                      className="w-full h-full z-0"
                    >
                      <TileLayer
                        attribution="©️ Google Maps"
                        url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                        subdomains={["mt0", "mt1", "mt2", "mt3"]}
                      />
                      <Marker position={[reportdata.lat, reportdata.lng]}>
                        <Popup>{reportdata.field}</Popup>
                      </Marker>
                    </MapContainer>
                    <div className="absolute bottom-1 left-2 right-2 z-[1000]">
                      <SatelliteIndexScroll />
                    </div>
                  </div>

                  <NDVIChartCard />

                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-[#4b6b5b] rounded-lg p-2 overflow-hidden">
                      <IrrigationStatusCard />
                    </div>
                    <div className="bg-[#4b6b5b] rounded-lg p-2 overflow-hidden">
                      <CropAdvisoryCard />
                    </div>
                    <div className="col-span-2 bg-[#4b6b5b] rounded-lg p-2 overflow-hidden">
                      <WeatherCard />
                    </div>
                    <div className="col-span-2 bg-[#4b6b5b] rounded-lg p-2 overflow-hidden">
                      <PestDiseaseCard />
                    </div>
                    <div className="col-span-2 bg-[#4b6b5b] rounded-lg p-2 overflow-x-auto">
                      <Fertigation />
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
                      <div className="w-full h-[300px] rounded-lg overflow-hidden shadow relative">
                        <MapContainer
                          center={[reportdata.lat, reportdata.lng]}
                          zoom={15}
                          className="w-full h-full z-0"
                        >
                          <TileLayer
                            attribution="©️ Google Maps"
                            url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                            subdomains={["mt0", "mt1", "mt2", "mt3"]}
                          />
                          <Marker position={[reportdata.lat, reportdata.lng]}>
                            <Popup>{reportdata.field}</Popup>
                          </Marker>
                        </MapContainer>
                        <div className="absolute bottom-1 left-2 right-2 z-[1000]">
                          <SatelliteIndexScroll />
                        </div>
                      </div>

                      <NDVIChartCard />
                    </div>

                    <div className="lg:w-[35%]">
                      <IrrigationStatusCard />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    <CropAdvisoryCard />
                    <WeatherCard />
                    <PestDiseaseCard />
                  </div>

                  <div className="flex flex-row gap-4 w-full">
                    <div className="w-[32%] overflow-x-auto">
                      <Fertigation />
                    </div>
                    <div className="w-[65%] overflow-x-auto">
                      <Soiltemp />
                    </div>
                  </div>

                  <div className="w-full">
                    <FarmAdvisoryCard />
                  </div>
                </div>
              )}
            </PremiumPageWrapper>
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <div className="flex flex-col items-center text-center opacity-60">
                <img src={img1} alt="" />
                <p className="text-2xl font-semibold">
                  Select Field For Generate Smart Advisory
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