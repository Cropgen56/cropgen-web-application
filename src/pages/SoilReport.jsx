import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { FileText } from "lucide-react";

import SoilReportSidebar from "../components/soilreport/soilreportsidebar/SoilReportSidebar";
import SmartFarmReport from "../components/soilreport/smartfarm/SmartFarmReport";
import { getFarmFields } from "../redux/slices/farmSlice";
import SimpleLoader from "../components/comman/loading/SimpleLoader";

import PremiumPageWrapper from "../components/subscription/PremiumPageWrapper";
import SubscriptionModal from "../components/subscription/SubscriptionModal";
import PricingOverlay from "../components/pricing/PricingOverlay";
import FieldDropdown from "../components/comman/FieldDropdown";

const SoilReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state?.auth?.user);
  const rawFields = useSelector((state) => state?.farmfield?.fields);
  const fields = useMemo(() => rawFields || [], [rawFields]);

  const userId = user?.id;

  const [selectedField, setSelectedField] = useState(null);
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  const reportRef = useRef(null);

  useEffect(() => {
    if (userId) dispatch(getFarmFields(userId));
  }, [dispatch, userId]);

  // #region agent log
  useEffect(() => {
    fetch("http://127.0.0.1:7904/ingest/32eac84f-dd56-4cc2-9343-d9dd7fb0d851", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "011770",
      },
      body: JSON.stringify({
        sessionId: "011770",
        runId: "run1",
        hypothesisId: "A",
        location: "SoilReport.jsx:getFarmFields-effect",
        message: "userId and fields fetch trigger",
        data: {
          hasUserId: Boolean(userId),
          fieldsLen: fields.length,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }, [userId, fields.length]);
  // #endregion

  useEffect(() => {
    if (fields?.length > 0 && !selectedField) {
      const lastField = fields[fields.length - 1];
      setSelectedField(lastField);
      setSelectedOperation(lastField);
    }
  }, [fields, selectedField]);

  useEffect(() => {
    setReportData(null);
  }, [selectedField?._id]);

  const handleFieldChange = useCallback((field) => {
    setSelectedField(field);
    setSelectedOperation(field);
    setReportData(null);
  }, []);

  const handleSubscribe = useCallback(() => {
    if (!selectedField) {
      message.warning("Please select a field first");
      return;
    }

    const areaInHectares =
      selectedField?.areaInHectares || selectedField?.acre * 0.404686 || 5;

    const fieldData = {
      id: selectedField._id,
      name: selectedField.fieldName || selectedField.farmName,
      areaInHectares,
      cropName: selectedField.cropName,
    };

    setPricingFieldData(fieldData);
    setShowPricingOverlay(true);
    setShowMembershipModal(false);
  }, [selectedField]);

  const handleSkipMembership = useCallback(() => {
    setShowMembershipModal(false);
    message.info("You can activate premium anytime from the locked features");
  }, []);

  const handleCloseMembershipModal = useCallback(() => {
    setShowMembershipModal(false);
  }, []);

  const handleClosePricing = useCallback(() => {
    setShowPricingOverlay(false);
    setPricingFieldData(null);
  }, []);

  const handleGenerateReport = useCallback((field) => {
    if (!field) return;
    // #region agent log
    fetch("http://127.0.0.1:7904/ingest/32eac84f-dd56-4cc2-9343-d9dd7fb0d851", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "011770",
      },
      body: JSON.stringify({
        sessionId: "011770",
        runId: "run1",
        hypothesisId: "E",
        location: "SoilReport.jsx:handleGenerateReport",
        message: "generate report invoked",
        data: { fieldId: field?._id ?? null },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    setSelectedField(field);
    setSelectedOperation(field);
    setReportData({
      field,
      generatedAt: new Date().toISOString(),
    });
  }, []);

  const downloadPDF = useCallback(async () => {
    const hasSoilReportPermission =
      selectedField?.subscription?.hasActiveSubscription &&
      selectedField?.subscription?.plan?.features?.soilReportGeneration;

    if (!hasSoilReportPermission) {
      message.warning("Please subscribe to download soil reports");
      handleSubscribe();
      return;
    }

    const el = reportRef.current;
    if (!el) {
      message.error("Report is not ready to export yet.");
      return;
    }

    setIsDownloading(true);

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      el.classList.add("pdf-style");
      await new Promise((res) => setTimeout(res, 200));

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save("cropgen-smart-farm-intelligence.pdf");
    } catch (err) {
      console.error(err);
      message.error("Could not generate PDF. Please try again.");
    } finally {
      reportRef.current?.classList.remove("pdf-style");
      setIsDownloading(false);
    }
  }, [selectedField, handleSubscribe]);

  const hasSubscription = useMemo(
    () =>
      Boolean(
        selectedField?.subscription?.hasActiveSubscription &&
          selectedField?.subscription?.plan?.features?.soilReportGeneration,
      ),
    [selectedField],
  );

  // #region agent log
  useEffect(() => {
    fetch("http://127.0.0.1:7904/ingest/32eac84f-dd56-4cc2-9343-d9dd7fb0d851", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "011770",
      },
      body: JSON.stringify({
        sessionId: "011770",
        runId: "run1",
        hypothesisId: "B-C-E",
        location: "SoilReport.jsx:subscription-selection",
        message: "selection and premium gate",
        data: {
          fieldsLen: fields.length,
          selectedId: selectedField?._id ?? null,
          operationId: selectedOperation?._id ?? null,
          idsMatch:
            (selectedField?._id ?? "") === (selectedOperation?._id ?? ""),
          hasSubscription,
          reportReady: Boolean(reportData),
          soilReportFeature: Boolean(
            selectedField?.subscription?.plan?.features?.soilReportGeneration,
          ),
          hasActiveSub: Boolean(
            selectedField?.subscription?.hasActiveSubscription,
          ),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }, [
    fields.length,
    selectedField?._id,
    selectedOperation?._id,
    hasSubscription,
    reportData,
  ]);
  // #endregion

  // #region agent log
  useEffect(() => {
    if (fields.length !== 0) return;
    fetch("http://127.0.0.1:7904/ingest/32eac84f-dd56-4cc2-9343-d9dd7fb0d851", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "011770",
      },
      body: JSON.stringify({
        sessionId: "011770",
        runId: "run1",
        hypothesisId: "A",
        location: "SoilReport.jsx:empty-fields",
        message: "empty fields — add farm screen",
        data: { hasUserId: Boolean(userId) },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }, [fields.length, userId]);
  // #endregion

  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-ember-surface text-center px-4">
        <SimpleLoader
          size="lg"
          variant="brandMark"
          className="mb-8 h-44 w-44 sm:h-52 sm:w-52"
        />
        <h2 className="text-2xl font-semibold text-white">
          Add Farm to See the Soil Report
        </h2>
        <button
          type="button"
          onClick={() => navigate("/addfield")}
          className="mt-6 px-5 py-2 rounded-lg bg-white text-ember-surface font-medium hover:bg-gray-200 transition"
        >
          Add Field
        </button>
      </div>
    );
  }

  return (
    <>
      <SubscriptionModal
        isOpen={showMembershipModal}
        onClose={handleCloseMembershipModal}
        onSubscribe={handleSubscribe}
        onSkip={handleSkipMembership}
        fieldName={selectedField?.fieldName || selectedField?.farmName}
      />

      <AnimatePresence>
        {showPricingOverlay && pricingFieldData && (
          <motion.div
            key="pricing-overlay"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-8"
          >
            <PricingOverlay
              onClose={handleClosePricing}
              selectedField={pricingFieldData}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-screen w-full bg-[#344e41] flex overflow-hidden">
        <div className="hidden lg:flex w-full h-full">
          <SoilReportSidebar
            selectedOperation={selectedOperation}
            setSelectedOperation={setSelectedOperation}
            setSelectedField={setSelectedField}
            onGenerateReport={handleGenerateReport}
            downloadPDF={downloadPDF}
            reportReady={!!reportData}
          />

          <div className="flex-1 h-screen overflow-y-auto bg-[#344e41]">
            <PremiumPageWrapper
              isLocked={!hasSubscription}
              onSubscribe={handleSubscribe}
              title="Smart Farm Intelligence"
            >
              <SmartFarmReport
                reportData={reportData}
                selectedField={selectedField}
                user={user}
                reportRef={reportRef}
                onDownloadPdf={downloadPDF}
                isDownloading={isDownloading}
              />
            </PremiumPageWrapper>
          </div>
        </div>

        <div className="lg:hidden flex-1 flex flex-col h-screen overflow-hidden">
          <div className="p-3 border-b border-[#5a7c6b] bg-[#344e41] flex flex-wrap gap-2 items-center shadow-sm">
            <FieldDropdown
              fields={fields}
              selectedField={selectedField}
              setSelectedField={handleFieldChange}
            />
            {selectedField && (
              <button
                type="button"
                onClick={() => handleGenerateReport(selectedField)}
                className="inline-flex items-center gap-2 rounded-[12px] px-4 py-2 text-sm font-semibold text-white shadow-md"
                style={{ backgroundColor: "#0D6B45" }}
              >
                <FileText className="w-4 h-4" />
                Generate Report
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto bg-[#344e41]">
            <PremiumPageWrapper
              isLocked={!hasSubscription}
              onSubscribe={handleSubscribe}
              title="Smart Farm Intelligence"
            >
              <SmartFarmReport
                reportData={reportData}
                selectedField={selectedField}
                user={user}
                reportRef={reportRef}
                onDownloadPdf={downloadPDF}
                isDownloading={isDownloading}
              />
            </PremiumPageWrapper>
          </div>
        </div>
      </div>
    </>
  );
};

export default SoilReport;
