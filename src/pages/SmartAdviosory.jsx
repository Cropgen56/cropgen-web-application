import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import SmartAdvisorySidebar from "../components/smartadvisory/smartadvisorysidebar/SmartAdvisorySidebar";
import SmartAdvisoryMap from "../components/smartadvisory/SmartAdvisoryMap";
import NDVIChartCard from "../components/smartadvisory/smartadvisorysidebar/Ndvigrapgh";
import NutrientManagement from "../components/smartadvisory/smartadvisorysidebar/NutrientManagement";
import WeatherCard from "../components/smartadvisory/smartadvisorysidebar/WeatherCard";
import PestDiseaseCard from "../components/smartadvisory/smartadvisorysidebar/PestDiseaseCard";
import FarmAdvisoryCard from "../components/smartadvisory/smartadvisorysidebar/FarmActivity";
import Soiltemp from "../components/smartadvisory/smartadvisorysidebar/Soiltemp";

import PremiumPageWrapper from "../components/subscription/PremiumPageWrapper";
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
import img1 from "../assets/image/Group 31.png";

/* ================= HELPERS ================= */

const formatCoordinates = (data) => {
  if (!Array.isArray(data) || !data.length) return [];
  const coords = data.map((p) => [p.lng, p.lat]);
  if (coords.length > 2) coords.push(coords[0]);
  return coords;
};

const getToday = () => new Date().toISOString().split("T")[0];
const getSixMonthsAgo = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString().split("T")[0];
};

/* ================= COMPONENT ================= */

const SmartAdvisory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isTablet = useIsTablet();

  const user = useSelector((s) => s.auth?.user);
  const fields = useSelector((s) => s.farmfield?.fields || []);
  const aois = useSelector((s) => s.weather?.aois || []);

  const [selectedField, setSelectedField] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [historicalData, setHistoricalData] = useState(null);
  const [dateRange, setDateRange] = useState(null);

  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);

  /* ---------- INITIAL LOAD ---------- */
  useEffect(() => {
    if (user?.id) {
      dispatch(getFarmFields(user.id));
      dispatch(fetchAOIs());
    }
  }, [dispatch, user?.id]);

  /* ---------- FETCH ADVISORY ---------- */
  useEffect(() => {
    if (selectedField?._id) {
      dispatch(fetchSmartAdvisory({ fieldId: selectedField._id }));
    }
  }, [dispatch, selectedField?._id]);

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
    if (!aois.find((a) => a.name === aoiPayload.name)) {
      dispatch(createAOI(aoiPayload));
    }
  }, [aoiPayload, aois, dispatch]);

  /* ---------- FORECAST ---------- */
  useEffect(() => {
    const aoi = aois.find((a) => a.name === selectedField?._id);
    if (aoi?.id) {
      dispatch(fetchForecastData({ geometry_id: aoi.id }));
    }
  }, [dispatch, aois, selectedField?._id]);

  /* ---------- HISTORICAL ---------- */
  useEffect(() => {
    if (!selectedField) return;
    const aoi = aois.find((a) => a.name === selectedField._id);
    if (!aoi?.id) return;

    const startDate = getSixMonthsAgo();
    const endDate = getToday();

    dispatch(
      fetchHistoricalWeather({
        geometry_id: aoi.id,
        start_date: startDate,
        end_date: endDate,
      }),
    )
      .unwrap()
      .then((res) => {
        setHistoricalData(res?.daily || null);
        setDateRange({ startDate, endDate });
      })
      .catch(() => {});
  }, [dispatch, aois, selectedField?._id]);

  /* ---------- AUTO SELECT ---------- */
  useEffect(() => {
    if (isTablet && fields.length && !selectedField) {
      setSelectedField(fields[fields.length - 1]);
    }
  }, [isTablet, fields, selectedField]);

  /* ---------- SUBSCRIBE ---------- */
  const handleSubscribe = useCallback(() => {
    if (!selectedField) {
      message.warning("Please select a field first");
      return;
    }

    setPricingFieldData({
      id: selectedField._id,
      name: selectedField.fieldName,
      cropName: selectedField.cropName,
      areaInHectares: selectedField.acre * 0.404686,
    });

    setShowPricingOverlay(true);
  }, [selectedField]);

  /* ---------- EMPTY STATE ---------- */
  if (!fields.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#5a7c6b] text-white">
        <img src={img1} className="w-[260px] mb-6 opacity-70" />
        <button
          onClick={() => navigate("/addfield")}
          className="px-6 py-2 bg-white text-[#5a7c6b] rounded-lg"
        >
          Add Field
        </button>
      </div>
    );
  }

  /* ================= RENDER ================= */

  return (
    <>
      <AnimatePresence>
        {showPricingOverlay && pricingFieldData && (
          <motion.div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <PricingOverlay
              onClose={() => setShowPricingOverlay(false)}
              selectedField={pricingFieldData}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex h-screen bg-[#5a7c6b]">
        {/* Sidebar */}
        <div className="hidden lg:flex">
          {isSidebarVisible && (
            <SmartAdvisorySidebar
              setSelectedField={setSelectedField}
              setIsSidebarVisible={setIsSidebarVisible}
            />
          )}
        </div>

        {/* Main */}
        <div className="flex-1 p-4  overflow-y-auto ">
          <FieldDropdown
            fields={fields}
            selectedField={selectedField}
            setSelectedField={setSelectedField}
          />

          {selectedField && (
            <PremiumPageWrapper
              isLocked={!selectedField?.subscription?.hasActiveSubscription}
              onSubscribe={handleSubscribe}
              title="Smart Advisory System"
            >
              <SmartAdvisoryMap
                fields={fields}
                selectedField={selectedField}
                setSelectedField={setSelectedField}
              />

              <NDVIChartCard selectedField={selectedField} />
              <NutrientManagement />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                <WeatherCard
                  selectedField={selectedField}
                  historicalData={historicalData}
                  dateRange={dateRange}
                />
                <PestDiseaseCard />
              </div>

              <Soiltemp />
              <FarmAdvisoryCard selectedField={selectedField} />
            </PremiumPageWrapper>
          )}
        </div>
      </div>
    </>
  );
};

export default SmartAdvisory;
