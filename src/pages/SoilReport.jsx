// SoilReport.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Leaf, Download, FileText } from "lucide-react";

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
import { fetchSatelliteDates } from "../redux/slices/satelliteSlice";
import img1 from "../assets/image/Group 31.png";

import PremiumPageWrapper from "../components/subscription/PremiumPageWrapper";
import SubscriptionModal from "../components/subscription/SubscriptionModal";
import PricingOverlay from "../components/pricing/PricingOverlay";
import ComingSoonSection from "../components/comman/loading/ComingSoonSection ";
import FieldDropdown from "../components/comman/FieldDropdown";

const cropOptions = [
  "Barley", "Wheat", "Pearl Millet", "Sorghum", "Finger Millet", "Chickpea", "Red Gram",
  "Green Gram", "Black Gram", "Lentil", "Field Pea", "Horse Gram", "Cowpea", "Groundnut",
  "Mustard", "Soybean", "Sunflower", "Sesame", "Linseed", "Castor", "Safflower", "Niger",
  "Sugarcane", "Cotton", "Jute", "Tobacco", "Potato", "Tomato", "Brinjal", "Cabbage",
  "Cauliflower", "Onion", "Garlic", "Okra", "Carrot", "Radish", "Spinach", "Methi",
  "Green Peas", "Bitter Gourd", "Bottle Gourd", "Pumpkin", "Cucumber", "Beans", "Mango",
  "Banana", "Guava", "Apple", "Papaya", "Orange", "Lemon", "Pomegranate", "Grapes",
  "Pineapple", "Watermelon", "Muskmelon", "Turmeric", "Ginger", "Coriander", "Cumin",
  "Black Pepper", "Red Chilies", "Tea", "Coffee", "Coconut", "Arecanut", "Rubber",
  "Dragon Fruit", "Sponge Gourd", "Snake Gourd", "Ash Gourd", "Drumstick", "Chili",
  "Chia", "Rice", "Kiwi", "Amla", "Capsicum", "Other"
].sort((a, b) => a.localeCompare(b));

