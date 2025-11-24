import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import SmartAdvisorySidebar from "../components/smartadvisory/smartadvisorysidebar/SmartAdvisorySidebar";
import { getFarmFields } from "../redux/slices/farmSlice";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import img1 from "../assets/image/Group 31.png";
import { useNavigate } from "react-router-dom";
import SatelliteIndexScroll from "../components/smartadvisory/smartadvisorysidebar/SatelliteIndexScroll";
import NDVIChartCard from "../components/smartadvisory/smartadvisorysidebar/Ndvigrapgh";
import IrrigationStatusCard from "../components/smartadvisory/smartadvisorysidebar/IrrigationStatusCard";
import NutrientManagement from "../components/smartadvisory/smartadvisorysidebar/NutrientManagement";
import WeatherCard from "../components/smartadvisory/smartadvisorysidebar/WeatherCard";
import PestDiseaseCard from "../components/smartadvisory/smartadvisorysidebar/PestDiseaseCard";
import FarmAdvisoryCard from "../components/smartadvisory/smartadvisorysidebar/Farmadvisory";
import Fertigation from "../components/smartadvisory/smartadvisorysidebar/Fertigation";
import Soiltemp from "../components/smartadvisory/smartadvisorysidebar/Soiltemp";
import useIsTablet from "../components/smartadvisory/smartadvisorysidebar/Istablet";
import PremiumPageWrapper from "../components/subscription/PremiumPageWrapper";
import SubscriptionModal from "../components/subscription/SubscriptionModal";
import PricingOverlay from "../components/pricing/PricingOverlay";
import {
  checkFieldSubscriptionStatus,
  setCurrentField,
  hideMembershipModal,
  selectHasSmartAdvisorySystem,
} from "../redux/slices/membershipSlice";
import {
  fetchSmartAdvisory,
  runSmartAdvisory,
} from "../redux/slices/smartAdvisorySlice";

import {
  fetchHistoricalWeather,
  fetchForecastData,
  fetchAOIs,
} from "../redux/slices/weatherSlice";

const SUBSCRIPTION_CHECK_INTERVAL = 5 * 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const lastRunKeyFor = (fieldId) => `lastSmartAdvisoryRun_${fieldId}`;

function getLastRunTimestamp(fieldId) {
  try {
    const v = localStorage.getItem(lastRunKeyFor(fieldId));
    return v ? Number(v) : 0;
  } catch (e) {
    return 0;
  }
}
function setLastRunTimestamp(fieldId, ts = Date.now()) {
  try {
    localStorage.setItem(lastRunKeyFor(fieldId), String(ts));
  } catch (e) {}
}

