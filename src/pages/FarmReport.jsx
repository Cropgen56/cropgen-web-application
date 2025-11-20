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
import MapView from "../components/dashboard/mapview/MapView";
import CropHealth from "../components/dashboard/crophealth/CropHealthCard";
import ForeCast from "../components/dashboard/forecast/ForeCast";
import PlantGrowthActivity from "../components/dashboard/plantgrowthactivity/PlantGrowthActivity";
import Insights from "../components/dashboard/insights/Insights";
import CropAdvisory from "../components/dashboard/cropadvisory/CropAdvisory";
import NdviGraph from "../components/dashboard/satellite-index/vegitation-index/VegetationIndex";
import WaterIndex from "../components/dashboard/satellite-index/water-index/WaterIndex";
import EvapotranspirationDashboard from "../components/dashboard/satellite-index/ETChart";

import PremiumPageWrapper from "../components/subscription/PremiumPageWrapper";
import SubscriptionModal from "../components/subscription/SubscriptionModal";
import PricingOverlay from "../components/pricing/PricingOverlay";

import { getFarmFields } from "../redux/slices/farmSlice";
import {
  checkFieldSubscriptionStatus,
  setCurrentField,
  displayMembershipModal,
  hideMembershipModal,
  selectCurrentFieldHasSubscription,
} from "../redux/slices/membershipSlice";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import img1 from "../assets/image/Group 31.png";
import FarmReportMap from "../components/farmreport/farmreportsidebar/FarmReportMap";
import { fetchIndexData } from "../redux/slices/satelliteSlice";

const SUBSCRIPTION_CHECK_INTERVAL = 5 * 60 * 1000;

const FarmReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state?.auth?.user);
  const authToken = useSelector((state) => state?.auth?.token);

  const fieldsRaw = useSelector((state) => state?.farmfield?.fields);
  const fields = useMemo(() => fieldsRaw ?? [], [fieldsRaw]);

  const showMembershipModal = useSelector(
    (state) => state.membership.showMembershipModal
  );
  const currentFieldHasSubscription = useSelector(
    selectCurrentFieldHasSubscription
  );
  const fieldSubscriptions = useSelector(
    (state) => state.membership.fieldSubscriptions
  );

  const [selectedField, setSelectedField] = useState(null);
  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const mainReportRef = useRef();
  const [isDownloading, setIsDownloading] = useState(false);

  const subscriptionCheckRef = useRef(null);

  // Fetch farm fields when component mounts
  useEffect(() => {
    if (user?.id) {
      dispatch(getFarmFields(user.id));
    }
  }, [dispatch, user?.id]);

  // Auto-select the latest field if none selected
  useEffect(() => {
    if (fields.length > 0 && !selectedField) {
      const sortedFields = [...fields].sort((a, b) => {
        if (a.createdAt && b.createdAt)
          return new Date(b.createdAt) - new Date(a.createdAt);
        return b._id.localeCompare(a._id);
      });
      setSelectedField(sortedFields[0]._id);
    }
  }, [fields, selectedField]);

  // Memoize selected field details
  const selectedFieldDetails = useMemo(() => {
    return selectedField ? fields.find((f) => f._id === selectedField) : null;
  }, [fields, selectedField]);

  // Fetch index data whenever selected field changes
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

  useEffect(() => {
    if (selectedField && authToken) {
      dispatch(setCurrentField(selectedField._id));

      const fieldSub = fieldSubscriptions[selectedField._id];
      const shouldCheck =
        !fieldSub ||
        (fieldSub.lastChecked &&
          new Date() - new Date(fieldSub.lastChecked) >
            SUBSCRIPTION_CHECK_INTERVAL);

      if (shouldCheck) {
        dispatch(
          checkFieldSubscriptionStatus({
            fieldId: selectedField._id,
            authToken,
          })
        );
      }
    }
  }, [selectedField, authToken, dispatch, fieldSubscriptions]);

  // Periodic subscription check
  useEffect(() => {
    if (!selectedField || !authToken) return;

    if (!subscriptionCheckRef.current) {
      subscriptionCheckRef.current = setInterval(() => {
        dispatch(
          checkFieldSubscriptionStatus({
            fieldId: selectedField._id,
            authToken,
          })
        );
      }, SUBSCRIPTION_CHECK_INTERVAL);
    }

    return () => clearInterval(subscriptionCheckRef.current);
  }, [selectedField, authToken, dispatch]);

  // Handlers for subscription modal & pricing
  const handleSubscribe = useCallback(() => {
    if (selectedField) {
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
      dispatch(hideMembershipModal());
    } else {
      message.warning("Please select a field first");
    }
  }, [selectedField, dispatch]);

  const handleSkipMembership = useCallback(() => {
    dispatch(hideMembershipModal());
    message.info(
      "You can activate premium anytime from the locked content sections"
    );
  }, [dispatch]);

  const handleCloseMembershipModal = useCallback(() => {
    dispatch(hideMembershipModal());
  }, [dispatch]);

  const handleClosePricing = useCallback(() => {
    setShowPricingOverlay(false);
    setPricingFieldData(null);

    if (selectedField && authToken) {
      dispatch(
        checkFieldSubscriptionStatus({
          fieldId: selectedField._id,
          authToken,
        })
      );
    }
  }, [selectedField, authToken, dispatch]);

  const downloadFarmReportPDF = async () => {
    const input = mainReportRef.current;
    if (!input) {
      message.error("Report area not found!");
      return;
    }

    setIsDownloading(true);

    // PAGE SPLIT EXACT LIKE SOIL REPORT
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

      // ---- FIX NDVI CHART SCROLL FOR PDF ----
      const ndviWrapper = clone.querySelector("#ndvi-chart-wrapper");
      let original = {};

      if (ndviWrapper) {
        original = {
          width: ndviWrapper.style.width,
          overflow: ndviWrapper.style.overflow,
        };

        // make it full width
        ndviWrapper.style.overflow = "visible";
        ndviWrapper.style.width = ndviWrapper.scrollWidth + "px";

        // force Recharts to re-render full width
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

  // Render empty state if no fields exist
  if (fields.length === 0) {
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

  return (
    <>
      <SubscriptionModal
        isOpen={showMembershipModal}
        onClose={handleCloseMembershipModal}
        onSubscribe={handleSubscribe}
        onSkip={handleSkipMembership}
        fieldName={
          selectedFieldDetails?.fieldName || selectedFieldDetails?.farmName
        }
      />

      <div className="flex w-full">
        <FarmReportSidebar
          fields={fields}
          selectedField={selectedField}
          setSelectedField={setSelectedField}
          downloadPDF={downloadFarmReportPDF}
          currentFieldHasSubscription={currentFieldHasSubscription}
        />
        
        <PremiumPageWrapper
          isLocked={!currentFieldHasSubscription}
          onSubscribe={handleSubscribe}
          title="Farm Report"
        >
        <div
          className="w-full h-screen overflow-y-auto bg-[#5a7c6b] p-4"
          ref={mainReportRef}
        >
          {selectedFieldDetails && (
            <>
              <div className="farm-section">
                <FarmReportMap selectedFieldsDetials={[selectedFieldDetails]} />

                <CropHealth
                  selectedFieldsDetials={[selectedFieldDetails]}
                  fields={fields}
                  isLocked={!currentFieldHasSubscription}
                  onSubscribe={handleSubscribe}
                  usePremiumWrapper={false}
                />
              </div>
              <div className="farm-section">
                <ForeCast forecastData={{}} />

                <NdviGraph
                  selectedFieldsDetials={[selectedFieldDetails]}
                  isLocked={!currentFieldHasSubscription}
                  onSubscribe={handleSubscribe}
                  usePremiumWrapper={false}
                />
                <WaterIndex
                  selectedFieldsDetials={[selectedFieldDetails]}
                  isLocked={!currentFieldHasSubscription}
                  onSubscribe={handleSubscribe}
                  usePremiumWrapper={false}
                />
                <EvapotranspirationDashboard forecast={{}} units={{}} />
              </div>

              <div className="farm-section">
                <Insights />
                <CropAdvisory
                  selectedFieldsDetials={[selectedFieldDetails]}
                  isLocked={!currentFieldHasSubscription}
                  onSubscribe={handleSubscribe}
                  usePremiumWrapper={false}
                />{" "}
                <PlantGrowthActivity
                  selectedFieldsDetials={[selectedFieldDetails]}
                  isLocked={!currentFieldHasSubscription}
                  onSubscribe={handleSubscribe}
                  usePremiumWrapper={false}
                />{" "}
              </div>
            </>
          )}
        </div>
        </PremiumPageWrapper>
      </div>
    </>
  );
};

export default FarmReport;
