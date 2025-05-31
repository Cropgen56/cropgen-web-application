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
import "./MapView.css";
import {
  Calender,
  LeftArrow,
  RightArrow,
} from "../../../assets/DashboardIcons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchweatherData } from "../../../redux/slices/weatherSlice";
import { resetState } from "../../../redux/slices/satelliteSlice";
import Loading from "../../comman/loading/Loading";
import IndexDates from "./indexdates/IndexDates";
import LoadingSpinner from "../../comman/loading/LoadingSpinner";
// Calculate polygon centroid
const calculatePolygonCentroid = (coordinates) => {
  if (!coordinates || coordinates.length < 3) {
    return { lat: null, lng: null };
  }

  let area = 0;
  let sumX = 0;
  let sumY = 0;

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

// Calculate polygon bounds
const calculatePolygonBounds = (coordinates) => {
  if (!coordinates || coordinates.length === 0) {
    return null;
  }
  const lats = coordinates.map(({ lat }) => lat);
  const lngs = coordinates.map(({ lng }) => lng);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
};

// Move map to selected field
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

  // console.log(indexData);

  // close the legend dropdown on click the any where other on screen
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".legend-dropdown-wrapper")) {
        setShowLegend(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [showLegend, setShowLegend] = useState(false);

  // Memoized selected field data
  const selectedFieldData = useMemo(
    () => fields.find((item) => item?._id === selectedField) || {},
    [fields, selectedField]
  );

  // Memoized polygon coordinates
  const polygonCoordinates = useMemo(
    () => selectedFieldData.field?.map(({ lat, lng }) => ({ lat, lng })) || [],
    [selectedFieldData]
  );

  // Memoized centroid
  const centroid = useMemo(
    () => calculatePolygonCentroid(polygonCoordinates),
    [polygonCoordinates]
  );

  // Memoized bounds
  const polygonBounds = useMemo(
    () => calculatePolygonBounds(polygonCoordinates),
    [polygonCoordinates]
  );

  // Update image when indexData changes
  useEffect(() => {
    setImage(
      indexData?.image_base64
        ? `data:image/png;base64,${indexData.image_base64}`
        : null
    );
  }, [indexData]);

  // Fetch weather data with caching
  const fetchWeatherData = useCallback(() => {
    if (!centroid.lat || !centroid.lng) return;

    const lastFetchTime = localStorage.getItem("lastFetchTime");
    const currentTime = Date.now();
    const threeHours = 3 * 60 * 60 * 1000;

    if (
      !lastFetchTime ||
      currentTime - parseInt(lastFetchTime, 10) > threeHours
    ) {
      dispatch(
        fetchweatherData({ latitude: centroid.lat, longitude: centroid.lng })
      ).then((action) => {
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

  // Trigger weather data fetch
  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  // Reset satellite state on field change
  useEffect(() => {
    dispatch(resetState());
  }, [selectedField, dispatch]);

  // Handle field selection
  const handleFieldChange = useCallback(
    (e) => {
      setSelectedField(e.target.value);
    },
    [setSelectedField]
  );

  // Default center for map
  const defaultCenter = [20.135245, 77.156935];

  return (
    <div className="farm-map">
      <MapContainer
        center={
          centroid.lat != null ? [centroid.lat, centroid.lng] : defaultCenter
        }
        zoom={18}
        zoomControl={true}
        className="farm-map-container"
        ref={mapRef}
        maxZoom={20}
      >
        {loading.indexData && (
          <LoadingSpinner
            height="100%"
            size={64}
            color="#86D72F"
            blurBackground={true}
          />
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
          <ImageOverlay
            url={image}
            bounds={polygonBounds}
            opacity={1}
            interactive
          />
        )}
        <MoveMapToField
          lat={centroid.lat}
          lng={centroid.lng}
          bounds={polygonBounds}
        />
      </MapContainer>

      {/* map contorls */}
      <div className="map-controls">
        {fields.length > 0 && (
          <select
            id="field-dropdown"
            onChange={handleFieldChange}
            value={selectedField || ""}
          >
            <option value="" disabled>
              Select a field
            </option>
            {fields?.map((field) => (
              <option key={field?._id} value={field?._id}>
                {field.fieldName}
              </option>
            ))}
          </select>
        )}

        <div className="legend-dropdown-wrapper">
          <strong
            onClick={() => setShowLegend(!showLegend)}
            className="legend-button-map"
          >
            🗺️ Legend
          </strong>

          {showLegend && indexData?.legend && indexData?.area_summary_ha && (
            <div className="legend-dropdown">
              {indexData.legend.map((item) => (
                <div key={item.label} className="legend-item">
                  <span
                    className="legend-color"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="legend-key">{item.label}</span>
                  <span className="legend-area">
                    {indexData.area_summary_ha[item.label]?.toFixed(2) ||
                      "0.00"}{" "}
                    ha
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
        <div className="add-new-field-container">
          <div className="field-actions">
            <div className="actions-container d-flex justify-content-between mx-auto">
              <div className="action-left">
                <button aria-label="Calendar">
                  <Calender />
                </button>
                <button aria-label="Previous">
                  <LeftArrow />
                </button>
              </div>
              <button
                className="add-new-field"
                onClick={() => navigate("/addfield")}
                aria-label="Add New Field"
              >
                Add Field
              </button>
              <button className="action-right" aria-label="Next">
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
