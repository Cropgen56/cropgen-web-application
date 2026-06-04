import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { motion, AnimatePresence } from "framer-motion";

import SoilReportSidebar from "../components/soilreport/soilreportsidebar/SoilReportSidebar";
import SmartFarmReport from "../components/soilreport/smartfarm/SmartFarmReport";
import { getFarmFields } from "../redux/slices/farmSlice";
import SimpleLoader from "../components/comman/loading/SimpleLoader";
import PremiumPageWrapper from "../components/subscription/PremiumPageWrapper";
import SubscriptionModal from "../components/subscription/SubscriptionModal";
import PricingOverlay from "../components/pricing/PricingOverlay";
import FieldDropdown from "../components/comman/FieldDropdown";
import { generateSoilReportAPI } from "../api/soilReportApi";

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
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  const reportRef = useRef(null);

  useEffect(() => {
    if (userId) dispatch(getFarmFields(userId));
  }, [dispatch, userId]);

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

  const handleGenerateReport = useCallback(
    async (field) => {
      if (!field) {
        message.warning("Please select a field first.");
        return;
      }

      const polygon = Array.isArray(field?.field)
        ? field.field.map((p) => [Number(p?.lng), Number(p?.lat)])
        : [];

      if (polygon.length < 3) {
        message.error("Field boundary is invalid. Please update field polygon.");
        return;
      }

      const first = polygon[0];
      const last = polygon[polygon.length - 1];

      if (first[0] !== last[0] || first[1] !== last[1]) {
        polygon.push([...first]);
      }

      const endDate = new Date().toISOString().slice(0, 10);

      const sowingDate =
        field?.sowingDate && !Number.isNaN(new Date(field.sowingDate).getTime())
          ? new Date(field.sowingDate)
          : null;

      const fallbackStart = new Date();
      fallbackStart.setMonth(fallbackStart.getMonth() - 18);

      const startDate = (sowingDate || fallbackStart)
        .toISOString()
        .slice(0, 10);

      const language =
        user?.language ||
        user?.preferredLanguage ||
        user?.userProfile?.language ||
        "en";

      const organizationCode = user?.organizationCode || "BIODROPS";

      setSelectedField(field);
      setSelectedOperation(field);
      setReportData(null);
      setIsGeneratingReport(true);

      try {
        const soilApi = await generateSoilReportAPI({
          geometry: {
            type: "Polygon",
            coordinates: [polygon],
          },
          startDate,
          endDate,
          currentCrop: field?.cropName || "default",
          previousCrop: field?.previousCrop || "default",
          organizationCode,
          language,
        });

        if (!soilApi?.success || !soilApi?.data) {
          throw new Error(
            soilApi?.message || "Soil report API returned empty response."
          );
        }

        setReportData({
          field,
          generatedAt: new Date().toISOString(),
          soilReport: soilApi.data,
        });

        message.success("Soil report generated successfully.");
      } catch (err) {
        console.error("Soil report API failed:", err);

        const apiMsg =
          err?.code === "ECONNABORTED"
            ? "Soil report is taking longer than expected. Please retry in a moment."
            : err?.response?.data?.message ||
              err?.message ||
              "Could not generate soil report. Please retry.";

        setReportData(null);
        message.error(apiMsg);
      } finally {
        setIsGeneratingReport(false);
      }
    },
    [user]
  );

  const downloadPDF = useCallback(async () => {
    const hasSoilReportPermission =
      selectedField?.subscription?.hasActiveSubscription &&
      selectedField?.subscription?.plan?.features?.soilReportGeneration;

    if (!hasSoilReportPermission) {
      message.warning("Please subscribe to download soil reports");
      handleSubscribe();
      return;
    }

    const reportEl = reportRef.current;

    if (!reportEl) {
      message.error("Please generate the report first.");
      return;
    }

    setIsDownloading(true);

    let cloneWrapper = null;

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      cloneWrapper = document.createElement("div");
      cloneWrapper.style.position = "absolute";
      cloneWrapper.style.left = "-10000px";
      cloneWrapper.style.top = "0";
      cloneWrapper.style.width = "794px";
      cloneWrapper.style.background = "#ffffff";
      cloneWrapper.style.zIndex = "-1";

      const clonedReport = reportEl.cloneNode(true);

      clonedReport.style.width = "794px";
      clonedReport.style.maxWidth = "794px";
      clonedReport.style.background = "#ffffff";
      clonedReport.style.padding = "16px";
      clonedReport.style.margin = "0";
      clonedReport.style.boxShadow = "none";

      clonedReport.querySelectorAll(".pdf-hide").forEach((el) => {
        el.remove();
      });

      cloneWrapper.appendChild(clonedReport);
      document.body.appendChild(cloneWrapper);

      await document.fonts?.ready;
      await new Promise((resolve) => setTimeout(resolve, 500));

      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 8;
      const usableWidth = pageWidth - margin * 2;

      let y = margin;
      let hasAddedContent = false;

      const addElementToPdf = async (element) => {
        if (!element) return;

        const rect = element.getBoundingClientRect();

        if (!rect.width || !rect.height) return;

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          scrollX: 0,
          scrollY: 0,
          width: Math.ceil(rect.width),
          height: Math.ceil(rect.height),
          windowWidth: 794,
          windowHeight: Math.ceil(rect.height),
        });

        if (!canvas.width || !canvas.height) return;

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const imgHeight = (canvas.height * usableWidth) / canvas.width;

        if (!Number.isFinite(imgHeight) || imgHeight <= 0) return;

        if (hasAddedContent && y + imgHeight > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }

        pdf.addImage(imgData, "JPEG", margin, y, usableWidth, imgHeight);

        y += imgHeight + 4;
        hasAddedContent = true;
      };

      const header = clonedReport.firstElementChild;
      const sections = Array.from(clonedReport.querySelectorAll(".soil-section"));

      await addElementToPdf(header);

      for (const section of sections) {
        await addElementToPdf(section);
      }

      if (!hasAddedContent) {
        throw new Error("Report content could not be captured.");
      }

      pdf.save("soil-health-report.pdf");
    } catch (err) {
      console.error("PDF generation failed:", err);
      message.error(err?.message || "Could not generate PDF.");
    } finally {
      if (cloneWrapper) cloneWrapper.remove();
      setIsDownloading(false);
    }
  }, [selectedField, handleSubscribe]);

  const hasSubscription = useMemo(
    () =>
      Boolean(
        selectedField?.subscription?.hasActiveSubscription &&
          selectedField?.subscription?.plan?.features?.soilReportGeneration
      ),
    [selectedField]
  );

  const reportReady = Boolean(reportData?.soilReport);

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

      <div className="h-screen w-full bg-[#f3f6f4] flex overflow-hidden">
        <div className="hidden lg:flex w-full h-full">
          <SoilReportSidebar
            selectedOperation={selectedOperation}
            setSelectedOperation={setSelectedOperation}
            setSelectedField={handleFieldChange}
            onGenerateReport={handleGenerateReport}
            downloadPDF={downloadPDF}
            reportReady={reportReady}
            isGeneratingReport={isGeneratingReport}
          />

          <div className="flex-1 h-screen overflow-y-auto bg-[#f3f6f4]">
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
                onGenerateReport={handleGenerateReport}
                isGeneratingReport={isGeneratingReport}
              />
            </PremiumPageWrapper>
          </div>
        </div>

        <div className="lg:hidden flex-1 flex flex-col h-screen overflow-hidden">
          <div className="p-3 border-b border-gray-200 bg-white flex flex-wrap gap-2 items-center shadow-sm">
            <FieldDropdown
              fields={fields}
              selectedField={selectedField}
              setSelectedField={handleFieldChange}
            />
          </div>

          <div className="flex-1 overflow-y-auto bg-[#f3f6f4]">
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
                onGenerateReport={handleGenerateReport}
                isGeneratingReport={isGeneratingReport}
              />
            </PremiumPageWrapper>
          </div>
        </div>
      </div>
    </>
  );
};

export default SoilReport;