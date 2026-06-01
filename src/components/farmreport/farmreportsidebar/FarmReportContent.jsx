import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

import FarmReportMap from "./FarmReportMap";
import CropHealth from "../../dashboard/crophealth/CropHealthCard";
import CropAdvisory from "../../dashboard/CropAdvisory";
import ForeCast from "../../dashboard/forecast/ForeCast";
import PlantGrowthActivity from "../../dashboard/PlantGrowthActivity";
import Insights from "../../dashboard/insights/Insights";
import NdviGraph from "../../dashboard/satellite-index/VegetationIndex";
import WaterIndex from "../../dashboard/satellite-index/WaterIndex";
import EvapotranspirationChart from "../../dashboard/satellite-index/ETChart";

import { useAoiManagement } from "../../dashboard/hooks/useAoiManagement";
import { fetchSmartAdvisory } from "../../../redux/slices/smartAdvisorySlice";

/**
 * One block = one PDF page after the cover (see useFarmReportPDF).
 * Order: satellite → health/yield → advisory+soil → forecast → NDVI+water → ET → insights → growth.
 */
const Section = ({ title, children, className = "" }) => (
  <div
    className={`farm-section bg-gradient-to-br from-[#344e41]/50 to-[#2b4035]/50 border border-white/15 rounded-xl shadow-lg mb-6 overflow-hidden backdrop-blur-sm ${className}`}
    data-section-title={title}
  >
    <div className="bg-gradient-to-r from-[#344e41] to-[#5a7c6b] px-4 py-3 border-b border-white/15">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <span className="w-1 h-6 bg-ember-accent rounded-full"></span>
        {title}
      </h2>
    </div>
    <div className="overflow-hidden">
      {children}
    </div>
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

  const noopSubscribe = () => {};

  if (!selectedFieldDetails) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-400 text-lg">No field selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 pt-2">
      {/* Page 2 — Satellite maps only */}
      <Section 
        title="Satellite Imagery & Crop Health Maps"
        className="lg:col-span-full"
      >
        <div className="p-4 bg-black/20">
          <FarmReportMap
            key={selectedFieldDetails?._id}
            selectedFieldsDetials={[selectedFieldDetails]}
            ref={mapRef}
            hidePolygonForPDF={isPreparedForPDF}
          />
        </div>
      </Section>

      {/* Page 3 — Crop health & yield only */}
      <Section 
        title="Crop Health & Yield Analytics"
        className="lg:col-span-full"
      >
        <div className="p-4 bg-black/20">
          <CropHealth
            selectedFieldDetails={selectedFieldDetails}
            bypassPremium
            isPreparedForPDF={isPreparedForPDF}
            aoiId={aoiId}
            pdfSection="healthYield"
          />
        </div>
      </Section>

      {/* Page 4 — Weekly advisory + soil analytics */}
      <Section 
        title="Crop Advisory & Soil Analytics"
        className="lg:col-span-full"
      >
        <div className="p-4 bg-black/20 space-y-6">
          <div className="border-b border-white/15 pb-6">
            <h3 className="text-base font-semibold text-ember-accent mb-4">
              Weekly Crop Advisory
            </h3>
            <CropAdvisory
              onSubscribe={noopSubscribe}
              hasWeeklyAdvisoryReports
            />
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-ember-accent mb-4">
              Soil Analytics
            </h3>
            <CropHealth
              selectedFieldDetails={selectedFieldDetails}
              bypassPremium
              isPreparedForPDF={isPreparedForPDF}
              aoiId={aoiId}
              pdfSection="soilOnly"
            />
          </div>
        </div>
      </Section>

      {/* Page 5 — Forecast */}
      <Section 
        title="Weather Forecast & Climate Data"
        className="lg:col-span-full"
      >
        <div className="p-4 bg-black/20">
          <ForeCast
            selectedFieldDetails={selectedFieldDetails}
            bypassPremium
            isPreparedForPDF={isPreparedForPDF}
            aoiId={aoiId}
          />
        </div>
      </Section>

      {/* Page 6 — Vegetation + water time series */}
      <Section 
        title="Vegetation & Water Index Time Series"
        className="lg:col-span-full"
      >
        <div className="space-y-6 p-4 bg-black/20">
          <div className="border-b border-white/15 pb-6">
            <h3 className="text-base font-semibold text-ember-accent mb-4">
              NDVI - Vegetation Index
            </h3>
            <NdviGraph
              selectedFieldsDetials={[selectedFieldDetails]}
              bypassPremium
              isPreparedForPDF={isPreparedForPDF}
            />
          </div>

          <div>
            <h3 className="text-base font-semibold text-ember-accent mb-4">
              NDMI - Water Index
            </h3>
            <WaterIndex
              selectedFieldsDetials={[selectedFieldDetails]}
              bypassPremium
              isPreparedForPDF={isPreparedForPDF}
            />
          </div>
        </div>
      </Section>

      {/* Page 7 — Evapotranspiration */}
      <Section 
        title="Evapotranspiration (ET) Analysis"
        className="lg:col-span-full"
      >
        <div className="p-4 bg-black/20">
          <EvapotranspirationChart
            selectedFieldsDetials={[selectedFieldDetails]}
            bypassPremium
            isPreparedForPDF={isPreparedForPDF}
            aoiId={aoiId}
          />
        </div>
      </Section>

      {/* Page 8 — Agronomic insights */}
      <Section 
        title="Agronomic Insights & Recommendations"
        className="lg:col-span-full"
      >
        <div className="p-4 bg-black/20">
          <Insights
            selectedFieldsDetials={[selectedFieldDetails]}
            bypassPremium
            isPreparedForPDF={isPreparedForPDF}
          />
        </div>
      </Section>

      {/* Page 9 — Plant growth */}
      <Section 
        title="Plant Growth Activity & Phenology"
        className="lg:col-span-full"
      >
        <div className="p-4 bg-black/20">
          <PlantGrowthActivity
            selectedFieldsDetials={[selectedFieldDetails]}
            bypassPremium
            isPreparedForPDF={isPreparedForPDF}
          />
        </div>
      </Section>
    </div>
  );
};

export default FarmReportContent;