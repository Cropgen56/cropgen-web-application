import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Offcanvas from "react-bootstrap/Offcanvas";
import { Progress } from "antd";

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

import SimpleLoader from "../components/comman/loading/SimpleLoader";

const FarmReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((s) => s.auth?.user);
  const fields = useSelector((s) => s.farmfield?.fields || []);
  const fieldsLoading = useSelector((s) => s.farmfield?.loading);

  const [selectedField, setSelectedField] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const mainReportRef = useRef(null);
  const mapRef = useRef(null);
  const lastFetchedFieldIdRef = useRef(null);

  useEffect(() => {
    if (user?.id) dispatch(getFarmFields(user.id));
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (!selectedField && fields.length > 0) {
      setSelectedField(fields[fields.length - 1]);
    }
  }, [fields, selectedField]);

  useEffect(() => {
    if (selectedField?._id) {
      dispatch(clearIndexDataByType());
    }
  }, [dispatch, selectedField?._id]);

  useEffect(() => {
    const fieldId = selectedField?._id;

    if (!fieldId) return;

    if (lastFetchedFieldIdRef.current === fieldId) return;

    lastFetchedFieldIdRef.current = fieldId;

    dispatch(fetchSmartAdvisory({ fieldId }));
  }, [dispatch, selectedField?._id]);

  const { aoiId } = useAoiManagement(selectedField);
  useWeatherForecast(aoiId);

  const { isDownloading, downloadProgress, isPreparedForPDF, downloadFarmReportPDF } =
    useFarmReportPDF(selectedField, aoiId);

  const farmReportGuard = useSubscriptionGuard({
    field: selectedField,
    featureKey: "cropHealthAndYield",
  });

  const handleDownloadPDF = () => {
    if (isDownloading) return;
    downloadFarmReportPDF(mainReportRef, () => {
      setIsSidebarVisible(false);
      setShowMobileSidebar(false);
    });
  };

  if (fieldsLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#344e41]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!fields.length) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-screen bg-gradient-to-b from-[#344e41] to-[#2b4035] text-center px-4 py-8">
        <SimpleLoader
          size="lg"
          variant="brandMark"
          className="mb-8 h-44 w-44 sm:h-52 sm:w-52"
        />
        <h2 className="text-2xl font-semibold text-white mt-6">
          Add Farm to See the Farm Report
        </h2>
        <p className="text-white/80 mt-2 max-w-md">
          Create your first field to access comprehensive farm analysis, satellite imagery, 
          and AI-powered insights.
        </p>
        <button
          onClick={() => navigate("/addfield")}
          className="mt-8 px-6 py-3 rounded-lg bg-ember-primary hover:bg-ember-primary-hover text-white font-semibold transition-colors shadow-lg"
        >
          Add Field Now
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row min-h-screen h-[100dvh] bg-gradient-to-br from-[#344e41] via-[#2d4339] to-[#344e41] text-white overflow-hidden">
      {isSidebarVisible && (
        <div className="hidden lg:flex flex-shrink-0 border-r border-white/15">
          <FarmReportSidebar
            setSelectedField={setSelectedField}
            setIsSidebarVisible={setIsSidebarVisible}
          />
        </div>
      )}

      <Offcanvas
        show={showMobileSidebar}
        onHide={() => setShowMobileSidebar(false)}
        placement="start"
        className="lg:hidden"
        style={{ maxWidth: "85vw" }}
      >
        <Offcanvas.Header closeButton className="bg-[#344e41]">
          <Offcanvas.Title className="text-white font-bold">Farm List</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0 bg-[#344e41]">
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
        {/* Header/Toolbar */}
        <div className="flex-shrink-0 sticky top-0 z-40 flex flex-wrap items-center gap-2 sm:gap-3 bg-gradient-to-r from-[#344e41] to-[#2d4339] border-b border-white/15 p-2 sm:p-4 shadow-lg">
          {!isSidebarVisible && (
            <button
              type="button"
              onClick={() => setIsSidebarVisible(true)}
              className="hidden lg:flex touch-target min-w-[44px] h-[44px] items-center justify-center rounded-lg bg-[#5a7c6b] text-white hover:bg-ember-primary-hover transition-colors"
              aria-label="Open sidebar"
              title="Open Farm List"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowMobileSidebar(true)}
            className="lg:hidden touch-target min-w-[44px] h-[44px] flex items-center justify-center rounded-lg bg-[#5a7c6b] text-white hover:bg-ember-primary-hover transition-colors"
            aria-label="Open farm list"
            title="Open Farm List"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
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
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="touch-target min-h-[44px] px-4 py-2 bg-ember-primary hover:bg-ember-primary disabled:bg-ember-primary disabled:opacity-60 text-white rounded-lg font-semibold shrink-0 transition-colors flex items-center gap-2 shadow-lg"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {isDownloading ? `Generating...` : "Download PDF"}
          </button>
        </div>

        {/* Progress Bar */}
        {isDownloading && (
          <div className="flex-shrink-0 bg-black/20 border-b border-white/15 px-4 py-3">
            <div className="flex items-center gap-3">
              <Progress
                type="circle"
                percent={Math.round(downloadProgress)}
                width={40}
                strokeColor="#3da660"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-white/80">
                  Preparing PDF Report
                </p>
                <p className="text-xs text-white/60">
                  {Math.round(downloadProgress)}% - {
                    downloadProgress < 10 ? "Initializing..." :
                    downloadProgress < 30 ? "Capturing sections..." :
                    downloadProgress < 70 ? "Rendering images..." :
                    downloadProgress < 90 ? "Building PDF..." :
                    "Finalizing..."
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <FeatureGuard guard={farmReportGuard} title="Farm Report">
          <div
            ref={mainReportRef}
            className={`flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 ${
              isPreparedForPDF ? "pdf-capture-mode" : ""
            }`}
          >
            <FarmReportContent
              selectedFieldDetails={selectedField}
              mapRef={mapRef}
              aoiId={aoiId}
              isPreparedForPDF={isPreparedForPDF}
            />
          </div>
        </FeatureGuard>
      </div>
    </div>
  );
};

export default FarmReport;