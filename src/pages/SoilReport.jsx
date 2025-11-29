import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { motion, AnimatePresence } from "framer-motion";

import SoilReportSidebar from "../components/soilreport/soilreportsidebar/SoilReportSidebar";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Report from "../components/soilreport/soilreportsidebar/Report";
import Reccomendations from "../components/soilreport/soilreportsidebar/Reccomendations";
import Soilwaterindex from "../components/soilreport/soilreportsidebar/Soilwaterindex";
import SOCreport from "../components/soilreport/soilreportsidebar/SOCreport";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { getFarmFields } from "../redux/slices/farmSlice";
import img1 from "../assets/image/Group 31.png";

import PremiumPageWrapper from "../components/subscription/PremiumPageWrapper";
import SubscriptionModal from "../components/subscription/SubscriptionModal";
import PricingOverlay from "../components/pricing/PricingOverlay";
import ComingSoonSection from "../components/comman/loading/ComingSoonSection ";

const SoilReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state?.auth?.user);
  const fields = useSelector((state) => state?.farmfield?.fields);

  const userId = user?.id;

  const [selectedField, setSelectedField] = useState(null);
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  const reportRef = useRef();
  const restRef = useRef();

  // Load farm fields
  useEffect(() => {
    if (userId) dispatch(getFarmFields(userId));
  }, [dispatch, userId]);

  // Auto-select last added field
  useEffect(() => {
    if (fields?.length > 0 && !selectedField) {
      setSelectedField(fields[fields.length - 1]);
    }
  }, [fields, selectedField]);

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

  const handleSkipMembership = () => {
    setShowMembershipModal(false);
    message.info("You can activate premium anytime from the locked features");
  };

  const handleCloseMembershipModal = () => {
    setShowMembershipModal(false);
  };

  const handleClosePricing = () => {
    setShowPricingOverlay(false);
    setPricingFieldData(null);
  };

  const downloadPDF = async () => {
    const hasSoilReportPermission =
      selectedField?.subscription?.hasActiveSubscription &&
      selectedField?.subscription?.plan?.features?.soilReportGeneration;

    if (!hasSoilReportPermission) {
      message.warning("Please subscribe to download soil reports");
      handleSubscribe();
      return;
    }

    const input1 = reportRef.current;
    const input2 = restRef.current;

    setIsDownloading(true);

    input1.classList.add("pdf-style");
    input2.classList.add("pdf-style");

    await new Promise((res) => setTimeout(res, 300));

    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();

    const capturePage = async (element, pageNumber) => {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const scaledHeight = height * 0.95;
      pdf.addImage(imgData, "PNG", 0, 0, width, scaledHeight);
      pdf.setTextColor(100);
      pdf.setFontSize(10);
      pdf.text(`Page ${pageNumber}`, width - 20, height - 10);
    };

    await capturePage(input1, 1);
    pdf.addPage();
    await capturePage(input2, 2);

    pdf.save("soil-report.pdf");

    input1.classList.remove("pdf-style");
    input2.classList.remove("pdf-style");
    setIsDownloading(false);
  };

  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-[#5a7c6b] text-center px-4">
        <img
          src={img1}
          alt="No Fields"
          className="w-[400px] h-[400px] mb-6 opacity-70"
        />
        <h2 className="text-2xl font-semibold text-white">
          Add Farm to See the Soil Report
        </h2>
        <button
          onClick={() => navigate("/addfield")}
          className="mt-6 px-5 py-2 rounded-lg bg-white text-[#5a7c6b] font-medium hover:bg-gray-200 transition"
        >
          Add Field
        </button>
      </div>
    );
  }

  const hasSubscription =
    selectedField?.subscription?.hasActiveSubscription &&
    selectedField?.subscription?.plan?.features?.soilReportGeneration;

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
              userArea={pricingFieldData.areaInHectares}
              selectedField={pricingFieldData}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-screen w-full bg-[#5a7c6b] flex">
        <SoilReportSidebar
          selectedOperation={selectedOperation}
          setSelectedOperation={setSelectedOperation}
          setSelectedField={setSelectedField}
          setReportData={setReportData}
          downloadPDF={downloadPDF}
        />

        {!reportData ? (
          // <div className="flex items-center justify-center h-full w-full">
          //                <div className="flex flex-col items-center text-center opacity-60">
          //                 <img
          //                   src={img1}
          //                   alt="placeholder"
          //                   className="w-[300px] h-[300px] mb-6 opacity-70"
          //                 />
          //                 <p className="text-2xl font-semibold text-white">
          //                   Select Field to Generate Soil Report
          //                 </p>
          //               </div>
          //             </div>
          <ComingSoonSection />
        ) : (
          <PremiumPageWrapper
            isLocked={!hasSubscription}
            onSubscribe={handleSubscribe}
            title="Soil Report Generation"
          >
            <div className="w-100 p-4 h-screen overflow-y-auto">
              <MapContainer
                center={[reportData.lat, reportData.lng]}
                zoom={15}
                style={{ height: "400px", width: "100%" }}
              >
                <TileLayer
                  attribution="©️ Google Maps"
                  url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                  subdomains={["mt0", "mt1", "mt2", "mt3"]}
                />
                <Marker position={[reportData.lat, reportData.lng]}>
                  <Popup>{reportData.field}</Popup>
                </Marker>
              </MapContainer>

              <div
                ref={reportRef}
                className={`${isDownloading ? "bg-white text-black p-4" : ""}`}
              >
                <Report data={reportData} isDownloading={isDownloading} />
              </div>

              <div
                ref={restRef}
                className={`${isDownloading ? "bg-white text-black p-4" : ""}`}
              >
                <SOCreport isDownloading={isDownloading} />
                <div className="mt-10 rounded-lg shadow-md flex justify-between gap-4">
                  <Soilwaterindex
                    isDownloading={isDownloading}
                    selectedFieldsDetials={[selectedOperation]}
                  />
                </div>
                <Reccomendations isDownloading={isDownloading} />
              </div>
            </div>
          </PremiumPageWrapper>
        )}
      </div>
    </>
  );
};

export default SoilReport;
