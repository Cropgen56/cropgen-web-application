import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { useDispatch, useSelector } from "react-redux";

import MapView from "../components/dashboard/mapview/MapView";
import CropHealth from "../components/dashboard/crophealth/CropHealthCard";
import ForeCast from "../components/dashboard/forecast/ForeCast";
import NdviGraph from "../components/dashboard/satellite-index/VegetationIndex";
import WaterIndex from "../components/dashboard/satellite-index/WaterIndex";
import EvapotranspirationDashboard from "../components/dashboard/satellite-index/ETChart";
import Insights from "../components/dashboard/insights/Insights";
import PlantGrowthActivity from "../components/dashboard/PlantGrowthActivity";

import SubscriptionModal from "../components/subscription/SubscriptionModal";
import PaymentSuccessModal from "../components/subscription/PaymentSuccessModal";
import PricingOverlay from "../components/pricing/PricingOverlay";
import LoadingSpinner from "../components/comman/loading/LoadingSpinner";

import { useFarmFields } from "../components/dashboard/hooks/useFarmFields";
import { useSelectedField } from "../components/dashboard/hooks/useSelectedField";
import { useAoiManagement } from "../components/dashboard/hooks/useAoiManagement";
import { useWeatherForecast } from "../components/dashboard/hooks/useWeatherForecast";

import { fetchSmartAdvisory } from "../redux/slices/smartAdvisorySlice";

import "../styles/dashboard.css";

const POLL_INTERVAL = 5000; // 5 sec
const MAX_POLL_ATTEMPTS = 12; // 1 min

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const pollRef = useRef(null);
  const pollCountRef = useRef(0);

  const { fields, isLoadingFields } = useFarmFields();
  const { selectedField, selectedFieldDetails, handleFieldSelection } =
    useSelectedField(fields);

  const { aoiId } = useAoiManagement(selectedFieldDetails);
  const { forecast, units } = useWeatherForecast(aoiId);

  const advisoryState = useSelector((state) => state.smartAdvisory);

  /* ------------------ Fetch advisory ------------------ */
  const fetchAdvisory = useCallback(() => {
    if (!selectedFieldDetails?._id) return;

    dispatch(
      fetchSmartAdvisory({
        fieldId: selectedFieldDetails._id,
      }),
    );
  }, [dispatch, selectedFieldDetails]);

  /* ------------------ Initial fetch ------------------ */
  useEffect(() => {
    fetchAdvisory();
  }, [fetchAdvisory]);

  /* ------------------ Polling for new advisory ------------------ */
  useEffect(() => {
    if (!selectedFieldDetails?._id) return;

    if (advisoryState?.exists) {
      // Advisory found → stop polling
      clearInterval(pollRef.current);
      pollRef.current = null;
      pollCountRef.current = 0;
      return;
    }

    // Start polling if advisory not found
    if (!pollRef.current) {
      pollRef.current = setInterval(() => {
        pollCountRef.current += 1;
        fetchAdvisory();

        if (pollCountRef.current >= MAX_POLL_ATTEMPTS) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }, POLL_INTERVAL);
    }

    return () => {
      clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [advisoryState?.exists, fetchAdvisory, selectedFieldDetails]);

  /* ------------------ UI helpers ------------------ */
  const isSubscribed =
    !!selectedFieldDetails?.subscription?.hasActiveSubscription;

  const hasFeature = (key) =>
    isSubscribed && !!selectedFieldDetails?.subscription?.plan?.features?.[key];

  const showContent = fields.length > 0 && !isLoadingFields;

  /* ------------------ Render ------------------ */
  return (
    <div className="dashboard min-h-screen w-full overflow-y-auto p-2 lg:p-4">
      <PaymentSuccessModal />

      <MapView
        selectedField={selectedField}
        setSelectedField={handleFieldSelection}
        selectedFieldsDetials={
          selectedFieldDetails ? [selectedFieldDetails] : []
        }
        fields={fields}
        showFieldDropdown
      />

      {showContent && (
        <div className="mt-6 space-y-8">
          {selectedFieldDetails && (
            <CropHealth
              selectedFieldsDetials={[selectedFieldDetails]}
              fields={fields}
              hasCropHealthAndYield={hasFeature("soilAnalysisAndHealth")}
            />
          )}

          <ForeCast hasWeatherAnalytics={hasFeature("weatherAnalytics")} />

          <NdviGraph
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
            hasVegetationIndices={hasFeature("vegetationIndices")}
          />

          <WaterIndex
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
            hasWaterIndices={hasFeature("waterIndices")}
          />

          <EvapotranspirationDashboard
            forecast={forecast}
            units={units}
            hasEvapotranspiration={hasFeature("evapotranspirationMonitoring")}
          />

          <Insights hasAgronomicInsights={hasFeature("agronomicInsights")} />

          <PlantGrowthActivity
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
            hasCropGrowthMonitoring={hasFeature("cropGrowthMonitoring")}
          />
        </div>
      )}

      {/* First-time user overlay */}
      <AnimatePresence>
        {fields.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          >
            <button
              onClick={() => navigate("/addfield")}
              className="px-6 py-4 bg-green-600 rounded-xl text-white"
            >
              <PlusIcon /> Add Your First Field
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(Dashboard);
