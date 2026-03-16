import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Offcanvas from "react-bootstrap/Offcanvas";

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
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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
    useFarmReportPDF(selectedField, aoiId);

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
    <div className="flex flex-col sm:flex-row min-h-screen h-[100dvh] bg-[#344E41] text-white overflow-hidden">
      {/* Desktop Sidebar */}
      {isSidebarVisible && (
        <div className="hidden lg:flex flex-shrink-0">
          <FarmReportSidebar
            setSelectedField={setSelectedField}
            setIsSidebarVisible={setIsSidebarVisible}
          />
        </div>
      )}

      {/* Mobile Sidebar Offcanvas */}
      <Offcanvas
        show={showMobileSidebar}
        onHide={() => setShowMobileSidebar(false)}
        placement="start"
        className="lg:hidden"
        style={{ maxWidth: "85vw" }}
      >
        <Offcanvas.Body className="p-0">
          <FarmReportSidebar
            setSelectedField={(field) => {
              setSelectedField(field);
              setShowMobileSidebar(false);
            }}
            setIsSidebarVisible={() => setShowMobileSidebar(false)}
          />
        </Offcanvas.Body>
      </Offcanvas>

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 mb-3 flex flex-wrap items-center gap-2 sm:gap-3 bg-[#2d4339] p-2 sm:p-3 rounded">
          <button
            type="button"
            onClick={() => setShowMobileSidebar(true)}
            className="lg:hidden touch-target min-w-[44px] flex items-center justify-center rounded bg-[#0C2214] text-white"
            aria-label="Open farm list"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <FieldDropdown
              fields={fields}
              selectedField={selectedField}
              setSelectedField={setSelectedField}
            />
          </div>
          <button
            onClick={() => downloadFarmReportPDF(mainReportRef)}
            className="touch-target min-h-[44px] bg-[#0C2214] text-white px-4 py-2 rounded font-medium shrink-0"
          >
            {isDownloading ? "Generating..." : "PDF"}
          </button>
        </div>

        <FeatureGuard guard={farmReportGuard} title="Farm Report">
          <div
            ref={mainReportRef}
            className={`flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 ${isPreparedForPDF ? "pdf-capture-mode" : ""}`}
          >
            <FarmReportContent
              selectedFieldDetails={selectedField}
              aoiId={aoiId}
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
