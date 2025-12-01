import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import FarmReportSidebar from "../components/farmreport/farmreportsidebar/FarmReportSidebar";
import CropHealth from "../components/dashboard/crophealth/CropHealthCard";
import ForeCast from "../components/dashboard/forecast/ForeCast";
import PlantGrowthActivity from "../components/dashboard/PlantGrowthActivity";
import Insights from "../components/dashboard/insights/Insights";
import CropAdvisory from "../components/dashboard/CropAdvisory";
import NdviGraph from "../components/dashboard/satellite-index/VegetationIndex";
import WaterIndex from "../components/dashboard/satellite-index/WaterIndex";
import EvapotranspirationDashboard from "../components/dashboard/satellite-index/ETChart";

import PremiumPageWrapper from "../components/subscription/PremiumPageWrapper";
import SubscriptionModal from "../components/subscription/SubscriptionModal";
import PricingOverlay from "../components/pricing/PricingOverlay";

import { getFarmFields } from "../redux/slices/farmSlice";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import img1 from "../assets/image/Group 31.png";
import FarmReportMap from "../components/farmreport/farmreportsidebar/FarmReportMap";
import { fetchIndexData } from "../redux/slices/satelliteSlice";
import ComingSoonSection from "../components/comman/loading/ComingSoonSection ";

const FarmReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state?.auth?.user);
  const authToken = useSelector((state) => state?.auth?.token);
  const fields = useSelector((state) => state?.farmfield?.fields);

  const userId = user?.id;

  const [selectedField, setSelectedField] = useState(null);
  const [showMembershipModalLocal, setShowMembershipModalLocal] = useState(false);
  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);

  const mainReportRef = useRef();
  const [isDownloading, setIsDownloading] = useState(false);


  useEffect(() => {
    if (userId) {
      dispatch(getFarmFields(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (fields?.length > 0 && !selectedField) {
      setSelectedField(fields[fields.length - 1]);
    }
  }, [fields, selectedField]);


  const selectedFieldDetails = selectedField;

  useEffect(() => {
    const field = selectedFieldDetails?.field;
    if (!field || field.length < 3) return;

    // Convert to [lng, lat] and ensure polygon is closed
    let coords = field.map(({ lat, lng }) => [lng, lat]);
    const first = coords[0];
    const last = coords[coords.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      coords.push(first);
    }

    const today = new Date().toISOString().split("T")[0];
    const indexes = ["NDVI", "NDMI", "NDRE", "TRUE_COLOR"];

    indexes.forEach((index) => {
      dispatch(fetchIndexData({ endDate: today, geometry: [coords], index }));
    });
  }, [selectedFieldDetails, dispatch]);

  // Handlers for subscription modal & pricing
  const handleSubscribe = useCallback(() => {
    if (selectedFieldDetails) {
      const areaInHectares =
        selectedFieldDetails?.areaInHectares ||
        selectedFieldDetails?.acre * 0.404686 ||
        5;
      const fieldData = {
        id: selectedFieldDetails._id,
        name: selectedFieldDetails.fieldName || selectedFieldDetails.farmName,
        areaInHectares,
        cropName: selectedFieldDetails.cropName,
      };

      setPricingFieldData(fieldData);
      setShowPricingOverlay(true);
      setShowMembershipModalLocal(false);
    } else {
      message.warning("Please select a field first");
    }
  }, [selectedFieldDetails]);

  const handleSkipMembership = useCallback(() => {
    setShowMembershipModalLocal(false);
    message.info(
      "You can activate premium anytime from the locked content sections"
    );
  }, []);

  const handleCloseMembershipModal = useCallback(() => {
    setShowMembershipModalLocal(false);
  }, []);

  const handleClosePricing = useCallback(() => {
    setShowPricingOverlay(false);
    setPricingFieldData(null);
  }, []);

  const downloadFarmReportPDF = async () => {
    const input = mainReportRef.current;
    if (!input) {
      message.error("Report area not found!");
      return;
    }

    setIsDownloading(true);

    const sections = input.querySelectorAll(".farm-section");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();

    let page = 1;

    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];

      if (sec.classList.contains("exclude-map")) continue;

      const clone = sec.cloneNode(true);
      clone.style.position = "absolute";
      clone.style.top = "0";
      clone.style.left = "-9999px";
      clone.style.width = sec.offsetWidth + "px";
      clone.style.background = "#fff";

      const ndviWrapper = clone.querySelector("#ndvi-chart-wrapper");
      let original = {};

      if (ndviWrapper) {
        original = {
          width: ndviWrapper.style.width,
          overflow: ndviWrapper.style.overflow,
        };

        ndviWrapper.style.overflow = "visible";
        ndviWrapper.style.width = ndviWrapper.scrollWidth + "px";

        ndviWrapper
          .querySelector("svg")
          ?.setAttribute("width", ndviWrapper.scrollWidth);
      }

      document.body.appendChild(clone);

      if (ndviWrapper) {
        ndviWrapper.style.width = original.width;
        ndviWrapper.style.overflow = original.overflow;
      }

      clone.querySelectorAll("canvas, img, svg").forEach((el) => {
        el.classList.add("force-visible");
      });

      clone.querySelectorAll(".leaflet-tile").forEach((tile) => {
        tile.setAttribute("crossorigin", "anonymous");
        tile.setAttribute("referrerpolicy", "no-referrer");
      });

      clone.querySelectorAll("img").forEach((img) => {
        img.crossOrigin = "anonymous";
        img.referrerPolicy = "no-referrer";
      });

      await new Promise((res) => setTimeout(res, 500));

      const imgs = clone.querySelectorAll("img");
      await Promise.all(
        [...imgs].map((img) => {
          if (img.complete) return;
          return new Promise((res) => (img.onload = res));
        })
      );

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollY: 0,
        backgroundColor: "#ffffff",
        windowWidth: document.body.scrollWidth,
        windowHeight: clone.scrollHeight,
      });

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL("image/png");
      const imgHeight = (canvas.height * width) / canvas.width;

      if (i !== 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, width, imgHeight);

      pdf.setFontSize(9);
      pdf.text(`Page ${page}`, width - 20, height - 10);
      page++;
    }

    pdf.save("farm-report.pdf");
    setIsDownloading(false);
  };


  if (fields?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-[#5a7c6b] text-center px-4">
        <img
          src={img1}
          alt="No Fields"
          className="w-[400px] h-[400px] mb-6 opacity-60"
        />
        <h2 className="text-2xl font-semibold text-white">
          Add Farm to See the Farm Report
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

  // Check subscription from field data
  const hasSubscription = selectedField?.subscription?.hasActiveSubscription;


  const planFeatures = selectedField?.subscription?.plan?.features;


  const hasFeatureAccess = (featureName) => {
    if (!hasSubscription) return false;

    if (hasSubscription && !planFeatures) {
      return true;
    }
    // Check specific feature
    return planFeatures?.[featureName] === true;
  };
  const hasFarmReportAccess = hasSubscription && (
    !planFeatures ||
    (
      planFeatures?.satelliteImagery ||
      planFeatures?.cropHealthAndYield ||
      planFeatures?.vegetationIndices ||
      planFeatures?.weatherAnalytics
    )
  );

  // The main report content component
  const ReportContent = () => (
    <div
      className="w-full h-screen overflow-y-auto bg-[#5a7c6b] p-4"
      ref={mainReportRef}
    >
      <ComingSoonSection />

      {/* {selectedFieldDetails && (
        <>
          <div className="farm-section">
            <FarmReportMap selectedFieldsDetials={[selectedFieldDetails]} />

            <CropHealth
              selectedFieldsDetials={[selectedFieldDetails]}
              fields={fields}
            />
          </div>
          <div className="farm-section">
            <ForeCast forecastData={{}} />

            <NdviGraph
              selectedFieldsDetials={[selectedFieldDetails]}
            />
            <WaterIndex
              selectedFieldsDetials={[selectedFieldDetails]}
            />
            <EvapotranspirationDashboard forecast={{}} units={{}} />
          </div>

          <div className="farm-section">
            <Insights />
            <CropAdvisory
              selectedFieldsDetials={[selectedFieldDetails]}
            />
            <PlantGrowthActivity
              selectedFieldsDetials={[selectedFieldDetails]}
            />
          </div>
        </>
      )} */}
    </div>
  );

  return (
    <>
      <SubscriptionModal
        isOpen={showMembershipModalLocal}
        onClose={handleCloseMembershipModal}
        onSubscribe={handleSubscribe}
        onSkip={handleSkipMembership}
        fieldName={
          selectedFieldDetails?.fieldName || selectedFieldDetails?.farmName
        }
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

      <div className="w-full h-full m-0 p-0 d-flex">
        <FarmReportSidebar
          fields={fields}
          selectedField={selectedField}
          setSelectedField={setSelectedField}
          downloadPDF={downloadFarmReportPDF}
          hasSubscription={hasSubscription}
        />

        <div className="bg-[#5a7c6b] w-full">

          {hasFarmReportAccess ? (

            <ReportContent />
          ) : (

            <PremiumPageWrapper
              isLocked={!hasFarmReportAccess}
              onSubscribe={handleSubscribe}
              title="Farm Report"
            >
              <ReportContent />
            </PremiumPageWrapper>
          )}
        </div>
      </div>
    </>
  );
};

export default FarmReport;