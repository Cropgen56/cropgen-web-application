import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

import SmartAdvisorySidebar from "../components/smartadvisory/smartadvisorysidebar/SmartAdvisorySidebar";
import SmartAdvisoryMap from "../components/smartadvisory/SmartAdvisoryMap";
import NDVIChartCard from "../components/smartadvisory/smartadvisorysidebar/Ndvigrapgh";
import NutrientManagement from "../components/smartadvisory/smartadvisorysidebar/NutrientManagement";
import WeatherCard from "../components/smartadvisory/smartadvisorysidebar/WeatherCard";
import PestDiseaseCard from "../components/smartadvisory/smartadvisorysidebar/PestDiseaseCard";
import FarmAdvisoryCard from "../components/smartadvisory/smartadvisorysidebar/FarmActivity";
import Soiltemp from "../components/smartadvisory/smartadvisorysidebar/Soiltemp";
import CropSwitcher from "../components/smartadvisory/smartadvisorysidebar/CropSwitcher";

import FeatureGuard from "../components/subscription/FeatureGuardComponent";
import { useSubscriptionGuard } from "../components/subscription/hooks/useSubscriptionGuard";

import PricingOverlay from "../components/pricing/PricingOverlay";
import FieldDropdown from "../components/comman/FieldDropdown";

import { getFarmFields } from "../redux/slices/farmSlice";
import {
  fetchHistoricalWeather,
  fetchAOIs,
} from "../redux/slices/weatherSlice";
import { useAoiManagement } from "../components/dashboard/hooks/useAoiManagement";
import { useWeatherForecast } from "../components/dashboard/hooks/useWeatherForecast";
import { useLiveSelectedField } from "../hooks/useLiveSelectedField";
import { usePollSmartAdvisory } from "../hooks/usePollSmartAdvisory";
import { findAoiForField } from "../utils/farmGeometry";

import img1 from "../assets/image/Group 31.png";

const getToday = () => new Date().toISOString().split("T")[0];
const getSixMonthsAgo = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString().split("T")[0];
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
  const location = useLocation();
  const user = useSelector((s) => s.auth?.user);
  const fields = useSelector((s) => s.farmfield?.fields || []);
  const aois = useSelector((s) => s.weather?.aois || []);

  const { selectedField, setSelectedField } = useLiveSelectedField(fields);

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

  const advisoryGuard = useSubscriptionGuard({
    field: selectedField,
    featureKey: "smartAdvisorySystem",
  });

  const { isGenerating } = usePollSmartAdvisory(selectedField, {
    enabled: advisoryGuard.hasFeatureAccess,
  });

  /* ---------- HISTORICAL (uses aoiId from useAoiManagement) ---------- */
  useEffect(() => {
    if (!selectedField) return;
    const aoi = findAoiForField(aois, selectedField._id);
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

  useEffect(() => {
    if (location.hash !== "#activities-to-do") return;
    const scrollToActivities = () => {
      document
        .getElementById("activities-to-do")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const timer = window.setTimeout(scrollToActivities, 300);
    return () => window.clearTimeout(timer);
  }, [location.hash, selectedField?._id]);

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
              selectedField={selectedField}
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

                  <CropSwitcher />

                  <NDVIChartCard selectedField={selectedField} />
                  <NutrientManagement isGenerating={isGenerating} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <WeatherCard aoiId={aoiId} />
                    <PestDiseaseCard isGenerating={isGenerating} />
                  </div>

                  <Soiltemp />
                  <FarmAdvisoryCard
                    selectedField={selectedField}
                    isGenerating={isGenerating}
                  />
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
