import L from "leaflet";
import React, { useEffect, useRef } from "react";
import { Layout, Button } from "antd";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  useMapEvents,
  ZoomControl,
  LayersControl,
} from "react-leaflet";
import { CurrentLocation } from "../../../assets/Icons";
import "leaflet/dist/leaflet.css";
import * as ELG from "esri-leaflet-geocoder";
import { CiSearch } from "react-icons/ci";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "./MapView.css";
import NDVISelector from "./ndviselector/NdviSelector";
import {
  Calender,
  LeftArrow,
  RightArrow,
} from "../../../assets/DashboardIcons";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { BaseLayer } = LayersControl;

const MapView = ({
  markers,
  setMarkers,
  isAddingMarkers,
  selectedField,
  setSelectedField,
  fields,
}) => {
  const mapRef = useRef(null);
  const navigate = useNavigate();

  // Extract Field Coordinates
  const selectedFieldCoordinates = fields
    .filter((item) => item?._id === selectedField)
    .map((item) => item?.field?.map((point) => [point.lat, point.lng]));

  // Custom Marker Icon
  const customMarkerIcon = new L.Icon({
    iconUrl: markerIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: markerShadow,
    shadowSize: [41, 41],
  });

  // Handle Field Selection
  const handleFieldChange = (event) => {
    setSelectedField(event.target.value);
  };

  // Map Interaction for Markers
  const Markers = () => {
    useMapEvents({
      click: (e) => {
        if (isAddingMarkers) {
          const { lat, lng } = e.latlng;
          setMarkers((current) => {
            const updatedMarkers = [...current, { lat, lng }];
            return updatedMarkers.length > 12
              ? updatedMarkers.slice(-12)
              : updatedMarkers;
          });
        }
      },
    });
    return null;
  };

  // Esri Geocoder for Search Control
  useEffect(() => {
    if (!mapRef.current) return;

    const searchControl = new ELG.Geosearch({
      useMapBounds: false,
      expanded: true,
      placeholder: "Search for a location...",
    }).addTo(mapRef.current);

    searchControl.on("results", (data) => {
      if (data.results.length > 0) {
        const { latlng } = data.results[0];
        setMarkers((current) => [...current, latlng]);
        mapRef.current.setView(latlng, 12);
      }
    });
  }, [setMarkers]);

  return (
    <Layout className="map-layout-dashboard">
      <Content style={{ height: "100%", position: "relative" }}>
        {/* Map Container */}
        <MapContainer
          center={[20.1360471, 77.157196]}
          zoom={17}
          zoomControl={true}
          style={{ height: "90vh", width: "100%", borderRadius: "1rem" }}
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance;
          }}
        >
          <LayersControl position="topright">
            <BaseLayer checked name="Satellite">
              <TileLayer
                url="http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                subdomains={["mt0", "mt1", "mt2", "mt3"]}
              />
            </BaseLayer>
            <BaseLayer name="Road">
              <TileLayer
                url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                subdomains={["mt0", "mt1", "mt2", "mt3"]}
              />
            </BaseLayer>
          </LayersControl>

          {/* Field Polygon */}
          <Polygon
            positions={selectedFieldCoordinates}
            pathOptions={{ color: "#EBF7AB", fillOpacity: 0.7 }}
          />

          {/* Markers */}
          {markers.map((marker, idx) => (
            <Marker
              key={idx}
              position={[marker.lat, marker.lng]}
              icon={customMarkerIcon}
            >
              <Popup>
                Marker Location: [{marker.lat.toFixed(4)},{" "}
                {marker.lng.toFixed(4)}]
              </Popup>
            </Marker>
          ))}
          {markers.length > 2 && (
            <Polygon positions={markers.map((m) => [m.lat, m.lng])} />
          )}

          <Markers />
          <ZoomControl position="bottomright" />
        </MapContainer>

        {/* Map Controls */}
        <div className="map-controls">
          <Button
            className="current-location-btn"
            onClick={() =>
              mapRef.current?.locate({ setView: true, maxZoom: 16 })
            }
          >
            <CurrentLocation />
          </Button>

          {/* Dropdown to Change Field */}
          {fields.length > 0 && (
            <select id="field-dropdown" onChange={handleFieldChange}>
              {fields.map((field, index) => (
                <option key={field?._id} value={field?._id}>
                  {field.fieldName + " " + (index + 1)}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* NDVI Selector */}
        {fields.length > 0 ? (
          <NDVISelector />
        ) : (
          <div
            className="add-field-button"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/addfield")}
          >
            <div className="d-flex justify-content-between mx-auto">
              <div className="add-field-left-arrow">
                <button>
                  <Calender />
                </button>
                <button>
                  <LeftArrow />
                </button>
              </div>
              <button className="add-field">
                {isAddingMarkers ? "Stop Adding Markers" : "Add Field"}
              </button>
              <button className="add-field-right-arrow">
                <RightArrow />
              </button>
            </div>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default MapView;
