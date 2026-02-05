import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import RainChances from "../components/weather/rainchances/RainChances";
import WindSpeed from "../components/weather/wind/WindSpeed";
import Temperature from "../components/weather/temperature/Temperature";
import Humidity from "../components/weather/humidity/Humidity";
import WeekWeather from "../components/weather/weather/WeekWeather";
import WeatherHistory from "../components/weather/weatherhistory/WeatherHistory";
import WeatherSidebar from "../components/weather/weathersidebar/WeatherSidebar";
import WeatherSkeleton from "../components/Skeleton/WeatherSkeleton";
import FieldDropdown from "../components/comman/FieldDropdown";

import FeatureGuard from "../components/subscription/FeatureGuard";
import { useSubscriptionGuard } from "../components/subscription/hooks/useSubscriptionGuard";

import { getFarmFields } from "../redux/slices/farmSlice";
import { fetchForecastData, fetchAOIs } from "../redux/slices/weatherSlice";

import { useAoiManagement } from "../components/dashboard/hooks/useAoiManagement";
import { useWeatherForecast } from "../components/dashboard/hooks/useWeatherForecast";

import img1 from "../assets/image/Group 31.png";

const formatCoordinates = (data) => {
  if (!data || data.length === 0) return [];
  const coords = data.map((p) => [p.lng, p.lat]);
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    coords.push(first);
  }
  return coords;
};

const Weather = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state?.auth?.user);
  const fieldsRaw = useSelector((state) => state?.farmfield?.fields);
  const aois = useSelector((state) => state?.weather?.aois);
  const forecastData = useSelector((state) => state?.weather?.forecastData);
  const loading = useSelector((state) => state?.weather?.loading);

  const fields = useMemo(() => fieldsRaw ?? [], [fieldsRaw]);

  const [selectedField, setSelectedField] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [isSidebarVisible] = useState(true);

  /* ---------- AOI & FORECAST (UNCHANGED) ---------- */

  const { aoiId } = useAoiManagement(selectedField);
  useWeatherForecast(aoiId);

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

  useEffect(() => {
    if (selectedField && aois?.length) {
      const match = aois.find((aoi) => aoi.name === selectedField._id);
      if (match?.id) {
        dispatch(fetchForecastData({ geometry_id: match.id }));
      }
    }
  }, [dispatch, selectedField, aois]);

  useEffect(() => {
    setHistoricalData(null);
    setDateRange(null);
  }, [selectedField]);

  /* ---------- SUBSCRIPTION LOGIC (NEW, UI SAFE) ---------- */

  const subscriptionGuard = useSubscriptionGuard({
    field: selectedField,
    featureKey: "weatherAnalytics",
  });

  /* ---------- EMPTY STATE (UNCHANGED UI) ---------- */

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

  /* ---------- MAIN UI (UNCHANGED STRUCTURE) ---------- */

  return (
    <div className="m-0 p-0 w-full flex flex-row">
      {isSidebarVisible && (
        <div className="hidden lg:block">
          <WeatherSidebar
            fields={fields}
            setSelectedField={setSelectedField}
            selectedField={selectedField}
            hasSubscription={subscriptionGuard.hasFeatureAccess}
          />
        </div>
      )}

      <div className="w-full bg-[#5f7e6f] m-0 p-0 lg:ml-[320px] h-screen overflow-y-auto overflow-x-hidden">
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
          <FeatureGuard guard={subscriptionGuard} title="Weather Analytics">
            <WeekWeather
              selectedField={selectedField}
              forecastData={forecastData}
              historicalData={historicalData}
              dateRange={dateRange}
            />

            <WeatherHistory
              selectedField={selectedField}
              forecastData={forecastData}
              onHistoricalDataReceived={(data, start, end) => {
                setHistoricalData(data);
                setDateRange({ startDate: start, endDate: end });
              }}
              onClearHistoricalData={() => {
                setHistoricalData(null);
                setDateRange(null);
              }}
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
          </FeatureGuard>
        )}
      </div>
    </div>
  );
};

export default Weather;
