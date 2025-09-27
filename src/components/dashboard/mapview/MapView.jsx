import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
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
import {
  Calender,
  LeftArrow,
  RightArrow,
} from "../../../assets/DashboardIcons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchweatherData } from "../../../redux/slices/weatherSlice";
import { resetSatelliteState } from "../../../redux/slices/satelliteSlice";
import LogoFlipLoader from "../../comman/loading/LogoFlipLoader";
import IndexDates from "./indexdates/IndexDates";

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

const FarmMap = ({ fields = [], selectedField, setSelectedField, selectedFieldsDetials }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { indexData, loading } = useSelector((state) => state?.satellite);
  const mapRef = useRef(null);
  const [image, setImage] = useState(null);
  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".legend-dropdown-wrapper")) setShowLegend(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedFieldData = useMemo(
    () => fields.find((item) => item?._id === selectedField) || {},
    [fields, selectedField]
  );
  const polygonCoordinates = useMemo(
    () => selectedFieldData.field?.map(({ lat, lng }) => ({ lat, lng })) || [],
    [selectedFieldData]
  );
  const centroid = useMemo(() => calculatePolygonCentroid(polygonCoordinates), [polygonCoordinates]);
  const polygonBounds = useMemo(() => calculatePolygonBounds(polygonCoordinates), [polygonCoordinates]);

  useEffect(() => {
    setImage(
      indexData?.image_base64 ? `data:image/png;base64,${indexData.image_base64}` : null
    );
  }, [indexData]);

  const fetchWeatherData = useCallback(() => {
    if (!centroid.lat || !centroid.lng) return;
    const lastFetchTime = localStorage.getItem("lastFetchTime");
    const currentTime = Date.now();
    const threeHours = 3 * 60 * 60 * 1000;
    if (!lastFetchTime || currentTime - parseInt(lastFetchTime, 10) > threeHours) {
      dispatch(fetchweatherData({ latitude: centroid.lat, longitude: centroid.lng })).then((action) => {
        if (action.payload) {
          try {
            localStorage.setItem("weatherData", JSON.stringify(action.payload));
            localStorage.setItem("lastFetchTime", currentTime.toString());
          } catch (e) {
            if (e.name === "QuotaExceededError") {
              console.error("localStorage quota exceeded");
              localStorage.removeItem("oldWeatherData");
            }
          }
        }
      });
    }
  }, [dispatch, centroid.lat, centroid.lng]);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  useEffect(() => {
    dispatch(resetSatelliteState());
  }, [selectedField, dispatch]);

  const handleFieldChange = useCallback((e) => {
    setSelectedField(e.target.value);
  }, [setSelectedField]);

  const defaultCenter = [20.135245, 77.156935];

  return (
    // <div className="flex flex-col items-center w-full md:h-[500px] lg:h-[95%] relative">
    <div className={`flex flex-col items-center w-full relative ${fields.length === 0 ? "h-full" : "md:h-[500px] lg:h-[95%]"} relative`}>

      <MapContainer
        center={centroid.lat != null ? [centroid.lat, centroid.lng] : defaultCenter}
        zoom={18}
        attributionControl={false}
        zoomControl={true}
        className={`w-full h-full overflow-hidden ${fields.length === 0
          ? "rounded-t-2xl rounded-b-none"
          : "rounded-2xl"
          }`}
        ref={mapRef}
        maxZoom={20}
      >
        {/* Loader Overlay ONLY over Map */}
        <AnimatePresence>
          {loading.indexData && (
            <motion.div
              key="map-loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-[1000] rounded-2xl"
            >
              <LogoFlipLoader />
              <p className="text-white text-sm mt-4 font-medium animate-pulse">
                Almost there… optimizing your field insights
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Base map */}
        <TileLayer
          attribution="© Google Maps"
          url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
          maxZoom={20}
        />

        {/* Field polygon */}
        {polygonCoordinates.length > 0 && (
          <Polygon
            pathOptions={{ fillColor: "transparent", fillOpacity: 0 }}
            positions={polygonCoordinates.map(({ lat, lng }) => [lat, lng])}
          />
        )}

        {/* Satellite overlay */}
        {polygonBounds && image && (
          <ImageOverlay url={image} bounds={polygonBounds} opacity={1} interactive />
        )}

        <MoveMapToField lat={centroid.lat} lng={centroid.lng} bounds={polygonBounds} />
      </MapContainer>


      <div className="absolute top-2 right-2 flex flex-row gap-3 items-end z-[1000]">
        {fields.length > 0 && (
          <div className="relative w-full min-w-[150px]"> {/* Ensure relative wrapper */}
            <Listbox
              value={selectedField}
              onChange={(value) => setSelectedField(value)}
            >
              <div className="relative">
                {/* Button */}
                <Listbox.Button className="bg-[#344e41] text-white rounded border px-3 py-1.5 cursor-pointer w-full">
                  {fields.find((f) => f._id === selectedField)?.fieldName ||
                    "Select a field"}
                </Listbox.Button>

                {/* Options */}
                <Listbox.Options
                  className="absolute mt-1 w-full bg-[#344e41] rounded-lg shadow-lg 
                     text-white z-50 border border-green-900 
                     max-h-[300px] overflow-y-auto no-scrollbar"
                >
                  {fields.map((field) => (
                    <Listbox.Option
                      key={field._id}
                      value={field._id}
                      className={({ active }) =>
                        `cursor-pointer select-none px-3 py-2 rounded ${active ? "bg-[#5a7c6b]" : ""
                        }`
                      }
                    >
                      {field.fieldName}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>
        )}


        {/* <div className="legend-dropdown-wrapper absolute top-3 -left-40 z-1000"> */}

     <div className="legend-dropdown-wrapper relative w-max">
  <strong
    onClick={() => setShowLegend(!showLegend)}
    className="flex items-center whitespace-nowrap bg-[#344e41] outline-none border border-[#344e41] rounded z-[3000] text-white px-3 py-1.5 font-normal cursor-pointer"
  >
    🗺️ Legend
  </strong>

  {showLegend && indexData?.legend && indexData?.area_summary_ha && (
    <div className="absolute top-12 right-0 bg-[#344e41] text-white rounded-lg shadow-lg max-w-[300px] max-h-[300px] overflow-y-auto z-[3000] animate-slideIn no-scrollbar">
      <ul className="divide-y divide-white/10 list-none p-2 no-scrollbar">
        {indexData.legend.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-3 p-2 cursor-pointer hover:bg-[#5a7c6b] transition-colors duration-200 rounded"
          >
            {/* Color box */}
            <span
              className="w-[30px] h-[20px] rounded border border-black/10"
              style={{ backgroundColor: item.color }}
            ></span>

            {/* Label */}
            <span className="flex-1 whitespace-nowrap font-medium">
              {item.label}
            </span>

            {/* Area */}
            <span className="text-gray-200 font-normal whitespace-nowrap">
              {indexData.area_summary_ha[item.label]?.toFixed(2) || "0.00"} ha
            </span>
          </li>
        ))}
      </ul>
    </div>
  )}
</div>
      </div>

      {fields?.length > 0 ? (
        <IndexDates selectedFieldsDetials={selectedFieldsDetials} />
      ) : (
        <div className="w-full text-white text-base bg-[#5a7c6b] rounded cursor-pointer">
          <div className="w-full text-center z-[1000]">
            <div className="flex justify-between items-center gap-4 p-2.5 bg-[#5a7c6b] rounded w-full">
              <div className="flex items-center gap-3 border-r border-gray-200 pr-2">
                <button aria-label="Calendar" className="border-r border-gray-200 pr-2"><Calender /></button>
                <button aria-label="Previous"><LeftArrow /></button>
              </div>
              <button
                className="add-new-field cursor-pointer"
                onClick={() => navigate("/addfield")}
                aria-label="Add New Field"
              >
                Add Field
              </button>
              <button className="border-l border-gray-200 pl-2" aria-label="Next">
                <RightArrow />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmMap;
