import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  ImageOverlay,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchIndexDataForMap,
  clearIndexDataByType,
} from "../../../redux/slices/satelliteSlice";
import LogoFlipLoader from "../../comman/loading/LogoFlipLoader";

// Move map to field bounds with resize handling
const MoveMapToField = ({ lat, lng, bounds }) => {
  const map = useMap();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
      
      if (bounds && bounds.length === 2) {
        map.fitBounds(bounds, { 
          padding: [20, 20], 
          maxZoom: 17,
          animate: false 
        });
      } else if (lat != null && lng != null) {
        map.setView([lat, lng], 17);
      }
    }, 150);
    
    return () => clearTimeout(timer);
  }, [lat, lng, bounds, map]);
  
  return null;
};

// Component to handle map resize on mount
const MapResizer = () => {
  const map = useMap();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [map]);
  
  return null;
};

// Close polygon helper
const closePolygon = (coords) => {
  if (!coords || !coords.length) return [];
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    return [...coords, first];
  }
  return coords;
};

// Calculate centroid
const calculateCentroid = (coords) => {
  if (!coords || !coords.length) return { lat: null, lng: null };
  let x = 0, y = 0;
  coords.forEach(([lng, lat]) => {
    x += lat;
    y += lng;
  });
  return { lat: x / coords.length, lng: y / coords.length };
};

// Calculate bounds
const calculateBounds = (coords) => {
  if (!coords || !coords.length) return null;
  const lats = coords.map(([lng, lat]) => lat);
  const lngs = coords.map(([lng, lat]) => lng);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
};

// Constants
const INDEXES = ["NDVI", "NDMI", "NDRE", "TRUE_COLOR"];
const TITLES = {
  NDVI: "Crop Health",
  NDMI: "Water in Crop",
  NDRE: "Crop Stress / Maturity",
  TRUE_COLOR: "True Color Image",
};

const DEFAULT_CENTER = [20.135245, 77.156935];

