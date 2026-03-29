import React, { useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";

import MapView from "../components/dashboard/mapview/MapView";
import CropHealth from "../components/dashboard/crophealth/CropHealthCard";
import ForeCast from "../components/dashboard/forecast/ForeCast";
import NdviGraph from "../components/dashboard/satellite-index/VegetationIndex";
import WaterIndex from "../components/dashboard/satellite-index/WaterIndex";
import EvapotranspirationDashboard from "../components/dashboard/satellite-index/ETChart";
import Insights from "../components/dashboard/insights/Insights";
import PlantGrowthActivity from "../components/dashboard/PlantGrowthActivity";

import { useFarmFields } from "../components/dashboard/hooks/useFarmFields";
import { useSelectedField } from "../components/dashboard/hooks/useSelectedField";
import { useAoiManagement } from "../components/dashboard/hooks/useAoiManagement";
import { useWeatherForecast } from "../components/dashboard/hooks/useWeatherForecast";

import { fetchSmartAdvisory } from "../redux/slices/smartAdvisorySlice";

import "../styles/dashboard.css";

const Dashboard = () => {
  const dispatch = useDispatch();

  /* ================= DATA ================= */
  const { fields, isLoadingFields } = useFarmFields();
  const { selectedField, selectedFieldDetails, handleFieldSelection } =
    useSelectedField(fields);

  const { aoiId } = useAoiManagement(selectedFieldDetails);
  const { forecast, units } = useWeatherForecast(aoiId);

  /* ================= ADVISORY (refetch when field or subscription access changes) ================= */
  const lastAdvisoryKeyRef = useRef(null);

  useEffect(() => {
    const fieldId = selectedFieldDetails?._id;
    if (!fieldId) return;

    const subActive =
      selectedFieldDetails?.subscription?.hasActiveSubscription === true;
    const key = `${fieldId}:${subActive}`;
    if (lastAdvisoryKeyRef.current === key) return;
    lastAdvisoryKeyRef.current = key;

    dispatch(fetchSmartAdvisory({ fieldId }));
  }, [
    dispatch,
    selectedFieldDetails?._id,
    selectedFieldDetails?.subscription?.hasActiveSubscription,
  ]);

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
              aoiId={aoiId}
            />
          )}

          <ForeCast selectedFieldDetails={selectedFieldDetails} aoiId={aoiId} />

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
    </div>
  );
};

export default React.memo(Dashboard);
