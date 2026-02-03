import React, { useState, useRef, useEffect, useMemo } from "react";
import { Listbox } from "@headlessui/react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  ImageOverlay,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { resetSatelliteState } from "../../redux/slices/satelliteSlice";
import SmartAdvisoryIndexDates from "./SmartAdvisoryIndexDates";

const calculatePolygonCentroid = (coordinates) => {
  if (!coordinates || coordinates.length < 3) return { lat: null, lng: null };
  let area = 0,
    sumX = 0,
    sumY = 0;
  for (let i = 0; i < coordinates.length; i++) {
    const current = coordinates[i];
    const next = coordinates[(i + 1) % coordinates.length];
    const crossProduct = current.lat * next.lng - next.lat * current.lng;
    area += crossProduct;
    sumX += (current.lat + next.lat) * crossProduct;
    sumY += (current.lng + next.lng) * crossProduct;
  }
  area /= 2;
  return {
    lat: sumX / (6 * area),
    lng: sumY / (6 * area),
  };
};

const calculatePolygonBounds = (coordinates) => {
  if (!coordinates?.length) return null;
  const lats = coordinates.map(({ lat }) => lat);
  const lngs = coordinates.map(({ lng }) => lng);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
};

const MoveMapToField = ({ lat, lng, bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null && bounds) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (lat != null && lng != null) {
      map.setView([lat, lng], 15);
    }
  }, [lat, lng, bounds, map]);
  return null;
};

// Simple Circular Loader Component
const CircularLoader = () => (
  <div className="flex flex-col items-center justify-center">
    <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
    <p className="text-white text-sm mt-3 font-medium">
      Loading satellite data...
    </p>
  </div>
);

const SmartAdvisoryMap = ({
  fields = [],
  selectedField,
  setSelectedField,
  selectedFieldsDetials,
  showFieldDropdown = false,
  height = "500px",
}) => {
  const dispatch = useDispatch();
  const { indexData, loading } = useSelector((state) => state?.satellite);

  const mapRef = useRef(null);
  const [image, setImage] = useState(null);
  const [showLegend, setShowLegend] = useState(false);

  // Sort fields in descending order (latest first)
  const sortedFields = useMemo(() => {
    return [...fields].sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (a._id && b._id) {
        return b._id.localeCompare(a._id);
      }
      return fields.indexOf(b) - fields.indexOf(a);
    });
  }, [fields]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".legend-dropdown-wrapper")) setShowLegend(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedFieldData = useMemo(
    () =>
      fields.find((item) => item?._id === selectedField?._id) ||
      selectedField ||
      {},
    [fields, selectedField],
  );

  const polygonCoordinates = useMemo(
    () => selectedFieldData.field?.map(({ lat, lng }) => ({ lat, lng })) || [],
    [selectedFieldData],
  );

  const centroid = useMemo(
    () => calculatePolygonCentroid(polygonCoordinates),
    [polygonCoordinates],
  );

  const polygonBounds = useMemo(
    () => calculatePolygonBounds(polygonCoordinates),
    [polygonCoordinates],
  );

  useEffect(() => {
    setImage(
      indexData?.image_base64
        ? `data:image/png;base64,${indexData.image_base64}`
        : null,
    );
  }, [indexData]);

  useEffect(() => {
    dispatch(resetSatelliteState());
  }, [selectedField, dispatch]);

  const defaultCenter = [20.135245, 77.156935];

  // Prepare selectedFieldsDetials for IndexDates component
  const fieldDetailsForIndex = useMemo(() => {
    if (selectedFieldsDetials && selectedFieldsDetials.length > 0) {
      return selectedFieldsDetials;
    }
    if (selectedFieldData && selectedFieldData.field) {
      return [selectedFieldData];
    }
    return [];
  }, [selectedFieldsDetials, selectedFieldData]);

  return (
    <div
      className="flex flex-col items-center w-full relative mt-2"
      style={{ height: height }}
    >
      <MapContainer
        center={
          centroid.lat != null ? [centroid.lat, centroid.lng] : defaultCenter
        }
        zoom={18}
        attributionControl={false}
        zoomControl={true}
        className="w-full h-full overflow-hidden rounded-lg"
        ref={mapRef}
        maxZoom={20}
      >
        {/* Loading Overlay with Circular Loader */}
        <AnimatePresence>
          {loading.indexData && (
            <motion.div
              key="map-loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 bg-black/60 flex items-center justify-center z-[1000] rounded-lg"
            >
              <CircularLoader />
            </motion.div>
          )}
        </AnimatePresence>

        <TileLayer
          attribution="© Google Maps"
          url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
          maxZoom={20}
        />

        {polygonCoordinates.length > 0 && (
          <>
            {/* Masking Polygon to hide white patch */}
            <Polygon
              pathOptions={{
                fillColor: "#e9ecef",
                fillOpacity: 1,
                color: "transparent",
                weight: 0,
              }}
              positions={polygonCoordinates.map(({ lat, lng }) => [lat, lng])}
            />
            {/* Field Polygon Outline */}
            <Polygon
              pathOptions={{
                fillColor: "transparent",
                fillOpacity: 0,
                color: "green",
                weight: 4,
              }}
              positions={polygonCoordinates.map(({ lat, lng }) => [lat, lng])}
            />
            {/* Satellite Overlay */}
            {polygonBounds && image && (
              <ImageOverlay
                url={image}
                bounds={polygonBounds}
                opacity={1}
                zIndex={400}
                className="leaflet-image-overlay-custom"
              />
            )}
          </>
        )}

        <MoveMapToField
          lat={centroid.lat}
          lng={centroid.lng}
          bounds={polygonBounds}
        />
      </MapContainer>

      {/* Legend and Field Dropdown */}
      <div className="absolute top-2 right-2 flex flex-row gap-2 items-end z-[1000]">
        {showFieldDropdown && fields?.length > 0 && (
          <div className="relative w-full min-w-[140px]">
            <Listbox
              value={selectedField?._id}
              onChange={(value) => {
                const field = fields.find((f) => f._id === value);
                if (field) setSelectedField(field);
              }}
            >
              <div className="relative">
                <Listbox.Button className="bg-[#344e41] text-white text-xs rounded border px-2 py-1 cursor-pointer w-full">
                  {selectedField?.fieldName ||
                    selectedField?.farmName ||
                    "Select a field"}
                </Listbox.Button>
                <Listbox.Options
                  className="absolute mt-1 w-full bg-[#344e41] rounded-lg shadow-lg 
                     text-white text-xs z-50 border border-green-900 
                     max-h-[200px] overflow-y-auto no-scrollbar"
                >
                  {sortedFields.map((field) => (
                    <Listbox.Option
                      key={field._id}
                      value={field._id}
                      className={({ active }) =>
                        `cursor-pointer select-none px-2 py-1.5 rounded ${
                          active ? "bg-[#5a7c6b]" : ""
                        }`
                      }
                    >
                      {field.fieldName || field.farmName}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>
        )}
      </div>

      {/* Index Dates Selector */}
      {fieldDetailsForIndex.length > 0 && (
        <SmartAdvisoryIndexDates selectedFieldsDetials={fieldDetailsForIndex} />
      )}
    </div>
  );
};

export default SmartAdvisoryMap;
