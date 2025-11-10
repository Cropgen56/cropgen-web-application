import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
import {
  checkFieldSubscriptionStatus,
  setCurrentField,
  displayMembershipModal,
  hideMembershipModal,
  selectCurrentFieldHasSubscription
} from "../redux/slices/membershipSlice";

const SUBSCRIPTION_CHECK_INTERVAL = 5 * 60 * 1000;

const SoilReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const user = useSelector((state) => state?.auth?.user);
  const authToken = useSelector((state) => state?.auth?.token);
  const fields = useSelector((state) => state?.farmfield?.fields);
  
  const showMembershipModal = useSelector(state => state.membership.showMembershipModal);
  const currentFieldHasSubscription = useSelector(selectCurrentFieldHasSubscription);
  const fieldSubscriptions = useSelector(state => state.membership.fieldSubscriptions);
  
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [reportdata, setReportData] = useState(null);
  const [isdownloading, setIsDownloading] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);
  
  const reportRef = useRef();
  const restRef = useRef();
  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      dispatch(getFarmFields(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (selectedField && authToken) {
      dispatch(setCurrentField(selectedField._id));

      const fieldSub = fieldSubscriptions[selectedField._id];
      const shouldCheck = !fieldSub ||
        (fieldSub.lastChecked &&
          new Date() - new Date(fieldSub.lastChecked) > SUBSCRIPTION_CHECK_INTERVAL);

      if (shouldCheck) {
        dispatch(checkFieldSubscriptionStatus({
          fieldId: selectedField._id,
          authToken
        }));
      }
    }
  }, [selectedField, authToken, dispatch, fieldSubscriptions]);

  useEffect(() => {
    if (!selectedField || !authToken) return;

    const interval = setInterval(() => {
      dispatch(checkFieldSubscriptionStatus({
        fieldId: selectedField._id,
        authToken
      }));
    }, SUBSCRIPTION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [selectedField, authToken, dispatch]);

  const handleSubscribe = useCallback(() => {
    if (selectedField) {
      const areaInHectares = selectedField?.areaInHectares ||
        selectedField?.acre * 0.404686 ||
        5;
      const fieldData = {
        id: selectedField._id,
        name: selectedField.fieldName || selectedField.farmName,
        areaInHectares,
        cropName: selectedField.cropName,
      };

      setPricingFieldData(fieldData);
      setShowPricingOverlay(true);
      dispatch(hideMembershipModal());
    } else {
      message.warning("Please select a field first");
    }
  }, [selectedField, dispatch]);

  const handleSkipMembership = useCallback(() => {
    dispatch(hideMembershipModal());
    message.info("You can activate premium anytime from the locked content sections");
  }, [dispatch]);

  const handleCloseMembershipModal = useCallback(() => {
    dispatch(hideMembershipModal());
  }, [dispatch]);

  const handleClosePricing = useCallback(() => {
    setShowPricingOverlay(false);
    setPricingFieldData(null);

    if (selectedField && authToken) {
      dispatch(checkFieldSubscriptionStatus({
        fieldId: selectedField._id,
        authToken
      }));
    }
  }, [selectedField, authToken, dispatch]);

  const downloadPDF = async () => {
    if (!currentFieldHasSubscription) {
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
        <div>
          <SoilReportSidebar
            selectedOperation={selectedOperation}
            setSelectedOperation={setSelectedOperation}
            setSelectedField={setSelectedField}
            setReportData={setReportData}
            downloadPDF={downloadPDF}
          />
        </div>

        <div className="w-100 p-4 h-screen overflow-y-auto">
          {!reportdata ? (
            <div className="flex items-center justify-center h-full w-full">
              <div className="flex flex-col items-center text-center opacity-60">
                <img src={img1} alt="placeholder" className="w-[300px] h-[300px] mb-6 opacity-70" />
                <p className="text-2xl font-semibold text-white">
                  Select Field to Generate Soil Report
                </p>
              </div>
            </div>
          ) : (
            <PremiumPageWrapper
              isLocked={!currentFieldHasSubscription}
              onSubscribe={handleSubscribe}
              title="Soil Report"
            >
              <MapContainer
                center={[reportdata.lat, reportdata.lng]}
                zoom={15}
                style={{ height: "400px", width: "100%" }}
              >
                <TileLayer
                  attribution="©️ Google Maps"
                  url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                  subdomains={["mt0", "mt1", "mt2", "mt3"]}
                />
                <Marker position={[reportdata.lat, reportdata.lng]}>
                  <Popup>{reportdata.field}</Popup>
                </Marker>
              </MapContainer>

              <div
                ref={reportRef}
                className={`${isdownloading ? "bg-white text-black p-4" : ""}`}
              >
                <div className="mt-4">
                  <Report data={reportdata} isdownloading={isdownloading} />
                </div>
              </div>

              <div
                ref={restRef}
                className={`${isdownloading ? "bg-white text-black p-4" : ""}`}
              >
                <div className="mt-4">
                  <SOCreport isdownloading={isdownloading} />
                </div>

                <div className="mt-10 rounded-lg shadow-md flex justify-between gap-4">
                  <Soilwaterindex
                    isdownloading={isdownloading}
                    selectedFieldsDetials={[selectedOperation]}
                  />
                </div>

                <div className="mt-4">
                  <Reccomendations isdownloading={isdownloading} />
                </div>

                <div
                  className={`mt-5 p-4 rounded-lg shadow-md ${
                    isdownloading ? "text-black" : "text-green-100"
                  }`}
                >
                  <p className="text-xs">
                    * This is a satellite-based generated soil report, not a
                    physical or lab-tested report. The results are indicative and
                    may not represent exact ground conditions. Please use it for
                    advisory purposes only.
                  </p>
                </div>
              </div>
            </PremiumPageWrapper>
          )}
        </div>
      </div>
    </>
  );
};

export default SoilReport;