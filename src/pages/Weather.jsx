import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import RainChances from "../components/weather/rainchances/RainChances";
import WindSpeed from "../components/weather/wind/WindSpeed";
import Temperature from "../components/weather/temperature/Temperature";
import Humidity from "../components/weather/humidity/Humidity";
import WeekWeather from "../components/weather/weather/WeekWeather";
import WeatherHistory from "../components/weather/weatherhistory/WeatherHistory";
import WeatherSidebar from "../components/weather/weathersidebar/WeatherSidebar";
import { getFarmFields } from "../redux/slices/farmSlice";
import { useNavigate } from "react-router-dom";
import img1 from "../assets/image/Group 31.png"
import {
  fetchForecastData,
  createAOI,
  fetchAOIs,
} from "../redux/slices/weatherSlice";

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
  const fields = useSelector((state) => state?.farmfield?.fields) || [];
  const aois = useSelector((state) => state?.weather?.aois) || [];
  const forecastData =
    useSelector((state) => state?.weather?.forecastData) || [];
  const loading = useSelector((state) => state?.weather?.loading); 

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [selectedField, setSelectedField] = useState(null);
  const navigate = useNavigate();

  // Fetch AOIs and farm fields when userId changes
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAOIs());
      dispatch(getFarmFields(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (fields.length > 0 && !selectedField) {
      setSelectedField(fields[0]);
    }
  }, [fields, selectedField]);

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

   // If no fields exist → show message + button
if (fields.length === 0) {
  return (
   <div className="flex flex-col items-center justify-center w-full h-screen bg-[#5a7c6b] text-center px-4">
  {/* Centered Background Image */}
  <img
    src={img1}
    alt="No Fields"
    className="w-[400px] h-[400px] mb-6 opacity-70"
  />

  {/* Text */}
  <h2 className="text-2xl font-semibold text-white">
    Add Farm to See the Weather Report
  </h2>

  {/* Optional Button */}
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
    <div className="m-0 p-0 w-full flex flex-row">
      {isSidebarVisible && (
        <WeatherSidebar
          fields={fields}
          setSelectedField={setSelectedField}
          selectedField={selectedField}
        />
      )}
      <div className="w-full bg-[#5f7e6f] m-0 p-0 ml-[320px] h-screen overflow-y-auto overflow-x-hidden">
      {loading ? (
          // Loader (centered spinner)
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-8 border-white"></div>
          </div>
        ) : (
          <>
            <WeekWeather selectedField={selectedField} forecastData={forecastData} />
            <WeatherHistory selectedField={selectedField} forecastData={forecastData} />
            <RainChances selectedField={selectedField} forecastData={forecastData} />
            <WindSpeed selectedField={selectedField} forecastData={forecastData} />
            <Temperature selectedField={selectedField} forecastData={forecastData} />
            <Humidity selectedField={selectedField} forecastData={forecastData} />
          </>
        )}
      </div>
    </div>
  );
};

export default Weather;
