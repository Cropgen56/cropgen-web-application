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
import { ArrowDownToLine, LoaderCircle } from "lucide-react";

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
import PaymentSuccessModal from "../components/subscription/PaymentSuccessModal";
import LoadingSpinner from "../components/comman/loading/LoadingSpinner";

import {
  getFarmFields,
  updateFieldSubscription,
} from "../redux/slices/farmSlice";
import {
  setPaymentSuccess,
  clearPaymentSuccess,
  selectPaymentSuccess,
  selectShowPaymentSuccessModal,
} from "../redux/slices/subscriptionSlice";
import {
  fetchAOIs,
  createAOI,
  fetchForecastData,
} from "../redux/slices/weatherSlice";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import img1 from "../assets/image/Group 31.png";
import FarmReportMap from "../components/farmreport/farmreportsidebar/FarmReportMap";

/* constants */
const FORECAST_CACHE_TTL = 5 * 60 * 1000;

/* utility to format coordinates */
const formatCoordinates = (data) => {
  if (!Array.isArray(data) || data.length === 0) return [];
  const coords = data.map((p) => [p.lng, p.lat]);
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) coords.push(first);
  return coords;
};

const FarmReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state?.auth?.user);
  const authToken = useSelector((state) => state?.auth?.token);
  const fieldsRaw = useSelector((state) => state?.farmfield?.fields);
  const fieldsLoading = useSelector((state) => state?.farmfield?.loading);

  const aoisRaw = useSelector((s) => s?.weather?.aois);
  const aois = useMemo(() => aoisRaw ?? [], [aoisRaw]);
  const forecastData = useSelector((s) => s?.weather?.forecastData) || {};

  const userId = user?.id;

  const paymentSuccess = useSelector(selectPaymentSuccess);
  const showPaymentSuccessModalRedux = useSelector(
    selectShowPaymentSuccessModal
  );

  const fields = useMemo(() => fieldsRaw ?? [], [fieldsRaw]);

  const [selectedField, setSelectedField] = useState(null);
  const [hasManuallySelected, setHasManuallySelected] = useState(false);

  const [showMembershipModalLocal, setShowMembershipModalLocal] = useState(false);
  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);
  const [isRefreshingSubscription, setIsRefreshingSubscription] = useState(false);
  const [aoisInitialized, setAoisInitialized] = useState(false);
  const [isFieldDataReady, setIsFieldDataReady] = useState(false);

  const mainReportRef = useRef();
  const mapRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const aoiCreationRef = useRef(new Set());
  const attemptedAOIsRef = useRef(new Set());
  const forecastFetchRef = useRef(new Map());
  const isMountedRef = useRef(false);

  const selectedFieldDetails = useMemo(
    () => (selectedField ? selectedField : null),
    [selectedField]
  );

  const { forecast, units } = forecastData || {};

  // Fetch fields and AOIs on mount
  useEffect(() => {
    if (!userId) return;
    
    console.log("FarmReport: Fetching fields for user:", userId);
    
    dispatch(getFarmFields(userId))
      .unwrap()
      .then((result) => {
        console.log("FarmReport: Fields fetched successfully:", result?.length || 0, "fields");
      })
      .catch((error) => {
        console.error("FarmReport: Error fetching fields:", error);
      });
    
    if (!isMountedRef.current) {
      dispatch(fetchAOIs())
        .unwrap()
        .then(() => setAoisInitialized(true))
        .catch(() => setAoisInitialized(true));
      isMountedRef.current = true;
    }
  }, [dispatch, userId]);

  // Set field data ready when selectedFieldDetails is valid
  useEffect(() => {
    if (selectedFieldDetails?.field && selectedFieldDetails.field.length >= 3) {
      console.log("FarmReport: Field data is ready:", selectedFieldDetails.fieldName);
      setIsFieldDataReady(true);
    } else {
      setIsFieldDataReady(false);
    }
  }, [selectedFieldDetails]);

  const aoiNeedsCreation = useMemo(() => {
    if (!aoisInitialized || !selectedFieldDetails?._id) return null;
    const aoiName = selectedFieldDetails._id;
    const exists = aois.some((a) => a.name === aoiName);
    const attempted = attemptedAOIsRef.current.has(aoiName);
    const creating = aoiCreationRef.current.has(aoiName);
    return !exists && !attempted && !creating ? aoiName : null;
  }, [aoisInitialized, selectedFieldDetails, aois]);

  useEffect(() => {
    if (!aoiNeedsCreation || !selectedFieldDetails) return;
    const geometryCoords = formatCoordinates(selectedFieldDetails.field);
    if (geometryCoords.length === 0) return;

    aoiCreationRef.current.add(aoiNeedsCreation);
    attemptedAOIsRef.current.add(aoiNeedsCreation);

    dispatch(
      createAOI({
        name: aoiNeedsCreation,
        geometry: { type: "Polygon", coordinates: [geometryCoords] },
      })
    )
      .unwrap()
      .then(() => {})
      .catch(() => {
        attemptedAOIsRef.current.delete(aoiNeedsCreation);
      })
      .finally(() => {
        setTimeout(() => aoiCreationRef.current.delete(aoiNeedsCreation), 1000);
      });
  }, [aoiNeedsCreation, dispatch, selectedFieldDetails]);

  useEffect(() => {
    if (!selectedFieldDetails || aois.length === 0) return;
    const matchingAOI = aois.find((a) => a.name === selectedFieldDetails._id);
    if (!matchingAOI || !matchingAOI.id) return;

    const geoId = matchingAOI.id;
    const lastTs = forecastFetchRef.current.get(geoId) || 0;
    const now = Date.now();
    if (now - lastTs < FORECAST_CACHE_TTL) return;

    forecastFetchRef.current.set(geoId, now);
    dispatch(fetchForecastData({ geometry_id: geoId }));
  }, [selectedFieldDetails, aois, dispatch]);

  const handleFieldSelect = useCallback((field) => {
    console.log("FarmReport: Field selected:", field?.fieldName || field?._id);
    setSelectedField(field);
    setHasManuallySelected(true);
  }, []);

  const handleBackToFieldSelection = useCallback(() => {
    setSelectedField(null);
    setHasManuallySelected(false);
    setIsFieldDataReady(false);
  }, []);

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

  const handlePaymentSuccess = useCallback(
    async (successData) => {
      try {
        setShowPricingOverlay(false);
        setPricingFieldData(null);

        const subscription = successData?.subscription;
        const fieldId = selectedFieldDetails?._id;

        if (fieldId && subscription) {
          setIsRefreshingSubscription(true);
          dispatch(updateFieldSubscription({ fieldId, subscription }));
        }

        dispatch(
          setPaymentSuccess({
            ...successData,
            fieldName:
              successData.fieldName ||
              selectedFieldDetails?.farmName ||
              selectedFieldDetails?.fieldName,
          })
        );

        if (userId) {
          await dispatch(getFarmFields(userId)).unwrap();
        }

        setTimeout(() => setIsRefreshingSubscription(false), 300);
      } catch (error) {
        setIsRefreshingSubscription(false);
        message.error(
          "Failed to update subscription status. Please refresh the page."
        );
      }
    },
    [dispatch, selectedFieldDetails, userId]
  );

  const handleCloseReduxPaymentSuccess = useCallback(() => {
    dispatch(clearPaymentSuccess());
  }, [dispatch]);

  // PDF Download functions
  const imageToBase64 = (img) => {
    return new Promise((resolve, reject) => {
      try {
        if (img.src && img.src.startsWith('data:image')) {
          resolve(img.src);
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 500;
        canvas.height = img.naturalHeight || img.height || 500;
        
        const ctx = canvas.getContext('2d');
        
        const image = new Image();
        image.crossOrigin = 'anonymous';
        
        image.onload = () => {
          ctx.drawImage(image, 0, 0);
          try {
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
          } catch (e) {
            console.warn('Could not convert image to base64:', e);
            resolve(img.src);
          }
        };
        
        image.onerror = () => {
          console.warn('Error loading image for base64 conversion');
          resolve(img.src);
        };
        
        image.src = img.src;
      } catch (error) {
        console.error('Error in imageToBase64:', error);
        resolve(img.src);
      }
    });
  };

  const processAllImages = async (element) => {
    const images = element.querySelectorAll('img');
    const promises = [];

    images.forEach((img) => {
      const promise = imageToBase64(img).then((base64) => {
        img.src = base64;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        img.style.objectFit = 'contain';
        img.removeAttribute('srcset');
        img.removeAttribute('loading');
      });
      promises.push(promise);
    });

    await Promise.all(promises);
  };

  const processChartsAndGraphs = (element) => {
    const svgs = element.querySelectorAll('svg');
    svgs.forEach((svg) => {
      const bbox = svg.getBoundingClientRect();
      const width = bbox.width || 800;
      const height = bbox.height || 400;
      
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svg.style.width = width + 'px';
      svg.style.height = height + 'px';
      svg.style.display = 'block';
      svg.style.visibility = 'visible';
      svg.style.overflow = 'visible';
      
      if (!svg.hasAttribute('viewBox')) {
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      }

      svg.querySelectorAll('*').forEach((child) => {
        child.style.visibility = 'visible';
        child.style.opacity = '1';
      });
    });

    const rechartsWrappers = element.querySelectorAll('.recharts-wrapper');
    rechartsWrappers.forEach((wrapper) => {
      wrapper.style.width = '100%';
      wrapper.style.height = '400px';
      wrapper.style.minHeight = '400px';
      wrapper.style.overflow = 'visible';
      wrapper.style.display = 'block';
      wrapper.style.visibility = 'visible';
      
      const svg = wrapper.querySelector('svg.recharts-surface');
      if (svg) {
        const rect = svg.getBoundingClientRect();
        svg.setAttribute('width', rect.width || 800);
        svg.setAttribute('height', rect.height || 400);
        svg.style.width = (rect.width || 800) + 'px';
        svg.style.height = (rect.height || 400) + 'px';
        svg.style.display = 'block';
        svg.style.visibility = 'visible';
        svg.style.overflow = 'visible';
      }
    });

    const canvases = element.querySelectorAll('canvas');
    canvases.forEach((canvas) => {
      canvas.style.maxWidth = '100%';
      canvas.style.height = 'auto';
    });
  };

  const waitForResources = (element) => {
    return new Promise((resolve) => {
      const images = element.querySelectorAll('img');
      const svgs = element.querySelectorAll('svg');
      
      if (images.length === 0 && svgs.length === 0) {
        resolve();
        return;
      }

      let loadedCount = 0;
      const totalCount = images.length;

      const checkComplete = () => {
        loadedCount++;
        if (loadedCount >= totalCount) {
          setTimeout(resolve, 500);
        }
      };

      if (totalCount === 0) {
        setTimeout(resolve, 500);
        return;
      }

      images.forEach((img) => {
        if (img.complete && img.naturalHeight !== 0) {
          checkComplete();
        } else {
          img.onload = checkComplete;
          img.onerror = checkComplete;
        }
      });
    });
  };

  const downloadFarmReportPDF = async () => {
    const input = mainReportRef.current;
    if (!input) {
      message.error("Report area not found!");
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const sections = input.querySelectorAll(".farm-section");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      let isFirstPage = true;
      const totalSections = sections.length;

      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        setDownloadProgress(((i / totalSections) * 90));

        if (sec.classList.contains("exclude-from-pdf")) continue;

        const clone = sec.cloneNode(true);
        clone.style.position = "absolute";
        clone.style.top = "0";
        clone.style.left = "-99999px";
        clone.style.width = "1200px";
        clone.style.minWidth = "1200px";
        clone.style.background = "#ffffff";
        clone.style.padding = "30px";
        clone.style.boxSizing = "border-box";

        document.body.appendChild(clone);
        await new Promise((res) => setTimeout(res, 100));

        await processAllImages(clone);
        processChartsAndGraphs(clone);
        await waitForResources(clone);
        await new Promise((res) => setTimeout(res, 1000));

        const canvas = await html2canvas(clone, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: "#ffffff",
          width: 1200,
          height: clone.scrollHeight,
          windowWidth: 1200,
          windowHeight: clone.scrollHeight,
          imageTimeout: 15000,
          onclone: (clonedDoc, clonedElement) => {
            clonedElement.querySelectorAll('img').forEach(img => {
              img.style.display = 'block';
              img.style.visibility = 'visible';
              img.style.opacity = '1';
            });

            clonedElement.querySelectorAll('svg').forEach(svg => {
              svg.style.display = 'block';
              svg.style.visibility = 'visible';
              svg.style.opacity = '1';
              svg.style.overflow = 'visible';
              
              svg.querySelectorAll('*').forEach(child => {
                child.style.visibility = 'visible';
                child.style.opacity = '1';
              });
            });

            clonedElement.querySelectorAll('.recharts-wrapper').forEach(wrapper => {
              wrapper.style.overflow = 'visible';
              wrapper.style.display = 'block';
              wrapper.style.visibility = 'visible';
              wrapper.style.minHeight = '400px';
              wrapper.style.width = '100%';
            });
          },
        });

        document.body.removeChild(clone);

        const imgData = canvas.toDataURL("image/png", 1.0);
        const contentWidth = pdfWidth - 20;
        const imgHeight = (canvas.height * contentWidth) / canvas.width;

        if (!isFirstPage) {
          pdf.addPage();
        }
        isFirstPage = false;

        pdf.addImage(imgData, "PNG", 10, 10, contentWidth, imgHeight);

        pdf.setFontSize(9);
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Page ${i + 1}`, pdfWidth - 20, pdfHeight - 10);
      }

      setDownloadProgress(95);

      const fileName = `farm-report-${
        selectedFieldDetails?.fieldName ||
        selectedFieldDetails?.farmName ||
        "report"
      }-${new Date().toISOString().split("T")[0]}.pdf`;

      pdf.save(fileName);

      setDownloadProgress(100);
      message.success("Farm report downloaded successfully!");

      setTimeout(() => {
        setDownloadProgress(0);
      }, 1000);
    } catch (error) {
      console.error("Error generating PDF:", error);
      message.error("Failed to generate PDF. Please try again.");
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
      }, 1000);
    }
  };

  // Show loading spinner while fetching fields
  if (fieldsLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-[#5a7c6b] text-center px-4">
        <LoadingSpinner />
        <p className="text-white mt-4 text-lg">Loading your fields...</p>
      </div>
    );
  }

  // Show add field prompt if no fields
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

  const hasSubscription = selectedFieldDetails?.subscription?.hasActiveSubscription;
  const planFeatures = selectedFieldDetails?.subscription?.plan?.features;

  const hasFarmReportAccess =
    hasSubscription &&
    (!planFeatures ||
      planFeatures?.satelliteImagery ||
      planFeatures?.cropHealthAndYield ||
      planFeatures?.vegetationIndices ||
      planFeatures?.weatherAnalytics);

  const hasCropHealthAndYield =
    hasSubscription && (!planFeatures || planFeatures?.cropHealthAndYield);

  const hasWeatherAnalytics =
    hasSubscription && (!planFeatures || planFeatures?.weatherAnalytics);

  const hasVegetationIndices =
    hasSubscription && (!planFeatures || planFeatures?.vegetationIndices);

  const hasWaterIndices =
    hasSubscription && (!planFeatures || planFeatures?.waterIndices);

  const hasEvapotranspiration =
    hasSubscription && (!planFeatures || planFeatures?.evapotranspirationMonitoring);

  const hasAgronomicInsights =
    hasSubscription && (!planFeatures || planFeatures?.agronomicInsights);

  const hasWeeklyAdvisoryReports =
    hasSubscription && (!planFeatures || planFeatures?.weeklyAdvisoryReports);

  const hasCropGrowthMonitoring =
    hasSubscription && (!planFeatures || planFeatures?.cropGrowthMonitoring);

  const showSidebar = !hasManuallySelected;

  return (
    <>
      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showMembershipModalLocal}
        onClose={handleCloseMembershipModal}
        onSubscribe={handleSubscribe}
        onSkip={handleSkipMembership}
        fieldName={
          selectedFieldDetails?.fieldName || selectedFieldDetails?.farmName
        }
      />

      {/* Pricing Overlay */}
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
              onPaymentSuccess={handlePaymentSuccess}
              userArea={pricingFieldData.areaInHectares}
              selectedField={pricingFieldData}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Success Modal */}
      <PaymentSuccessModal
        isOpen={showPaymentSuccessModalRedux}
        onClose={handleCloseReduxPaymentSuccess}
        fieldName={
          paymentSuccess?.fieldName ||
          selectedFieldDetails?.fieldName ||
          selectedFieldDetails?.farmName
        }
        planName={paymentSuccess?.planName}
        features={paymentSuccess?.features || []}
        daysLeft={paymentSuccess?.daysLeft}
        transactionId={paymentSuccess?.transactionId}
      />

      {/* Refreshing Subscription Overlay */}
      <AnimatePresence>
        {isRefreshingSubscription && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-[2px] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl p-6 shadow-2xl flex flex-col items-center gap-3"
            >
              <LoadingSpinner />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Downloading Overlay */}
      <AnimatePresence>
        {isDownloading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-md w-full mx-4"
            >
              <div className="relative">
                <LoaderCircle
                  className="animate-spin text-[#5a7c6b]"
                  size={64}
                  strokeWidth={2}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold text-[#5a7c6b]">
                    {Math.round(downloadProgress)}%
                  </span>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Generating PDF Report
                </h3>
                <p className="text-sm text-gray-600">
                  {downloadProgress < 30
                    ? "Processing images..."
                    : downloadProgress < 60
                    ? "Rendering charts and graphs..."
                    : downloadProgress < 90
                    ? "Finalizing sections..."
                    : "Almost done..."}
                </p>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-[#5a7c6b] to-[#344e41] h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${downloadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <p className="text-xs text-gray-500 text-center mt-2">
                Please wait, this may take a moment...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout */}
      <div className="flex h-screen overflow-hidden bg-[#5a7c6b] text-white">
        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="min-w-[280px] h-full border-r border-gray-700 bg-white text-black"
            >
              <FarmReportSidebar
                setSelectedField={handleFieldSelect}
                setIsSidebarVisible={() => {}}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 p-4 h-screen overflow-y-auto relative">
          {hasManuallySelected && selectedFieldDetails ? (
            <>
              {/* Header with Back and Download buttons */}
              <div className="mb-4 flex items-center gap-3 flex-wrap">
                <button
                  className="bg-[#344e41] text-white px-4 py-2 rounded-md text-sm shadow hover:bg-[#2d4339] transition-colors flex items-center gap-2"
                  onClick={handleBackToFieldSelection}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Select Another Farm
                </button>

                <button
                  disabled={!hasSubscription || isDownloading}
                  onClick={downloadFarmReportPDF}
                  className={`px-4 py-2 rounded-md text-sm shadow transition-all duration-300 flex items-center gap-2 ${
                    hasSubscription
                      ? "bg-[#344e41] text-white hover:bg-[#2d4339] hover:shadow-lg"
                      : "bg-gray-400 text-gray-200 cursor-not-allowed"
                  }`}
                >
                  {isDownloading ? (
                    <>
                      <LoaderCircle className="animate-spin" size={16} />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <ArrowDownToLine size={16} />
                      Download Report
                    </>
                  )}
                </button>

                {!hasSubscription && (
                  <span className="text-xs text-white/70">
                    Subscribe to download reports
                  </span>
                )}

                {/* Field Name Display */}
                <div className="ml-auto text-white text-sm font-medium">
                  📍 {selectedFieldDetails?.fieldName || selectedFieldDetails?.farmName || "Selected Field"}
                </div>
              </div>

              {/* Premium Wrapper with Report Content */}
              <PremiumPageWrapper
                isLocked={!hasFarmReportAccess}
                onSubscribe={handleSubscribe}
                title="Farm Report"
              >
                <div ref={mainReportRef} className="space-y-6">
                  {!isRefreshingSubscription && (
                    <>
                      {/* Section 0: Maps and Crop Health */}
                      <div className="farm-section" data-section-index="0">
                        {isFieldDataReady ? (
                          <FarmReportMap
                            selectedFieldsDetials={[selectedFieldDetails]}
                            ref={mapRef}
                          />
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full p-2">
                            {[1, 2, 3, 4].map((i) => (
                              <div
                                key={i}
                                className="relative w-full h-[280px] rounded-xl overflow-hidden shadow-md bg-gray-700 animate-pulse flex items-center justify-center"
                              >
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-gray-600 rounded-full mx-auto mb-3"></div>
                                  <p className="text-gray-400 text-sm">Loading map data...</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <CropHealth
                          selectedFieldsDetials={[selectedFieldDetails]}
                          fields={fields}
                          onSubscribe={handleSubscribe}
                          hasCropHealthAndYield={hasCropHealthAndYield}
                        />
                      </div>

                      {/* Section 1: Weather, Vegetation, Water, ET */}
                      <div className="farm-section" data-section-index="1">
                        <ForeCast
                          hasWeatherAnalytics={hasWeatherAnalytics}
                          onSubscribe={handleSubscribe}
                        />

                        <NdviGraph
                          selectedFieldsDetials={[selectedFieldDetails]}
                          onSubscribe={handleSubscribe}
                          hasVegetationIndices={hasVegetationIndices}
                        />

                        <WaterIndex
                          selectedFieldsDetials={[selectedFieldDetails]}
                          onSubscribe={handleSubscribe}
                          hasWaterIndices={hasWaterIndices}
                        />

                        <EvapotranspirationDashboard
                          forecast={forecast}
                          units={units}
                          onSubscribe={handleSubscribe}
                          hasEvapotranspiration={hasEvapotranspiration}
                        />
                      </div>

                      {/* Section 2: Insights, Advisory, Plant Growth */}
                      <div className="farm-section" data-section-index="2">
                        <Insights
                          onSubscribe={handleSubscribe}
                          hasAgronomicInsights={hasAgronomicInsights}
                        />

                        <CropAdvisory
                          selectedFieldsDetials={[selectedFieldDetails]}
                          onSubscribe={handleSubscribe}
                          hasWeeklyAdvisoryReports={hasWeeklyAdvisoryReports}
                        />

                        <PlantGrowthActivity
                          selectedFieldsDetials={[selectedFieldDetails]}
                          onSubscribe={handleSubscribe}
                          hasCropGrowthMonitoring={hasCropGrowthMonitoring}
                        />
                      </div>
                    </>
                  )}
                </div>
              </PremiumPageWrapper>
            </>
          ) : (
            /* No Field Selected State */
            <div className="flex items-center justify-center h-full w-full">
              <div className="flex flex-col items-center text-center opacity-60">
                <img src={img1} alt="" className="w-[300px] h-[300px] mb-4" />
                <p className="text-2xl font-semibold">
                  Select a Field to Generate Farm Report
                </p>
                <p className="text-sm mt-2 opacity-80">
                  Choose a field from the sidebar to view detailed report
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FarmReport;