const SmartAdvisory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isTablet = useIsTablet();

  const user = useSelector((s) => s.auth?.user);
  const authToken = useSelector((s) => s.auth?.token);
  const fieldsRaw = useSelector((s) => s.farmfield?.fields ?? []);
  const aois = useSelector((s) => s.weather?.aois ?? []);
  const showMembershipModal = useSelector(
    (s) => s.membership?.showMembershipModal
  );
  const hasSmartAdvisorySystem = useSelector(selectHasSmartAdvisorySystem);
  const fieldSubscriptions = useSelector(
    (s) => s.membership?.fieldSubscriptions ?? {}
  );

  const [reportdata, setReportData] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);

  const fields = useMemo(() => fieldsRaw ?? [], [fieldsRaw]);
  const mountedRef = useRef(false);

  useEffect(() => {
    dispatch(fetchAOIs());
    if (user?.id) dispatch(getFarmFields(user.id));
  }, [dispatch, user?.id]);

  // select field effect: set current field and check subscription if needed
  useEffect(() => {
    if (!selectedField || !authToken) return;
    dispatch(setCurrentField(selectedField._id));

    const fieldSub = fieldSubscriptions[selectedField._id];
    const shouldCheck =
      !fieldSub ||
      (fieldSub.lastChecked &&
        Date.now() - new Date(fieldSub.lastChecked).getTime() >
          SUBSCRIPTION_CHECK_INTERVAL);

    if (shouldCheck) {
      dispatch(
        checkFieldSubscriptionStatus({ fieldId: selectedField._id, authToken })
      );
    }
  }, [selectedField, authToken, dispatch, fieldSubscriptions]);

  // interval to refresh subscription status while field is selected
  useEffect(() => {
    if (!selectedField || !authToken) return;
    const id = setInterval(() => {
      dispatch(
        checkFieldSubscriptionStatus({ fieldId: selectedField._id, authToken })
      );
    }, SUBSCRIPTION_CHECK_INTERVAL);
    return () => clearInterval(id);
  }, [selectedField, authToken, dispatch]);

  // fetch advisory from DB on mount and when selected field changes
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
    }
    if (!selectedField) return;
    dispatch(fetchSmartAdvisory({ fieldId: selectedField._id }))
      .unwrap()
      .catch((err) => {
        console.debug("fetchSmartAdvisory failed:", err);
      });
  }, [selectedField, dispatch]);

  // run advisory generation at most once per week per field (requires AOI/geometry)
  useEffect(() => {
    if (!selectedField || !authToken) return;
    const fieldId = selectedField._id;
    const lastRunTs = getLastRunTimestamp(fieldId);
    if (lastRunTs && Date.now() - lastRunTs < WEEK_MS) return;

    const matchingAOI = aois.find((a) => a.name === fieldId && a.id);
    if (!matchingAOI) {
      // no geometry available — still rely on DB fetch only
      return;
    }

    const payload = {
      fieldId,
      geometryId: matchingAOI.id,
      targetDate: new Date().toISOString().split("T")[0],
      language: "en",
      token: authToken,
    };

    dispatch(runSmartAdvisory(payload))
      .unwrap()
      .then(() => {
        setLastRunTimestamp(fieldId, Date.now());
        // after generation, refresh from DB
        dispatch(fetchSmartAdvisory({ fieldId })).catch(() => {});
      })
      .catch(() => {
        // fail silently, will retry on next mount/field change
      });
  }, [selectedField, aois, authToken, dispatch]);

  useEffect(() => {
    if (!selectedField || !authToken) return;

    const fieldId = selectedField._id;
    const matchingAOI = aois.find((a) => a.name === fieldId && a.id);

    const requestPayload = {
      geometry_id: matchingAOI?.id,
      start_date: selectedField?.sowingDate,
      end_date: new Date().toISOString().split("T")[0],
    };

    const geometry_id = matchingAOI?.id;

    dispatch(fetchHistoricalWeather(requestPayload));
    dispatch(fetchForecastData({ geometry_id }));
  }, [selectedField, aois, authToken, dispatch]);

  const handleSubscribe = useCallback(() => {
    if (!selectedField) {
      message.warning("Please select a field first");
      return;
    }
    const areaInHectares =
      selectedField?.areaInHectares ??
      (selectedField?.acre ? selectedField.acre * 0.404686 : 5);
    setPricingFieldData({
      id: selectedField._id,
      name: selectedField.fieldName || selectedField.farmName,
      areaInHectares,
      cropName: selectedField.cropName,
    });
    setShowPricingOverlay(true);
    dispatch(hideMembershipModal());
  }, [selectedField, dispatch]);

  const handleSkipMembership = useCallback(() => {
    dispatch(hideMembershipModal());
    message.info(
      "You can activate premium anytime from the locked content sections"
    );
  }, [dispatch]);

  const handleCloseMembershipModal = useCallback(
    () => dispatch(hideMembershipModal()),
    [dispatch]
  );

  const handleClosePricing = useCallback(() => {
    setShowPricingOverlay(false);
    setPricingFieldData(null);
    if (selectedField && authToken) {
      dispatch(
        checkFieldSubscriptionStatus({ fieldId: selectedField._id, authToken })
      );
    }
  }, [selectedField, authToken, dispatch]);

  if (!fields || fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-[#5a7c6b] text-center px-4">
        <img
          src={img1}
          alt="No Fields"
          className="w-[400px] h-[400px] mb-6 opacity-70"
        />
        <h2 className="text-2xl font-semibold text-white">
          Add Farm to See the Smart Advisory
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

  console.log("test ", selectedField);

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

      <div className="flex h-screen overflow-hidden bg-[#5a7c6b] text-white">
        {isSidebarVisible && (
          <div className="min-w-[280px] h-full border-r border-gray-700 bg-white text-black">
            <SmartAdvisorySidebar
              setReportData={setReportData}
              setSelectedField={setSelectedField}
              setIsSidebarVisible={setIsSidebarVisible}
            />
          </div>
        )}

        <div className="flex-1 p-4 h-screen overflow-y-auto relative">
          {!isSidebarVisible && (
            <div className="mb-4">
              <button
                className="bg-[#344e41] text-white px-4 py-2 rounded-md text-sm shadow"
                onClick={() => {
                  setIsSidebarVisible(true);
                  setReportData(null);
                }}
              >
                Select Another Farm
              </button>
            </div>
          )}

          {reportdata ? (
            <PremiumPageWrapper
              isLocked={!hasSmartAdvisorySystem}
              onSubscribe={handleSubscribe}
              title="Smart Advisory System"
            >
              {isTablet ? (
                <div className="flex flex-col gap-4 w-full max-w-[1024px] mx-auto">
                  <div className="w-full h-[300px] rounded-lg overflow-hidden shadow relative">
                    <MapContainer
                      center={[reportdata.lat, reportdata.lng]}
                      zoom={15}
                      className="w-full h-full z-0"
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
                    <div className="absolute bottom-1 left-2 right-2 z-[1000]">
                      <SatelliteIndexScroll />
                    </div>
                  </div>

                  <NDVIChartCard />

                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-[#4b6b5b] rounded-lg p-2 overflow-hidden">
                      <IrrigationStatusCard />
                    </div>
                    <div className="bg-[#4b6b5b] rounded-lg p-2 overflow-hidden">
                      <NutrientManagement />
                    </div>
                    <div className="col-span-2 bg-[#4b6b5b] rounded-lg p-2 overflow-hidden">
                      <WeatherCard />
                    </div>
                    <div className="col-span-2 bg-[#4b6b5b] rounded-lg p-2 overflow-hidden">
                      <PestDiseaseCard />
                    </div>
                    <div className="col-span-2 bg-[#4b6b5b] rounded-lg p-2 overflow-x-auto">
                      <Fertigation />
                    </div>
                    <div className="col-span-2 bg-[#4b6b5b] rounded-lg p-2 overflow-x-auto">
                      <Soiltemp />
                    </div>
                  </div>

                  <div className="w-full bg-[#4b6b5b] rounded-lg p-2 overflow-hidden">
                    <FarmAdvisoryCard />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 w-full">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex flex-col lg:w-[65%]">
                      <div className="w-full h-[300px] rounded-lg overflow-hidden shadow relative">
                        <MapContainer
                          center={[reportdata.lat, reportdata.lng]}
                          zoom={15}
                          className="w-full h-full z-0"
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
                        <div className="absolute bottom-1 left-2 right-2 z-[1000]">
                          <SatelliteIndexScroll />
                        </div>
                      </div>

                      <NDVIChartCard />
                    </div>

                    <div className="lg:w-[35%]">
                      <IrrigationStatusCard />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    <NutrientManagement />
                    <WeatherCard />
                    <PestDiseaseCard />
                  </div>

                  <div className="flex flex-row gap-4 w-full">
                    {/* <div className="w-[32%] overflow-x-auto">
                      <Fertigation />
                    </div> */}
                    <div className="w-full overflow-x-auto">
                      <Soiltemp />
                    </div>
                  </div>

                  <div className="w-full">
                    <FarmAdvisoryCard />
                  </div>
                </div>
              )}
            </PremiumPageWrapper>
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <div className="flex flex-col items-center text-center opacity-60">
                <img src={img1} alt="" />
                <p className="text-2xl font-semibold">
                  Select Field For Generate Smart Advisory
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SmartAdvisory;
