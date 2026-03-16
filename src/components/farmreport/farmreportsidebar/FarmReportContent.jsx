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

const Section = ({ title, children, newPage = false }) => (
  <div
    className={`farm-section bg-white rounded-xl shadow-sm mb-3 overflow-hidden${newPage ? " new-page-section" : ""}`}
    data-section-title={title}
    data-new-page={newPage ? "true" : undefined}
  >
    {children}
  </div>
);

const FarmReportContent = ({
  selectedFieldDetails,
  mapRef,
  isPreparedForPDF,
  aoiId = null,
}) => {
  const dispatch = useDispatch();

  useAoiManagement(selectedFieldDetails);

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
      {/* ── 1. Satellite Map ── */}
      <Section title="Satellite Imagery">
        <div className="p-2">
          <FarmReportMap
            key={selectedFieldDetails?._id}
            selectedFieldsDetials={[selectedFieldDetails]}
            ref={mapRef}
            hidePolygonForPDF={isPreparedForPDF}
          />
        </div>
      </Section>

      {/* ── 2. Crop Health & Yield ── */}
      <Section title="Crop Health & Yield">
        <CropHealth
          selectedFieldDetails={selectedFieldDetails}
          bypassPremium
          isPreparedForPDF={isPreparedForPDF}
          aoiId={aoiId}
        />
      </Section>

      {/* ── 3. Weather Forecast ── */}
      <Section title="Weather Forecast">
        <ForeCast
          selectedFieldDetails={selectedFieldDetails}
          bypassPremium
          isPreparedForPDF={isPreparedForPDF}
          aoiId={aoiId}
        />
      </Section>

      {/* ── 4. Vegetation Index (NDVI) ── */}
      <Section title="Vegetation Index (NDVI)">
        <NdviGraph
          selectedFieldsDetials={[selectedFieldDetails]}
          bypassPremium
          isPreparedForPDF={isPreparedForPDF}
        />
      </Section>

      {/* ── 5. Water Stress Index ── */}
      <Section title="Water Stress Index">
        <WaterIndex
          selectedFieldsDetials={[selectedFieldDetails]}
          bypassPremium
          isPreparedForPDF={isPreparedForPDF}
        />
      </Section>

      {/* ── 6. Evapotranspiration ── */}
      <Section title="Evapotranspiration (ET)">
        <EvapotranspirationChart
          selectedFieldsDetials={[selectedFieldDetails]}
          bypassPremium
          isPreparedForPDF={isPreparedForPDF}
          aoiId={aoiId}
        />
      </Section>

      {/* ── 7. Agronomic Insights ── */}
      <Section title="Agronomic Insights" newPage>
        <Insights
          selectedFieldsDetials={[selectedFieldDetails]}
          bypassPremium
          isPreparedForPDF={isPreparedForPDF}
        />
      </Section>

      {/* ── 8. Plant Growth Activity ── */}
      <Section title="Plant Growth Activity" newPage>
        <PlantGrowthActivity
          selectedFieldsDetials={[selectedFieldDetails]}
          bypassPremium
          isPreparedForPDF={isPreparedForPDF}
        />
      </Section>
    </>
  );
};

export default FarmReportContent;