// Crop Selection Dropdown Component
const CropSelectionDropdown = ({
  currentCrop,
  setCurrentCrop,
  nextCrop,
  setNextCrop,
  onGenerateReport,
  onDownloadPDF,
  reportGenerated,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentCropOpen, setCurrentCropOpen] = useState(false);
  const [nextCropOpen, setNextCropOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setCurrentCropOpen(false);
        setNextCropOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDisplayText = () => {
    if (currentCrop && nextCrop) {
      return `${currentCrop.slice(0, 6)}.. → ${nextCrop.slice(0, 6)}..`;
    }
    if (currentCrop) return currentCrop;
    return "Crop Details";
  };

  return (
    <div className="relative z-[8000]" ref={dropdownRef}>
      {/* Main Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-[160px] bg-[#344e41] text-white px-3 py-2.5 rounded-md shadow hover:bg-[#2d4339] transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4" />
          <span className="text-sm font-medium truncate">
            {getDisplayText()}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute top-full left-0 mt-1 w-[220px] bg-white rounded-lg shadow-xl z-20 border border-gray-200 overflow-hidden">
            {/* Current Crop Section */}
            <div className="p-3 border-b border-gray-100">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Current Crop
              </label>
              <div className="relative mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentCropOpen(!currentCropOpen);
                    setNextCropOpen(false);
                  }}
                  className="w-full px-3 py-2 bg-[#344E41] text-white rounded-md flex items-center justify-between text-sm"
                >
                  <span className="truncate">
                    {currentCrop || "Select Crop"}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      currentCropOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {currentCropOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-32 overflow-auto">
                    {cropOptions.map((option, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setCurrentCrop(option);
                          setCurrentCropOpen(false);
                        }}
                        className={`px-3 py-1.5 cursor-pointer text-sm text-gray-700 hover:bg-[#344e41] hover:text-white ${
                          currentCrop === option ? "bg-[#344e41] text-white" : ""
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Next Crop Section */}
            <div className="p-3 border-b border-gray-100">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Next Crop
              </label>
              <div className="relative mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setNextCropOpen(!nextCropOpen);
                    setCurrentCropOpen(false);
                  }}
                  className="w-full px-3 py-2 bg-[#344E41] text-white rounded-md flex items-center justify-between text-sm"
                >
                  <span className="truncate">
                    {nextCrop || "Select Crop"}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      nextCropOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {nextCropOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-32 overflow-auto">
                    {cropOptions.map((option, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setNextCrop(option);
                          setNextCropOpen(false);
                        }}
                        className={`px-3 py-1.5 cursor-pointer text-sm text-gray-700 hover:bg-[#344e41] hover:text-white ${
                          nextCrop === option ? "bg-[#344e41] text-white" : ""
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="p-3">
              {!reportGenerated ? (
                <button
                  disabled={disabled}
                  onClick={() => {
                    onGenerateReport();
                    setIsOpen(false);
                  }}
                  className="w-full bg-[#344e41] hover:bg-[#2b3e33] transition-all duration-200 rounded-md px-3 py-2 text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText size={16} />
                  Generate Report
                </button>
              ) : (
                <button
                  onClick={() => {
                    onDownloadPDF();
                    setIsOpen(false);
                  }}
                  className="w-full bg-[#344e41] hover:bg-[#2b3e33] transition-all duration-200 rounded-md px-3 py-2 text-white text-sm flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Download PDF
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const SoilReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state?.auth?.user);
  const fields = useSelector((state) => state?.farmfield?.fields) || [];

  const userId = user?.id;

  const [selectedField, setSelectedField] = useState(null);
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  // Mobile crop selection state
  const [currentCrop, setCurrentCrop] = useState("");
  const [nextCrop, setNextCrop] = useState("");
  const [reportGenerated, setReportGenerated] = useState(false);

  // Mobile/Tablet detection state
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(
    window.innerWidth < 1024
  );

  const reportRef = useRef();
  const restRef = useRef();

  // Handle window resize for responsive detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobileOrTablet(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load farm fields
  useEffect(() => {
    if (userId) dispatch(getFarmFields(userId));
  }, [dispatch, userId]);

  // Auto-select last added field
  useEffect(() => {
    if (fields?.length > 0 && !selectedField) {
      const lastField = fields[fields.length - 1];
      setSelectedField(lastField);
      setSelectedOperation(lastField);
    }
  }, [fields, selectedField]);

  // Reset crop selection when field changes
  useEffect(() => {
    setCurrentCrop("");
    setNextCrop("");
    setReportGenerated(false);
    setReportData(null);
  }, [selectedField?._id]);

  const handleFieldChange = useCallback((field) => {
    setSelectedField(field);
    setSelectedOperation(field);
    setCurrentCrop("");
    setNextCrop("");
    setReportGenerated(false);
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

  const handleGenerateReport = useCallback(() => {
    if (!selectedField) return;

    setReportData({
      field: selectedField.farmName || selectedField.fieldName || "",
      current: currentCrop,
      nextcrop: nextCrop,
      lat: selectedField.field?.[0]?.lat,
      lng: selectedField.field?.[0]?.lng,
      geometry: selectedField.field,
    });
    dispatch(fetchSatelliteDates(selectedField.field));
    setReportGenerated(true);
  }, [selectedField, currentCrop, nextCrop, dispatch]);

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

  // Render Report Content
  const renderReportContent = () => {
    const hasSubscription =
      selectedField?.subscription?.hasActiveSubscription &&
      selectedField?.subscription?.plan?.features?.soilReportGeneration;

    if (!reportData) {
      return <ComingSoonSection />;
    }

    return (
      <PremiumPageWrapper
        isLocked={!hasSubscription}
        onSubscribe={handleSubscribe}
        title="Soil Report Generation"
      >
        <div className="w-full p-4 h-full overflow-y-auto">
          <MapContainer
            center={[reportData.lat, reportData.lng]}
            zoom={15}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer
              attribution="© Google Maps"
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
    );
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

      <div className="h-screen w-full bg-[#5a7c6b] flex overflow-hidden">
        {/* ===== DESKTOP VIEW ===== */}
        <div className="hidden lg:flex w-full h-full">
          {/* Desktop Sidebar */}
          <SoilReportSidebar
            selectedOperation={selectedOperation}
            setSelectedOperation={setSelectedOperation}
            setSelectedField={setSelectedField}
            setReportData={setReportData}
            downloadPDF={downloadPDF}
          />

          {/* Desktop Content */}
          <div className="flex-1 h-screen overflow-y-auto">
            {renderReportContent()}
          </div>
        </div>

        {/* ===== TABLET/MOBILE VIEW ===== */}
        <div className="lg:hidden flex-1 px-3 py-4 h-screen overflow-y-auto">
          {/* Mobile/Tablet Dropdowns Row */}
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            <FieldDropdown
              fields={fields}
              selectedField={selectedField}
              setSelectedField={handleFieldChange}
            />

            {selectedField && (
              <CropSelectionDropdown
                currentCrop={currentCrop}
                setCurrentCrop={setCurrentCrop}
                nextCrop={nextCrop}
                setNextCrop={setNextCrop}
                onGenerateReport={handleGenerateReport}
                onDownloadPDF={downloadPDF}
                reportGenerated={reportGenerated}
                disabled={true} // Set to false when you want to enable
              />
            )}
          </div>

          {/* Mobile/Tablet Content */}
          {selectedField ? (
            renderReportContent()
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <div className="flex flex-col items-center text-center opacity-60">
                <img src={img1} alt="" className="w-[200px] h-[200px] mb-4" />
                <p className="text-xl font-semibold text-white">Loading...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SoilReport;