const FarmReportMap = React.forwardRef(({ selectedFieldsDetials, selectedDate = null }, ref) => {
  const dispatch = useDispatch();
  const { indexDataByType, loading } = useSelector((state) => state.satellite);
  
  const hasFetchedRef = useRef(false);
  const prevFieldIdRef = useRef(null);

  const [showLegend, setShowLegend] = useState({
    NDVI: false,
    NDMI: false,
    NDRE: false,
    TRUE_COLOR: false,
  });

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const field = selectedFieldsDetials?.[0];
  const fieldId = field?._id || field?.id;

  // Debug logging
  useEffect(() => {
    console.log("=== FarmReportMap Debug ===");
    console.log("selectedFieldsDetials:", selectedFieldsDetials);
    console.log("field:", field);
    console.log("fieldId:", fieldId);
    console.log("indexDataByType:", indexDataByType);
    console.log("loading:", loading);
    console.log("===========================");
  }, [selectedFieldsDetials, field, fieldId, indexDataByType, loading]);

  // Calculate polygon coordinates
  const polygonCoordinates = useMemo(() => {
    if (!field?.field || field.field.length < 3) {
      console.log("FarmReportMap: Invalid field data - need at least 3 points");
      return [];
    }
    let coords = field.field.map(({ lat, lng }) => [lng, lat]);
    const closedCoords = closePolygon(coords);
    console.log("FarmReportMap: Calculated", closedCoords.length, "coordinate points");
    return closedCoords;
  }, [field]);

  // Calculate centroid
  const centroid = useMemo(
    () => calculateCentroid(polygonCoordinates),
    [polygonCoordinates]
  );

  // Calculate bounds
  const polygonBounds = useMemo(
    () => calculateBounds(polygonCoordinates),
    [polygonCoordinates]
  );

  // Convert coordinates for Leaflet (swap lng, lat to lat, lng)
  const leafletCoordinates = useMemo(() => {
    return polygonCoordinates.map(([lng, lat]) => [lat, lng]);
  }, [polygonCoordinates]);

  // Fetch data when field changes or on mount
  useEffect(() => {
    // Skip if no valid coordinates
    if (!polygonCoordinates.length) {
      console.log("FarmReportMap: No coordinates available, skipping fetch");
      return;
    }

    // Check if field changed
    const fieldChanged = prevFieldIdRef.current !== fieldId;
    
    // Skip if already fetched for this field and field hasn't changed
    if (hasFetchedRef.current && !fieldChanged) {
      console.log("FarmReportMap: Already fetched for field:", fieldId);
      return;
    }

    console.log("FarmReportMap: Starting data fetch for field:", fieldId);
    console.log("FarmReportMap: Coordinates count:", polygonCoordinates.length);

    // Use provided date or default to today
    const dateToUse = selectedDate || new Date().toISOString().split("T")[0];
    console.log("FarmReportMap: Using date:", dateToUse);

    // Clear previous data if field changed
    if (fieldChanged) {
      console.log("FarmReportMap: Field changed, clearing previous data");
      dispatch(clearIndexDataByType());
    }

    // Update refs
    hasFetchedRef.current = true;
    prevFieldIdRef.current = fieldId;
    setIsInitialLoad(false);

    // Fetch data for all indexes
    INDEXES.forEach((index) => {
      console.log(`FarmReportMap: Dispatching fetch for ${index}`);
      dispatch(
        fetchIndexDataForMap({
          endDate: dateToUse,
          geometry: [polygonCoordinates],
          index,
        })
      );
    });
  }, [polygonCoordinates, selectedDate, dispatch, fieldId]);

  // Reset fetch flag when field changes
  useEffect(() => {
    if (fieldId && prevFieldIdRef.current !== fieldId) {
      console.log("FarmReportMap: Field ID changed from", prevFieldIdRef.current, "to", fieldId);
      hasFetchedRef.current = false;
    }
  }, [fieldId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("FarmReportMap: Component unmounting, cleaning up");
      dispatch(clearIndexDataByType());
      hasFetchedRef.current = false;
      prevFieldIdRef.current = null;
    };
  }, [dispatch]);

  // Close legend when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".legend-dropdown-wrapper")) {
        setShowLegend({
          NDVI: false,
          NDMI: false,
          NDRE: false,
          TRUE_COLOR: false,
        });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle legend for specific index
  const toggleLegend = useCallback((indexName) => {
    setShowLegend((prev) => ({
      ...prev,
      [indexName]: !prev[indexName],
    }));
  }, []);

  // Show placeholder if no valid field data
  if (!field || !field.field || field.field.length < 3) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full p-2">
        {INDEXES.map((indexName) => (
          <div
            key={indexName}
            className="relative w-full h-[280px] rounded-xl overflow-hidden shadow-md bg-gray-800 flex items-center justify-center"
          >
            <div className="text-center p-4">
              <div className="animate-pulse">
                <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-600 rounded w-32 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-24 mx-auto"></div>
              </div>
              <p className="text-gray-400 mt-4 text-sm">
                Waiting for field data...
              </p>
            </div>
            {/* Title Label */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-[3000] bg-[#344E41] min-w-[180px] px-4 py-2 text-white text-sm md:text-base font-semibold text-center rounded-md shadow-md">
              {TITLES[indexName]}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full p-2">
      {INDEXES.map((indexName) => {
        const layer = indexDataByType?.[indexName];
        const isLoading = loading?.indexDataByType?.[indexName] ?? false;
        const imageUrl = layer?.image_base64
          ? `data:image/png;base64,${layer.image_base64}`
          : null;

        // Determine what state we're in
        const showLoader = isLoading || (isInitialLoad && !imageUrl);
        const showNoData = !isLoading && !imageUrl && !isInitialLoad;

        return (
          <div
            key={indexName}
            className="relative w-full h-[280px] rounded-xl overflow-hidden shadow-md bg-gray-900"
          >
            {/* Loading Overlay */}
            {showLoader && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-[5000] rounded-xl">
                <LogoFlipLoader />
                <p className="text-white text-sm mt-4 font-medium animate-pulse">
                  Loading {TITLES[indexName]}...
                </p>
              </div>
            )}

            {/* No Data State */}
            {showNoData && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-[4000] rounded-xl">
                <p className="text-white text-sm font-medium text-center px-4">
                  No data available for {TITLES[indexName]}
                </p>
                <button 
                  onClick={() => {
                    const dateToUse = selectedDate || new Date().toISOString().split("T")[0];
                    dispatch(
                      fetchIndexDataForMap({
                        endDate: dateToUse,
                        geometry: [polygonCoordinates],
                        index: indexName,
                      })
                    );
                  }}
                  className="mt-2 px-3 py-1 bg-[#344e41] text-white text-xs rounded hover:bg-[#5a7c6b] transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Legend Button */}
            <div className="absolute top-2 right-2 z-[5000] legend-dropdown-wrapper">
              <button
                onClick={() => toggleLegend(indexName)}
                className="flex items-center whitespace-nowrap bg-[#344e41] outline-none border border-[#344e41] rounded text-white px-3 py-1.5 font-normal cursor-pointer hover:bg-[#5a7c6b] transition-colors"
              >
                🗺️ Legend
              </button>

              {showLegend[indexName] && layer?.legend && (
                <div className="absolute top-10 right-0 bg-[#344e41] text-white rounded-lg shadow-lg max-w-[300px] max-h-[270px] overflow-y-auto z-[6000] animate-slideIn no-scrollbar">
                  <ul className="divide-y divide-white/10 list-none p-2 no-scrollbar">
                    {layer.legend.map((item, idx) => (
                      <li
                        key={`${item.label}-${idx}`}
                        className="flex items-center gap-3 p-1.5 cursor-pointer hover:bg-[#5a7c6b] transition-colors duration-200 rounded"
                      >
                        <span
                          className="w-[25px] h-[15px] rounded border border-black/10 flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="flex-1 text-sm whitespace-nowrap font-medium">
                          {item.label}
                        </span>
                        <span className="text-gray-200 text-xs font-normal whitespace-nowrap">
                          {item.hectares?.toFixed(2) || "0.00"} ha (
                          {item.percent?.toFixed(2) || "0.00"}%)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Map Container */}
            <MapContainer
              key={`map-${indexName}-${fieldId}`}
              center={
                centroid.lat != null
                  ? [centroid.lat, centroid.lng]
                  : DEFAULT_CENTER
              }
              zoom={16}
              scrollWheelZoom={false}
              dragging={false}
              doubleClickZoom={false}
              touchZoom={false}
              style={{ height: "100%", width: "100%" }}
              maxZoom={20}
              minZoom={10}
              attributionControl={false}
              zoomControl={false}
            >
              <MapResizer />
              
              <TileLayer
                attribution="© Google Maps"
                url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                subdomains={["mt0", "mt1", "mt2", "mt3"]}
                maxZoom={20}
                crossOrigin={true}
              />

              {leafletCoordinates.length > 0 && (
                <>
                  {/* Mask polygon - fills area with dark background */}
                  <Polygon
                    positions={leafletCoordinates}
                    pathOptions={{
                      fillColor: "#1a1a2e",
                      fillOpacity: 0.95,
                      color: "transparent",
                      weight: 0,
                    }}
                  />

                  {/* Image overlay */}
                  {imageUrl && polygonBounds?.length === 2 && (
                    <ImageOverlay
                      url={imageUrl}
                      bounds={polygonBounds}
                      opacity={1}
                      zIndex={500}
                    />
                  )}

                  {/* Border polygon on top */}
                  <Polygon
                    positions={leafletCoordinates}
                    pathOptions={{
                      fillColor: "transparent",
                      fillOpacity: 0,
                      color: "#22c55e",
                      weight: 3,
                    }}
                  />
                </>
              )}

              <MoveMapToField
                lat={centroid.lat}
                lng={centroid.lng}
                bounds={polygonBounds}
              />
            </MapContainer>

            {/* Title Label */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-[3000] bg-[#344E41] min-w-[180px] px-4 py-2 text-white text-sm md:text-base font-semibold text-center rounded-md shadow-md">
              {TITLES[indexName]}
            </div>
          </div>
        );
      })}
    </div>
  );
});

FarmReportMap.displayName = "FarmReportMap";

export default FarmReportMap;