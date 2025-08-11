import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFarmFields } from "../redux/slices/farmSlice";
import MapView from "../components/dashboard/mapview/MapView";
import CropHealth from "../components/dashboard/crophealth/CropHealthCard";
import ForeCast from "../components/dashboard/forecast/ForeCast";
import PlantGrowthActivity from "../components/dashboard/plantgrowthactivity/PlantGrowthActivity";
import Insights from "../components/dashboard/insights/Insights";
import CropAdvisory from "../components/dashboard/cropadvisory/CropAdvisory";
import "../style/Dashboard.css";
import NdviGraph from "../components/dashboard/satellite-index/vegitation-index/VegetationIndex";
import WaterIndex from "../components/dashboard/satellite-index/water-index/WaterIndex";
import {
  fetchAOIs,
  createAOI,
  fetchForecastData,
} from "../redux/slices/weatherSlice";

// Constants
const SELECTED_FIELD_KEY = "selectedFieldId";

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

const Dashboard = () => {
  const dispatch = useDispatch();

  // Memoized selectors to prevent unnecessary re-renders
  const user = useSelector((state) => state?.auth?.user);
  const fields = useSelector((state) => state?.farmfield?.fields) || [];
  const aois = useSelector((state) => state?.weather?.aois) || [];
  const forecastData = useSelector((state) => state.weather.forecastData) || [];
  const userId = user?.id;

  // State management
  const [markers, setMarkers] = useState([]);
  const [isAddingMarkers, setIsAddingMarkers] = useState(false);
  const [selectedField, setSelectedField] = useState(() => {
    return localStorage.getItem(SELECTED_FIELD_KEY) || "";
  });

  const [prevFieldsLength, setPrevFieldsLength] = useState(0);

  // Memoized computed values
  const selectedFieldDetails = useMemo(() => {
    return fields.find((item) => item?._id === selectedField) || null;
  }, [fields, selectedField]);

  // Memoized callback for field selection
  const handleFieldSelection = useCallback((fieldId) => {
    setSelectedField(fieldId);
    localStorage.setItem(SELECTED_FIELD_KEY, fieldId);
  }, []);

  // Fetch fields and AOIs on component mount - only when userId changes
  useEffect(() => {
    if (userId) {
      dispatch(getFarmFields(userId));
      dispatch(fetchAOIs());
    }
  }, [dispatch, userId]);

  // Optimized field selection logic
  useEffect(() => {
    if (fields.length === 0) return;

    const isNewFieldAdded =
      fields.length > prevFieldsLength && prevFieldsLength > 0;
    const isInitialLoad = !selectedField && prevFieldsLength === 0;

    // Always select the latest field when a new one is added
    if (isNewFieldAdded) {
      const latestField = fields[fields.length - 1]?._id;
      if (latestField) {
        handleFieldSelection(latestField);
      }
    } else if (isInitialLoad) {
      const latestField = fields[fields.length - 1]?._id;
      if (latestField) {
        handleFieldSelection(latestField);
      }
    }

    setPrevFieldsLength(fields.length);
  }, [fields, prevFieldsLength, selectedField, handleFieldSelection]);

  // Prepare payload whenever a new field is selected
  const payload = useMemo(() => {
    if (!selectedFieldDetails?.field?.length) return null;

    const geometryCoords = formatCoordinates(selectedFieldDetails.field);

    return {
      name: selectedFieldDetails?._id,
      geometry: {
        type: "Polygon",
        coordinates: [geometryCoords],
      },
    };
  }, [selectedFieldDetails]);

  // Dispatch createAOI when payload changes, but only if AOI doesn't already exist
  useEffect(() => {
    if (payload && payload.geometry.coordinates[0].length > 0) {
      const existingAOI = aois.find((aoi) => aoi.name === payload.name);
      if (!existingAOI) {
        dispatch(createAOI(payload));
      }
    }
  }, [payload, dispatch, aois]);

  // Dispatch fetchForecastData when selectedFieldDetails or aois changes
  useEffect(() => {
    if (selectedFieldDetails && aois.length > 0) {
      const matchingAOI = aois.find(
        (aoi) => aoi.name === selectedFieldDetails._id
      );
      if (matchingAOI && matchingAOI.id) {
        dispatch(fetchForecastData({ geometry_id: matchingAOI.id }));
      }
    }
  }, [dispatch, selectedFieldDetails, aois]);

  // Memoized props objects to prevent unnecessary re-renders
  const mapViewProps = useMemo(
    () => ({
      markers,
      setMarkers,
      isAddingMarkers,
      setIsAddingMarkers,
      selectedField,
      setSelectedField: handleFieldSelection,
      selectedFieldsDetials: selectedFieldDetails ? [selectedFieldDetails] : [],
      fields,
    }),
    [
      markers,
      isAddingMarkers,
      selectedField,
      handleFieldSelection,
      selectedFieldDetails,
      fields,
    ]
  );

  const cropHealthProps = useMemo(
    () => ({
      selectedFieldsDetials: selectedFieldDetails ? [selectedFieldDetails] : [],
      fields,
    }),
    [selectedFieldDetails, fields]
  );

  const ndviGraphProps = useMemo(
    () => ({
      selectedFieldsDetials: selectedFieldDetails ? [selectedFieldDetails] : [],
    }),
    [selectedFieldDetails]
  );

  const cropAdvisoryProps = useMemo(
    () => ({
      selectedFieldsDetials: selectedFieldDetails ? [selectedFieldDetails] : [],
    }),
    [selectedFieldDetails]
  );

  const plantGrowthProps = useMemo(
    () => ({
      selectedFieldsDetials: selectedFieldDetails ? [selectedFieldDetails] : [],
    }),
    [selectedFieldDetails]
  );

  return (
    <div className="dashboard float-end p-1.5 lg:p-3">
      <MapView {...mapViewProps} />

      {fields.length > 0 && (
        <>
          <CropHealth {...cropHealthProps} />
          <ForeCast forecastData={forecastData} />
          <NdviGraph {...ndviGraphProps} />
          <WaterIndex {...ndviGraphProps} />
          <Insights />
          <CropAdvisory {...cropAdvisoryProps} />
          <PlantGrowthActivity {...plantGrowthProps} />
        </>
      )}
    </div>
  );
};

export default React.memo(Dashboard);
