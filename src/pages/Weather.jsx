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
import { createAOI, fetchAOIs } from "../redux/slices/weatherSlice";
import "../style/weather.css";

// Utility: Convert lat/lng objects to [lng, lat] format and close the polygon if necessary
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

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [selectedField, setSelectedField] = useState(null);

  // Fetch AOIs and farm fields when userId changes
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAOIs());
      dispatch(getFarmFields(user.id));
    }
  }, [dispatch, user?.id]);

  // Set default selected field to the first field in the fields array
  useEffect(() => {
    if (fields.length > 0 && !selectedField) {
      setSelectedField(fields[0]);
    }
  }, [fields, selectedField]);

  // Prepare payload whenever a new field is selected
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

  // Dispatch createAOI when payload changes, but only if AOI doesn't already exist
  useEffect(() => {
    if (payload && payload.geometry.coordinates[0].length > 0) {
      const existingAOI = aois.find((aoi) => aoi.name === payload.name);
      if (!existingAOI) {
        dispatch(createAOI(payload));
      }
    }
  }, [payload, dispatch, aois]);

  return (
    <div className="weather container-fluid m-0 p-0 w-full flex">
      {isSidebarVisible && (
        <WeatherSidebar
          fields={fields}
          setSelectedField={setSelectedField}
          selectedField={selectedField}
        />
      )}
      <div className="weather-body ml-[320px] w-full h-screen overflow-y-auto overflow-x-hidden">
        <WeekWeather selectedField={selectedField} />
        <WeatherHistory selectedField={selectedField} />
        <RainChances selectedField={selectedField} />
        <WindSpeed selectedField={selectedField} />
        <Temperature selectedField={selectedField} />
        <Humidity selectedField={selectedField} />
      </div>
    </div>
  );
};

export default Weather;
