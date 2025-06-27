import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  ImageOverlay,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  Calender,
  LeftArrow,
  RightArrow,
} from "../../../assets/DashboardIcons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchweatherData } from "../../../redux/slices/weatherSlice";
import { resetSatelliteState } from "../../../redux/slices/satelliteSlice";
import LoadingSpinner from "../../comman/loading/LoadingSpinner";
import IndexDates from "./indexdates/IndexDates";

// Helper functions
const calculatePolygonCentroid = (coordinates) => {
  if (!coordinates || coordinates.length < 3) return { lat: null, lng: null };
  let area = 0, sumX = 0, sumY = 0;
  for (let i = 0; i < coordinates.length; i++) {
    const current = coordinates[i];
    const next = coordinates[(i + 1) % coordinates.length];
    const cross = current.lat * next.lng - next.lat * current.lng;
    area += cross;
    sumX += (current.lat + next.lat) * cross;
    sumY += (current.lng + next.lng) * cross;
  }
  area /= 2;
  return { lat: sumX / (6 * area), lng: sumY / (6 * area) };
};

const calculatePolygonBounds = (coordinates) => {
  if (!coordinates || coordinates.length === 0) return null;
  const lats = coordinates.map((c) => c.lat);
  const lngs = coordinates.map((c) => c.lng);
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

const FarmMap = ({
  fields = [],
  selectedField,
  setSelectedField,
  selectedFieldsDetials,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { indexData, loading } = useSelector((state) => state?.satellite);
  const mapRef = useRef(null);
  const [image, setImage] = useState(null);
  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".legend-dropdown-wrapper")) {
        setShowLegend(false);
      }
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

  const centroid = useMemo(
    () => calculatePolygonCentroid(polygonCoordinates),
    [polygonCoordinates]
  );

  const polygonBounds = useMemo(
    () => calculatePolygonBounds(polygonCoordinates),
    [polygonCoordinates]
  );

  useEffect(() => {
    setImage(
      indexData?.image_base64
        ? `data:image/png;base64,${indexData.image_base64}`
        : null
    );
  }, [indexData]);

  const fetchWeatherData = useCallback(() => {
    if (!centroid.lat || !centroid.lng) return;
    const lastFetchTime = localStorage.getItem("lastFetchTime");
    const now = Date.now();
    const threeHours = 3 * 60 * 60 * 1000;
    if (!lastFetchTime || now - parseInt(lastFetchTime, 10) > threeHours) {
      dispatch(fetchweatherData({ latitude: centroid.lat, longitude: centroid.lng })).then((action) => {
        if (action.payload) {
          try {
            localStorage.setItem("weatherData", JSON.stringify(action.payload));
            localStorage.setItem("lastFetchTime", now.toString());
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

  const handleFieldChange = useCallback(
    (e) => setSelectedField(e.target.value),
    [setSelectedField]
  );

  const defaultCenter = [20.135245, 77.156935];

  return (
    <div className="flex flex-col items-center w-full h-[95%] relative">
      <MapContainer
        center={centroid.lat != null ? [centroid.lat, centroid.lng] : defaultCenter}
        zoom={18}
        zoomControl={true}
        className="w-full h-full rounded-[20px] overflow-hidden"
        ref={mapRef}
        maxZoom={20}
      >
        {loading.indexData && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-[1000]">
            <LoadingSpinner height="100%" size={64} color="#86D72F" blurBackground={true} />
          </div>
        )}
        <TileLayer
          attribution="© Google Maps"
          url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
          maxZoom={20}
        />
        {polygonCoordinates.length > 0 && (
          <Polygon
            pathOptions={{ fillColor: "transparent", fillOpacity: 0 }}
            positions={polygonCoordinates.map(({ lat, lng }) => [lat, lng])}
          />
        )}
        {polygonBounds && image && (
          <ImageOverlay url={image} bounds={polygonBounds} opacity={1} interactive />
        )}
        <MoveMapToField lat={centroid.lat} lng={centroid.lng} bounds={polygonBounds} />
      </MapContainer>

      <div className="absolute right-2 h-[80%] z-[1000]">
        {fields.length > 0 && (
          <select
            id="field-dropdown"
            onChange={handleFieldChange}
            value={selectedField || ""}
            className="absolute left-[-22rem] top-2 bg-[#010704b2] text-white px-3 py-1 rounded border-none outline-none cursor-pointer appearance-none"
          >
            <option value="" disabled>Select a field</option>
            {fields.map((field) => (
              <option key={field._id} value={field._id}>
                {field.fieldName}
              </option>
            ))}
          </select>
        )}

        <div className="legend-dropdown-wrapper absolute top-[15px] left-[-10rem] z-[1100]">
          <strong
            onClick={() => setShowLegend(!showLegend)}
            className="bg-[#010704b2] text-white px-2 py-1.5 rounded cursor-pointer "
          >
            🗺️ Legend
          </strong>

          {showLegend && indexData?.legend && indexData?.area_summary_ha && (
            <div className="legend-dropdown absolute top-[20px] right-[20px] bg-white rounded-xl p-4 z-[1000] max-w-[300px] animate-[slideIn_0.5s_ease-in-out] max-h-[200px] overflow-y-auto">
              {indexData.legend.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-2 p-2.5 mb-2 rounded font-medium text-sm hover:shadow transition-transform duration-200 hover:-translate-y-0.5 w-full"
                >
                  <div className="flex items-center gap-2 min-w-0 overflow-hidden ">
                    <span
                      className="w-[30px] h-[20px] rounded border border-black/10 shrink-0"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  <span className="text-gray-500 font-normal text-right whitespace-nowrap">
                    {indexData.area_summary_ha[item.label]?.toFixed(2) || "0.00"} ha
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {fields.length > 0 ? (
        <IndexDates selectedFieldsDetials={selectedFieldsDetials} />
      ) : (
        <div className="absolute bottom-5 left-0 right-0 z-[1000] px-4">
          <div className="w-full max-w-[95%] mx-auto bg-[#5a7c6b] rounded px-3 py-2 text-white flex justify-between items-center">
            <div className="flex gap-2 items-center border-r border-white pr-2">
              <button aria-label="Calendar"><Calender /></button>
              <button aria-label="Previous"><LeftArrow /></button>
            </div>
            <button
              className="text-white"
              onClick={() => navigate("/addfield")}
              aria-label="Add New Field"
            >
              Add Field
            </button>
            <button className="pl-2 border-l border-white" aria-label="Next">
              <RightArrow />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmMap;
