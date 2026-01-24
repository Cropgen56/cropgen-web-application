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
import FieldDropdown from "../components/comman/FieldDropdown";

import { getFarmFields } from "../redux/slices/farmSlice";
import {
  fetchForecastData,
  fetchHistoricalWeather,
  fetchAOIs,
  createAOI,
} from "../redux/slices/weatherSlice";
import { fetchSmartAdvisory } from "../redux/slices/smartAdvisorySlice";

import useIsTablet from "../components/smartadvisory/smartadvisorysidebar/Istablet";
import "leaflet/dist/leaflet.css";
import img1 from "../assets/image/Group 31.png";

/* ---------- Utils ---------- */
const formatCoordinates = (data) => {
  if (!Array.isArray(data) || data.length === 0) return [];
  const coords = data.map((p) => [p.lng, p.lat]);
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) coords.push(first);
  return coords;
};

const getToday = () => new Date().toISOString().split("T")[0];
const getSixMonthsAgo = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString().split("T")[0];
};

const SmartAdvisory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isTablet = useIsTablet();

  const user = useSelector((s) => s.auth?.user);
  const fieldsRaw = useSelector((s) => s.farmfield?.fields);
  const aois = useSelector((s) => s.weather?.aois ?? []);

  const fields = useMemo(
    () => (Array.isArray(fieldsRaw) ? fieldsRaw : []),
    [fieldsRaw]
  );

  const [selectedField, setSelectedField] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const [historicalData, setHistoricalData] = useState(null);
  const [dateRange, setDateRange] = useState(null);

  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);

  /* ---------- Fetch fields + AOIs ---------- */
  useEffect(() => {
    if (user?.id) {
      dispatch(getFarmFields(user.id));
      dispatch(fetchAOIs());
    }
  }, [dispatch, user?.id]);

  /* ---------- Fetch Smart Advisory ---------- */
  useEffect(() => {
    if (selectedField?._id) {
      dispatch(fetchSmartAdvisory({ fieldId: selectedField._id })).catch(
        () => {}
      );
    }
  }, [dispatch, selectedField]);

  /* ---------- AOI ---------- */
  const aoiPayload = useMemo(() => {
    if (!selectedField?.field?.length) return null;
    return {
      name: selectedField._id,
      geometry: {
        type: "Polygon",
        coordinates: [formatCoordinates(selectedField.field)],
      },
    };
  }, [selectedField]);

  useEffect(() => {
    if (!aoiPayload) return;
    const exists = aois.find((a) => a.name === aoiPayload.name);
    if (!exists && aoiPayload.geometry.coordinates[0].length) {
      dispatch(createAOI(aoiPayload));
    }
  }, [aoiPayload, aois, dispatch]);

  /* ---------- Forecast ---------- */
  useEffect(() => {
    if (!selectedField || !aois.length) return;
    const matchingAOI = aois.find((a) => a.name === selectedField._id);
    if (matchingAOI?.id) {
      dispatch(fetchForecastData({ geometry_id: matchingAOI.id }));
    }
  }, [dispatch, selectedField, aois]);

  /* ---------- Auto 6-month historical weather ---------- */
  useEffect(() => {
    if (!selectedField || !aois.length || historicalData) return;

    const matchingAOI = aois.find((a) => a.name === selectedField._id);
    if (!matchingAOI?.id) return;

    const startDate = getSixMonthsAgo();
    const endDate = getToday();

    dispatch(
      fetchHistoricalWeather({
        geometry_id: matchingAOI.id,
        start_date: startDate,
        end_date: endDate,
      })
    )
      .unwrap()
      .then((res) => {
        if (res?.daily) {
          setHistoricalData(res.daily);
          setDateRange({ startDate, endDate });
        }
      })
      .catch(() => {});
  }, [dispatch, selectedField, aois, historicalData]);

  /* ---------- Auto select for tablet ---------- */
  useEffect(() => {
    if (isTablet && fields.length && !selectedField) {
      setSelectedField(fields[fields.length - 1]);
    }
  }, [fields, selectedField, isTablet]);

  const handleFieldSelect = useCallback((field) => {
    setSelectedField(field);
    setIsSidebarVisible(false);
  }, []);

  const handleSubscribe = useCallback(() => {
    if (!selectedField) {
      message.warning("Please select a field first");
      return;
    }

    const areaInHectares =
      selectedField.areaInHectares ??
      (selectedField.acre ? selectedField.acre * 0.404686 : 5);

    setPricingFieldData({
      id: selectedField._id,
      name: selectedField.fieldName || selectedField.farmName,
      cropName: selectedField.cropName,
      areaInHectares,
    });

    setShowPricingOverlay(true);
    setShowMembershipModal(false);
  }, [selectedField]);

  if (!fields.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#5a7c6b] text-white text-center px-4">
        <img src={img1} className="w-[260px] mb-6 opacity-70" />
        <h2 className="text-2xl font-semibold">
          Add Farm to See Smart Advisory
        </h2>
        <button
          onClick={() => navigate("/addfield")}
          className="mt-6 px-5 py-2 bg-white text-[#5a7c6b] rounded-lg"
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

  const renderAdvisoryContent = () => (
    <PremiumPageWrapper
      isLocked={!hasSmartAdvisorySystem}
      onSubscribe={handleSubscribe}
      title="Smart Advisory System"
    >
      <div className="flex flex-col gap-3 sm:gap-4 w-full">

        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          <div className="flex flex-col w-full lg:w-[65%] gap-3 sm:gap-4">
            <div className="w-full rounded-lg overflow-hidden shadow
                            h-[260px] sm:h-[300px] lg:h-[350px]">
              <SmartAdvisoryMap
                fields={fields}
                selectedField={selectedField}
                setSelectedField={setSelectedField}
                height="100%"
              />
            </div>
            <NDVIChartCard selectedField={selectedField} />
          </div>

          <div className="w-full lg:w-[35%]">
            <IrrigationStatusCard />
          </div>
        </div>

        <NutrientManagement />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <WeatherCard
            selectedField={selectedField}
            historicalData={historicalData}
            dateRange={dateRange}
          />
          <PestDiseaseCard />
        </div>

        <div className="w-full overflow-x-auto">
          <Soiltemp />
        </div>

        <FarmAdvisoryCard selectedField={selectedField} />
      </div>
    </PremiumPageWrapper>
  );

  return (
    <>
      <SubscriptionModal
        isOpen={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        onSubscribe={handleSubscribe}
        onSkip={() => setShowMembershipModal(false)}
        fieldName={selectedField?.fieldName}
      />

      <AnimatePresence>
        {showPricingOverlay && pricingFieldData && (
          <motion.div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center">
            <PricingOverlay
              onClose={() => setShowPricingOverlay(false)}
              userArea={pricingFieldData.areaInHectares}
              selectedField={pricingFieldData}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex h-screen bg-[#5a7c6b]">
        <div className="hidden lg:flex">
          {isSidebarVisible && (
            <SmartAdvisorySidebar
              setSelectedField={handleFieldSelect}
              setIsSidebarVisible={setIsSidebarVisible}
            />
          )}
        </div>

        <div className="flex-1 p-2 sm:p-3 lg:p-4 overflow-y-auto">
          {selectedField ? (
            renderAdvisoryContent()
          ) : (
            <FieldDropdown
              fields={fields}
              selectedField={selectedField}
              setSelectedField={setSelectedField}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default SmartAdvisory;
