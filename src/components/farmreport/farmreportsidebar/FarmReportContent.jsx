import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

import FarmReportMap from "./FarmReportMap";
import CropHealth from "../../dashboard/crophealth/CropHealthCard";
import ForeCast from "../../dashboard/forecast/ForeCast";
import PlantGrowthActivity from "../../dashboard/PlantGrowthActivity";
import Insights from "../../dashboard/insights/Insights";
import NdviGraph from "../../dashboard/satellite-index/VegetationIndex";
import WaterIndex from "../../dashboard/satellite-index/WaterIndex";
import EvapotranspirationChart from "../../dashboard/satellite-index/ETChart";

import { useAoiManagement } from "../../dashboard/hooks/useAoiManagement";
import { fetchSmartAdvisory } from "../../../redux/slices/smartAdvisorySlice";

const FarmReportContent = ({
  selectedFieldDetails,
  mapRef,
  isPreparedForPDF,
}) => {
  const dispatch = useDispatch();

  /* ================= AOI ================= */

  useAoiManagement(selectedFieldDetails);

  /* ================= PREVENT DUPLICATE ADVISORY CALL ================= */

  const lastFetchedFieldIdRef = useRef(null);

  useEffect(() => {
    const fieldId = selectedFieldDetails?._id;
    if (!fieldId) return;

    if (lastFetchedFieldIdRef.current === fieldId) return;

    lastFetchedFieldIdRef.current = fieldId;

    dispatch(fetchSmartAdvisory({ fieldId }));
  }, [dispatch, selectedFieldDetails?._id]);

  return (
    <>
      {/* ================= SECTION 1 : MAP + CROP HEALTH ================= */}

      <div className="bg-[#2d4339] rounded-lg p-2 mb-2">
        <FarmReportMap
          key={selectedFieldDetails?._id}
          selectedFieldsDetials={[selectedFieldDetails]}
          ref={mapRef}
          hidePolygonForPDF={isPreparedForPDF}
        />

        <div className="mt-2">
          <CropHealth
            selectedFieldDetails={selectedFieldDetails}
            bypassPremium
          />
        </div>
      </div>

      {/* ================= SECTION 2 : WEATHER + INDICES ================= */}

      <div className="bg-[#2d4339] rounded-lg p-2 mb-2">
        <ForeCast selectedFieldDetails={selectedFieldDetails} bypassPremium />

        <div className="mt-2">
          <NdviGraph
            selectedFieldsDetials={[selectedFieldDetails]}
            bypassPremium
          />
        </div>

        <div className="mt-2">
          <WaterIndex
            selectedFieldsDetials={[selectedFieldDetails]}
            bypassPremium
          />
        </div>

        <div className="mt-2">
          <EvapotranspirationChart
            selectedFieldsDetials={[selectedFieldDetails]}
            bypassPremium
          />
        </div>
      </div>

      {/* ================= SECTION 3 : INSIGHTS ================= */}

      <div className="bg-[#2d4339] rounded-lg p-2">
        <Insights
          selectedFieldsDetials={[selectedFieldDetails]}
          bypassPremium
        />

        <div className="mt-2">
          <PlantGrowthActivity
            selectedFieldsDetials={[selectedFieldDetails]}
            bypassPremium
          />
        </div>
      </div>
    </>
  );
};

export default FarmReportContent;
