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

import FeatureGuard from "../components/subscription/FeatureGuardComponent";
import { useSubscriptionGuard } from "../components/subscription/hooks/useSubscriptionGuard";

import PricingOverlay from "../components/pricing/PricingOverlay";
import FieldDropdown from "../components/comman/FieldDropdown";

import { getFarmFields } from "../redux/slices/farmSlice";
import {
  fetchForecastData,
  fetchHistoricalWeather,
  fetchAOIs,
  createAOI,
} from "../redux/slices/weatherSlice";
import { useAoiManagement } from "../components/dashboard/hooks/useAoiManagement";
import { useWeatherForecast } from "../components/dashboard/hooks/useWeatherForecast";
import { fetchSmartAdvisory } from "../redux/slices/smartAdvisorySlice";

import useIsTablet from "../components/smartadvisory/smartadvisorysidebar/Istablet";
import img1 from "../assets/image/Group 31.png";

const getToday = () => new Date().toISOString().split("T")[0];
const getSixMonthsAgo = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString().split("T")[0];
};

const formatCoordinates = (data) => {
  if (!Array.isArray(data) || !data.length) return [];
  const coords = data.map((p) => [p.lng, p.lat]);
  if (coords.length > 2) coords.push(coords[0]);
  return coords;
};

const EmptyState = ({ onAddField }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-[#5a7c6b] text-white">
    <img src={img1} alt="" className="w-[260px] mb-6 opacity-70" />
    <button
      onClick={onAddField}
      className="px-6 py-2.5 bg-white text-[#5a7c6b] rounded-lg font-medium hover:bg-white/90 transition-colors"
    >
      Add Field
    </button>
  </div>
);

/* ================= COMPONENT ================= */

const SmartAdvisory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isTablet = useIsTablet();

  const user = useSelector((s) => s.auth?.user);
  const fields = useSelector((s) => s.farmfield?.fields || []);
  const aois = useSelector((s) => s.weather?.aois || []);

  const [selectedField, setSelectedField] = useState(null);

  /* ---------- AOI + WEATHER (proven flow from Dashboard/FarmReport) ---------- */
  const { aoiId } = useAoiManagement(selectedField);
  useWeatherForecast(aoiId);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);

  /* ---------- INITIAL LOAD ---------- */
  useEffect(() => {
    if (user?.id) {
      dispatch(getFarmFields(user.id));
      dispatch(fetchAOIs());
    }
  }, [dispatch, user?.id]);

  /* ---------- AUTO SELECT ---------- */
  useEffect(() => {
    if (isTablet && fields.length && !selectedField) {
      setSelectedField(fields[fields.length - 1]);
    }
  }, [isTablet, fields, selectedField]);

  /* ---------- FETCH ADVISORY ---------- */
  useEffect(() => {
    if (selectedField?._id) {
      dispatch(fetchSmartAdvisory({ fieldId: selectedField._id }));
    }
  }, [dispatch, selectedField?._id]);

  /* ---------- HISTORICAL (uses aoiId from useAoiManagement) ---------- */
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
    );
  }, [dispatch, aois, selectedField]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- SUBSCRIPTION GUARD (SAME AS WEATHER) ---------- */
  const advisoryGuard = useSubscriptionGuard({
    field: selectedField,
    featureKey: "smartAdvisorySystem",
  });

  /* ---------- PRICING ---------- */
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

  if (!fields.length) {
    return (
      <EmptyState onAddField={() => navigate("/addfield")} />
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
        <div className="hidden lg:flex">
          {isSidebarVisible && (
            <SmartAdvisorySidebar
              setSelectedField={setSelectedField}
              setIsSidebarVisible={setIsSidebarVisible}
            />
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 pb-8 space-y-4 max-w-7xl mx-auto">
            <FieldDropdown
              fields={fields}
              selectedField={selectedField}
              setSelectedField={setSelectedField}
            />

            {selectedField && (
              <FeatureGuard
                guard={advisoryGuard}
                title="Smart Advisory System"
                onSubscribe={handleSubscribe}
              >
                <div className="space-y-4">
                  <SmartAdvisoryMap
                    fields={fields}
                    selectedField={selectedField}
                    setSelectedField={setSelectedField}
                  />

                  <NDVIChartCard selectedField={selectedField} />
                  <NutrientManagement />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <WeatherCard aoiId={aoiId} />
                    <PestDiseaseCard />
                  </div>

                  <Soiltemp />
                  <FarmAdvisoryCard selectedField={selectedField} />
                </div>
              </FeatureGuard>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SmartAdvisory;
