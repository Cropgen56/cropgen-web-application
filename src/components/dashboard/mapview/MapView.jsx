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
    <div className="flex flex-col items-center w-full md:h-[379px] lg:h-[95%] relative">
      <MapContainer
        center={centroid.lat != null ? [centroid.lat, centroid.lng] : defaultCenter}
        zoom={18}
        zoomControl={true}
        className="w-full h-full rounded-[20px] overflow-hidden"
        ref={mapRef}
        maxZoom={20}
      >
        {loading.indexData && (
          <LoadingSpinner height="100%" size={64} color="#86D72F" blurBackground={true} />
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
            positions={polygonCoordinates?.map(({ lat, lng }) => [lat, lng])}
          />
        )}
        {polygonBounds && image && (
          <ImageOverlay url={image} bounds={polygonBounds} opacity={1} interactive />
        )}
        <MoveMapToField lat={centroid.lat} lng={centroid.lng} bounds={polygonBounds} />
      </MapContainer>

      <div className="absolute right-2 z-[1000] h-[80%]">
        {fields.length > 0 && (
          <select
            id="field-dropdown"
            onChange={handleFieldChange}
            value={selectedField || ""}
            className="bg-[#010704b2] outline-none border-none rounded px-2 py-1 text-white absolute -left-[22rem] top-3 cursor-pointer scrollbar-none"
          >
            <option value="" disabled>Select a field</option>
            {fields?.map((field) => (
              <option key={field?._id} value={field?._id}>{field.fieldName}</option>
            ))}
          </select>
        )}

        <div className="legend-dropdown-wrapper absolute top-[15px] -left-40 z-[1100]">
          <strong
            onClick={() => setShowLegend(!showLegend)}
            className="bg-[#010704b2] outline-none border-none rounded text-white px-3 py-[6px] font-normal cursor-pointer"
          >
            🗺️ Legend
          </strong>

          {showLegend && indexData?.legend && indexData?.area_summary_ha && (
            <div className="legend-dropdown absolute top-20 right-5 bg-white rounded-xl p-4 z-[1000] max-w-[300px] animate-slideIn">
              {indexData.legend.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2.5 p-2.5 mb-2 rounded-lg text-[0.95rem] font-medium hover:-translate-y-[2px] hover:shadow-md transition"
                >
                  <span
                    className="w-[30px] h-[20px] rounded bg-inherit border border-black/10"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="flex-1">{item.label}</span>
                  <span className="text-gray-500 font-normal">
                    {indexData.area_summary_ha[item.label]?.toFixed(2) || "0.00"} ha
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {fields?.length > 0 ? (
        <IndexDates selectedFieldsDetials={selectedFieldsDetials} />
      ) : (
        <div className="absolute z-[1000] mt-[33rem] w-full text-white text-[1rem] bg-[#5a7c6b] rounded cursor-pointer">
          <div className="absolute bottom-[10px] left-0 w-full text-center z-[1000]">
            <div className="w-[95%] mx-auto p-2.5 bg-[#5a7c6b] rounded flex justify-between items-center">
              <div className="border-r border-white pr-2">
                <button aria-label="Calendar"><Calender /></button>
                <button aria-label="Previous"><LeftArrow /></button>
              </div>
              <button
                className="add-new-field"
                onClick={() => navigate("/addfield")}
                aria-label="Add New Field"
              >
                Add Field
              </button>
              <button className="border-l border-white pl-2" aria-label="Next">
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
