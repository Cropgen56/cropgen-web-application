import React, { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import MapView from "../components/dashboard/mapview/MapView";
import CropHealth from "../components/dashboard/crophealth/CropHealthCard";
import ForeCast from "../components/dashboard/forecast/ForeCast";
import NdviGraph from "../components/dashboard/satellite-index/VegetationIndex";
import WaterIndex from "../components/dashboard/satellite-index/WaterIndex";
import EvapotranspirationDashboard from "../components/dashboard/satellite-index/ETChart";
import Insights from "../components/dashboard/insights/Insights";
import PlantGrowthActivity from "../components/dashboard/PlantGrowthActivity";

import PaymentSuccessModal from "../components/subscription/PaymentSuccessModal";

import { useFarmFields } from "../components/dashboard/hooks/useFarmFields";
import { useSelectedField } from "../components/dashboard/hooks/useSelectedField";
import { useAoiManagement } from "../components/dashboard/hooks/useAoiManagement";
import { useWeatherForecast } from "../components/dashboard/hooks/useWeatherForecast";

import { fetchSmartAdvisory } from "../redux/slices/smartAdvisorySlice";

import "../styles/dashboard.css";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* ================= DATA ================= */
  const { fields, isLoadingFields } = useFarmFields();
  const { selectedField, selectedFieldDetails, handleFieldSelection } =
    useSelectedField(fields);

  const { aoiId } = useAoiManagement(selectedFieldDetails);
  const { forecast, units } = useWeatherForecast(aoiId);

  /* ================= ADVISORY (CALL ONLY ONCE PER FIELD) ================= */
  const lastFetchedFieldIdRef = useRef(null);

  useEffect(() => {
    const fieldId = selectedFieldDetails?._id;
    if (!fieldId) return;

    // ✅ Prevent duplicate API calls
    if (lastFetchedFieldIdRef.current === fieldId) return;

    lastFetchedFieldIdRef.current = fieldId;
    dispatch(fetchSmartAdvisory({ fieldId }));
  }, [dispatch, selectedFieldDetails?._id]);

  /* ================= SUBSCRIPTION HELPERS ================= */
  const isSubscribed =
    !!selectedFieldDetails?.subscription?.hasActiveSubscription;

  const hasFeature = useCallback(
    (featureKey) =>
      isSubscribed &&
      !!selectedFieldDetails?.subscription?.plan?.features?.[featureKey],
    [isSubscribed, selectedFieldDetails],
  );

  const showContent = fields.length > 0 && !isLoadingFields;

  /* ================= RENDER ================= */
  return (
    <div className="dashboard min-h-screen w-full overflow-y-auto p-2 lg:p-4">
      {/* Payment success handled globally */}
      <PaymentSuccessModal />

      {/* MAP */}
      <MapView
        selectedField={selectedField}
        setSelectedField={handleFieldSelection}
        selectedFieldsDetials={
          selectedFieldDetails ? [selectedFieldDetails] : []
        }
        fields={fields}
        showFieldDropdown
      />

      {/* MAIN CONTENT */}
      {showContent && (
        <div className="mt-6 space-y-8">
          {selectedFieldDetails && (
            <CropHealth
              selectedFieldDetails={selectedFieldDetails}
              hasCropHealthAndYield={hasFeature("soilAnalysisAndHealth")}
            />
          )}

          <ForeCast selectedFieldDetails={selectedFieldDetails} />

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
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
            hasEvapotranspiration={hasFeature("evapotranspirationMonitoring")}
          />

          <Insights
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
            hasAgronomicInsights={hasFeature("agronomicInsights")}
          />

          <PlantGrowthActivity
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
            hasCropGrowthMonitoring={hasFeature("cropGrowthMonitoring")}
          />
        </div>
      )}

      {/* FIRST-TIME USER OVERLAY */}
      <AnimatePresence>
        {fields.length === 0 && !isLoadingFields && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          >
            <button
              onClick={() => navigate("/addfield")}
              className="px-6 py-4 bg-green-600 rounded-xl text-white flex items-center gap-2"
            >
              <PlusIcon />
              Add Your First Field
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(Dashboard);
