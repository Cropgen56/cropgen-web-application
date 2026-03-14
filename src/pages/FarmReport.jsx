import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import FarmReportSidebar from "../components/farmreport/farmreportsidebar/FarmReportSidebar";
import FarmReportContent from "../components/farmreport/farmreportsidebar/FarmReportContent";
import FieldDropdown from "../components/comman/FieldDropdown";
import LoadingSpinner from "../components/comman/loading/LoadingSpinner";

import FeatureGuard from "../components/subscription/FeatureGuardComponent";
import { useSubscriptionGuard } from "../components/subscription/hooks/useSubscriptionGuard";

import { getFarmFields } from "../redux/slices/farmSlice";
import { clearIndexDataByType } from "../redux/slices/satelliteSlice";
import { fetchSmartAdvisory } from "../redux/slices/smartAdvisorySlice";

import useFarmReportPDF from "../components/farmreport/useFarmReportPDF";
import { useAoiManagement } from "../components/dashboard/hooks/useAoiManagement";
import { useWeatherForecast } from "../components/dashboard/hooks/useWeatherForecast";

import img1 from "../assets/image/Group 31.png";

const FarmReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((s) => s.auth?.user);
  const fields = useSelector((s) => s.farmfield?.fields || []);
  const fieldsLoading = useSelector((s) => s.farmfield?.loading);

  const { advisory, loading: advisoryLoading } = useSelector(
    (state) => state.smartAdvisory,
  );

  const [selectedField, setSelectedField] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const mainReportRef = useRef(null);
  const lastFetchedFieldIdRef = useRef(null);

  /* Fetch Fields */
  useEffect(() => {
    if (user?.id) dispatch(getFarmFields(user.id));
  }, [dispatch, user?.id]);

  /* Auto Select Field */
  useEffect(() => {
    if (!selectedField && fields.length > 0) {
      setSelectedField(fields[fields.length - 1]);
    }
  }, [fields, selectedField]);

  /* Clear Old Satellite Data */
  useEffect(() => {
    if (selectedField?._id) {
      dispatch(clearIndexDataByType());
    }
  }, [dispatch, selectedField?._id]);

  /* Fetch Advisory */
  useEffect(() => {
    const fieldId = selectedField?._id;

    if (!fieldId) return;

    if (lastFetchedFieldIdRef.current === fieldId) return;

    lastFetchedFieldIdRef.current = fieldId;

    dispatch(fetchSmartAdvisory({ fieldId }));
  }, [dispatch, selectedField?._id]);

  /* AOI + Weather */
  const { aoiId } = useAoiManagement(selectedField);
  const { forecast, units } = useWeatherForecast(aoiId);

  /* PDF Hook */
  const { isDownloading, isPreparedForPDF, downloadFarmReportPDF } =
    useFarmReportPDF(selectedField);

  /* Feature Guard */
  const farmReportGuard = useSubscriptionGuard({
    field: selectedField,
    featureKey: "cropHealthAndYield",
  });

  if (fieldsLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#344E41]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!fields.length) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#344E41] text-white">
        <img src={img1} alt="" className="w-[280px] mb-6 opacity-60" />
        <button
          onClick={() => navigate("/addfield")}
          className="px-6 py-3 bg-white text-[#344E41] rounded-lg"
        >
          Add Field
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#344E41] text-white">
      {isSidebarVisible && (
        <div className="hidden lg:flex">
          <FarmReportSidebar
            setSelectedField={setSelectedField}
            setIsSidebarVisible={setIsSidebarVisible}
          />
        </div>
      )}

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-3 flex justify-between bg-[#2d4339] p-2 rounded">
          <FieldDropdown
            fields={fields}
            selectedField={selectedField}
            setSelectedField={setSelectedField}
          />

          <button
            onClick={() => downloadFarmReportPDF(mainReportRef)}
            className="bg-[#0C2214] text-white px-4 py-1 rounded"
          >
            {isDownloading ? "Generating..." : "PDF"}
          </button>
        </div>

        <FeatureGuard guard={farmReportGuard} title="Farm Report">
          <div ref={mainReportRef}>
            <FarmReportContent
              selectedFieldDetails={selectedField}
              forecast={forecast}
              units={units}
              isPreparedForPDF={isPreparedForPDF}
              advisory={advisory}
              advisoryLoading={advisoryLoading}
            />
          </div>
        </FeatureGuard>
      </div>
    </div>
  );
};

export default FarmReport;
