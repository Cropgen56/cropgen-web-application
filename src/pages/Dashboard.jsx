import React from "react";

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
import { usePollSmartAdvisory } from "../hooks/usePollSmartAdvisory";

import "../styles/dashboard.css";

const Dashboard = () => {
  const { fields, isLoadingFields } = useFarmFields();
  const { selectedField, selectedFieldDetails, handleFieldSelection } =
    useSelectedField(fields);

  const { aoiId } = useAoiManagement(selectedFieldDetails);
  const { forecast, units } = useWeatherForecast(aoiId);
  const { isGenerating } = usePollSmartAdvisory(selectedFieldDetails);

  const showContent = fields.length > 0 && !isLoadingFields;

  return (
    <div className="dashboard min-h-screen w-full overflow-y-auto p-2 lg:p-4">
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
              selectedFieldDetails={selectedFieldDetails}
              aoiId={aoiId}
              isGenerating={isGenerating}
            />
          )}

          <ForeCast selectedFieldDetails={selectedFieldDetails} aoiId={aoiId} />

          <NdviGraph
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
          />

          <WaterIndex
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
          />

          <EvapotranspirationDashboard
            forecast={forecast}
            units={units}
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
          />

          <Insights
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
            isGenerating={isGenerating}
          />

          <PlantGrowthActivity
            selectedFieldsDetials={
              selectedFieldDetails ? [selectedFieldDetails] : []
            }
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(Dashboard);
