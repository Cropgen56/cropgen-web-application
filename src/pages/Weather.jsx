import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { message } from "antd";
import RainChances from "../components/weather/rainchances/RainChances";
import WindSpeed from "../components/weather/wind/WindSpeed";
import Temperature from "../components/weather/temperature/Temperature";
import Humidity from "../components/weather/humidity/Humidity";
import WeekWeather from "../components/weather/weather/WeekWeather";
import WeatherHistory from "../components/weather/weatherhistory/WeatherHistory";
import WeatherSidebar from "../components/weather/weathersidebar/WeatherSidebar";
import { getFarmFields } from "../redux/slices/farmSlice";
import { useNavigate } from "react-router-dom";
import img1 from "../assets/image/Group 31.png";
import {
  fetchForecastData,
  createAOI,
  fetchAOIs,
} from "../redux/slices/weatherSlice";
import WeatherSkeleton from "../components/Skeleton/WeatherSkeleton";
import PremiumPageWrapper from "../components/subscription/PremiumPageWrapper";
import SubscriptionModal from "../components/subscription/SubscriptionModal";
import PricingOverlay from "../components/pricing/PricingOverlay";
import FieldDropdown from "../components/comman/FieldDropdown";

const formatCoordinates = (data) => {
  if (!data || data.length === 0) return [];
  const coords = data.map((point) => [point.lng, point.lat]);
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    coords.push(first);
  }
  return coords;
};

const Weather = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.auth?.user);
  const authToken = useSelector((state) => state?.auth?.token);

  const fieldsRaw = useSelector((state) => state?.farmfield?.fields);
  const fields = useMemo(() => fieldsRaw ?? [], [fieldsRaw]);

  const aoisRaw = useSelector((state) => state?.weather?.aois);
  const aois = useMemo(() => aoisRaw ?? [], [aoisRaw]);

  const forecastDataRaw = useSelector((state) => state?.weather?.forecastData);
  const forecastData = useMemo(() => forecastDataRaw ?? [], [forecastDataRaw]);

  const loading = useSelector((state) => state?.weather?.loading);

  const [isSidebarVisible] = useState(true);
  const [selectedField, setSelectedField] = useState(null);
  const [showMembershipModalLocal, setShowMembershipModalLocal] =
    useState(false);
  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [dateRange, setDateRange] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAOIs());
      dispatch(getFarmFields(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (fields.length > 0 && !selectedField) {
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
    setPricingFieldData({
      id: selectedField._id,
      name: selectedField.fieldName || selectedField.farmName,
      cropName: selectedField.cropName,
      areaInHectares,
    });
    setShowPricingOverlay(true);
    setShowMembershipModalLocal(false);
  }, [selectedField]);

  const handleSkipMembership = useCallback(() => {
    setShowMembershipModalLocal(false);
    message.info(
      "You can activate premium anytime from the locked content sections"
    );
  }, []);

  const handleCloseMembershipModal = useCallback(() => {
    setShowMembershipModalLocal(false);
    message.info(
      "You can activate premium anytime from the locked content sections"
    );
  }, []);

  const handleClosePricing = useCallback(() => {
    setShowPricingOverlay(false);
    setPricingFieldData(null);
  }, []);

  const handleHistoricalDataReceived = useCallback(
    (data, startDate, endDate) => {
      setHistoricalData(data);
      setDateRange({ startDate, endDate });
    },
    []
  );

  const handleClearHistoricalData = useCallback(() => {
    setHistoricalData(null);
    setDateRange(null);
  }, []);

  const payload = useMemo(() => {
    if (!selectedField?.field?.length) return null;
    const geometryCoords = formatCoordinates(selectedField.field);
    return {
      name: selectedField?._id,
      geometry: {
        type: "Polygon",
        coordinates: [geometryCoords],
      },
    };
  }, [selectedField]);

  useEffect(() => {
    if (payload && payload.geometry.coordinates[0].length > 0) {
      const existingAOI = aois.find((aoi) => aoi.name === payload.name);
      if (!existingAOI) {
        dispatch(createAOI(payload));
      }
    }
  }, [payload, dispatch, aois]);

  useEffect(() => {
    if (selectedField && aois.length > 0) {
      const matchingAOI = aois.find((aoi) => aoi.name === selectedField._id);
      if (matchingAOI && matchingAOI.id) {
        dispatch(fetchForecastData({ geometry_id: matchingAOI.id }));
      }
    }
  }, [dispatch, selectedField, aois]);

  useEffect(() => {
    handleClearHistoricalData();
  }, [selectedField, handleClearHistoricalData]);

  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-[#5a7c6b] text-center px-4">
        <img
          src={img1}
          alt="No Fields"
          className="w-[400px] h-[400px] mb-6 opacity-70"
        />
        <h2 className="text-2xl font-semibold text-white">
          Add Farm to See the Weather Report
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

  const hasSubscription = selectedField?.subscription?.hasActiveSubscription;

  const hasWeatherAnalytics =
    hasSubscription &&
    selectedField?.subscription?.plan?.features?.weatherAnalytics;

  return (
    <>
      <SubscriptionModal
        isOpen={showMembershipModalLocal}
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

      <div className="m-0 p-0 w-full flex flex-row">
        {/* Desktop Sidebar - Hidden on tablet/mobile */}
        {isSidebarVisible && (
          <div className="hidden lg:block">
            <WeatherSidebar
              fields={fields}
              setSelectedField={setSelectedField}
              selectedField={selectedField}
              hasSubscription={hasSubscription}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="w-full bg-[#5f7e6f] m-0 p-0 lg:ml-[320px] h-screen overflow-y-auto overflow-x-hidden">
          {/* Tablet/Mobile Dropdown - Hidden on desktop */}
          <div className="lg:hidden p-3">
            <FieldDropdown
              fields={fields}
              selectedField={selectedField}
              setSelectedField={setSelectedField}
            />
          </div>

          {loading ? (
            <WeatherSkeleton />
          ) : (
            <PremiumPageWrapper
              isLocked={!hasWeatherAnalytics}
              onSubscribe={handleSubscribe}
              title="Weather Analytics"
            >
              <WeekWeather
                selectedField={selectedField}
                forecastData={forecastData}
                historicalData={historicalData}
                dateRange={dateRange}
              />
              <WeatherHistory
                selectedField={selectedField}
                forecastData={forecastData}
                onHistoricalDataReceived={handleHistoricalDataReceived}
                onClearHistoricalData={handleClearHistoricalData}
              />
              <RainChances
                selectedField={selectedField}
                forecastData={forecastData}
                historicalData={historicalData}
                dateRange={dateRange}
              />
              <WindSpeed
                selectedField={selectedField}
                forecastData={forecastData}
                historicalData={historicalData}
                dateRange={dateRange}
              />
              <Temperature
                selectedField={selectedField}
                forecastData={forecastData}
                historicalData={historicalData}
                dateRange={dateRange}
              />
              <Humidity
                selectedField={selectedField}
                forecastData={forecastData}
                historicalData={historicalData}
                dateRange={dateRange}
              />
            </PremiumPageWrapper>
          )}
        </div>
      </div>
    </>
  );
};

export default Weather;