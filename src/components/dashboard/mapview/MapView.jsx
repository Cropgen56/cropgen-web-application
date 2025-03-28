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
import IndexSelector from "./indexdates/IndexDates";
import { resetState } from "../../../redux/slices/satelliteSlice";
import Loading from "../../comman/loading/Loading";

// calculate the centroid of the field
const calculatePolygonCentroid = (coordinates) => {
  if (coordinates.length < 3) return { centroidLat: null, centroidLng: null };

  let sumX = 0,
    sumY = 0,
    area = 0;

  coordinates.forEach((current, i) => {
    const next = coordinates[(i + 1) % coordinates.length];
    const crossProduct = current.lat * next.lng - next.lat * current.lng;
    area += crossProduct;
    sumX += (current.lat + next.lat) * crossProduct;
    sumY += (current.lng + next.lng) * crossProduct;
  });

  area /= 2;
  return { centroidLat: sumX / (6 * area), centroidLng: sumY / (6 * area) };
};

// calculate the bounds for render the image
const calculatePolygonBounds = (coordinates) => {
  if (coordinates.length === 0) return null;
  const lats = coordinates.map(({ lat }) => lat);
  const lngs = coordinates.map(({ lng }) => lng);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
};

// move the map to the selected field
const MoveMapToField = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat !== null && lng !== null) map.setView([lat, lng], 17);
  }, [lat, lng, map]);
  return null;
};

const FarmMap = ({
  fields,
  selectedField,
  setSelectedField,
  selectedFieldsDetials,
}) => {
  const [polygonBounds, setPolygonBounds] = useState(null);
  const [image, setImage] = useState(null);
  const mapRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { indexData, loading } = useSelector((state) => state.satellite);

  useEffect(() => {
    const indexImage = indexData?.result?.dense_index_image;
    setImage(indexImage ? `data:image/png;base64,${indexImage}` : null);
  }, [indexData]);

  // Memoized polygon coordinates to avoid unnecessary recalculations
  const polygonCoordinates = useMemo(
    () =>
      fields
        .find((item) => item?._id === selectedField)
        ?.field?.map(({ lat, lng }) => ({ lat, lng })) || [],
    [fields, selectedField]
  );

  // Memoized centroid calculation
  const { centroidLat, centroidLng } = useMemo(
    () => calculatePolygonCentroid(polygonCoordinates),
    [polygonCoordinates]
  );

  // Memoized polygon bounds calculation
  useEffect(() => {
    setPolygonBounds(calculatePolygonBounds(polygonCoordinates));
  }, [polygonCoordinates]);

  // Weather data fetching logic
  const updateWeatherData = useCallback(() => {
    if (centroidLat && centroidLng) {
      dispatch(
        fetchweatherData({ latitude: centroidLat, longitude: centroidLng })
      ).then((action) => {
        if (action.payload) {
          localStorage.setItem("weatherData", JSON.stringify(action.payload));
          localStorage.setItem("lastFetchTime", Date.now());
        }
      });
    }
  }, [dispatch, centroidLat, centroidLng]);

  // chek the before api call
  useEffect(() => {
    const storedFetchTime = localStorage.getItem("lastFetchTime");
    const currentTime = Date.now();

    if (
      !storedFetchTime ||
      currentTime - parseInt(storedFetchTime, 10) > 3 * 60 * 60 * 1000
    ) {
      updateWeatherData();
    }
  }, [updateWeatherData]);

  // Reset state when the selectedField changes
  useEffect(() => {
    dispatch(resetState());
  }, [selectedField, dispatch]);

  return (
    <div className="farm-map">
      <>
        <MapContainer
          center={[centroidLat ?? 20.135245, centroidLng ?? 77.156935]}
          zoom={17}
          zoomControl={false}
          className="farm-map-container"
          whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
        >
          {loading.indexData && (
            <div className="farm-map-spinner-overlay">
              <Loading />
            </div>
          )}
          <TileLayer
            attribution="© Google Maps"
            url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            subdomains={["mt0", "mt1", "mt2", "mt3"]}
            maxZoom={50}
          />
          <Polygon
            pathOptions={{ fillColor: "transparent", fillOpacity: 0 }}
            positions={polygonCoordinates.map(({ lat, lng }) => [lat, lng])}
          />
          {polygonBounds && image && (
            <ImageOverlay
              url={image}
              bounds={polygonBounds}
              opacity={1}
              interactive
            />
          )}
          <MoveMapToField lat={centroidLat} lng={centroidLng} />
        </MapContainer>
        <div className="map-controls">
          {fields.length > 0 && (
            <select
              id="field-dropdown"
              onChange={(e) => {
                console.log(e.target.value);
                setSelectedField(e.target.value);
              }}
              value={selectedField}
            >
              {fields.map((field) => (
                <option key={field?._id} value={field?._id}>
                  {field.fieldName}
                </option>
              ))}
            </select>
          )}
        </div>

        {fields.length > 0 ? (
          <IndexSelector selectedFieldsDetials={selectedFieldsDetials} />
        ) : (
          <div className="add-new-field-container">
            <div className="field-actions">
              <div className="actions-container d-flex justify-content-between mx-auto">
                <div className="action-left">
                  <button>
                    <Calender />
                  </button>
                  <button>
                    <LeftArrow />
                  </button>
                </div>
                <button
                  className="add-new-field"
                  onClick={() => navigate("/addfield")}
                >
                  Add Field
                </button>
                <button className="action-right">
                  <RightArrow />
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  );
};

export default FarmMap;
