import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { Layout, Button } from "antd";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.js";
import * as ELG from "esri-leaflet-geocoder";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Calender, LeftArrow, RightArrow } from "../../assets/DashboardIcons";
import "./AddFieldMap.css";

const { Content } = Layout;

const AddFieldMap = () => {
  const [markers, setMarkers] = useState([]);
  const [isAddingMarkers, setIsAddingMarkers] = useState(false);
  const mapRef = useRef();

  const customMarkerIcon = new L.Icon({
    iconUrl: markerIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: markerShadow,
    shadowSize: [41, 41],
  });

  const Markers = () => {
    useMapEvents({
      click: (e) => {
        if (isAddingMarkers) {
          const { lat, lng } = e.latlng;
          setMarkers((currentMarkers) => {
            const newMarkers = [...currentMarkers, { lat, lng }];
            return newMarkers.length > 12 ? newMarkers.slice(-12) : newMarkers;
          });
        }
      },
    });
    return null;
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const searchControl = new ELG.Geosearch().addTo(mapRef.current);

    searchControl.on("results", function (data) {
      if (data.results.length > 0) {
        const { latlng } = data.results[0];
        setMarkers((currentMarkers) => [...currentMarkers, latlng]);
        mapRef.current.setView(latlng, 10);
      }
    });
  }, []);

  const toggleAddMarkers = () => setIsAddingMarkers((prev) => !prev);

  return (
    <Layout className="map-layout add-field">
      <Content className="map-content">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={30}
          zoomControl={true}
          className="map-container"
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance;
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />

          {markers.map((marker, idx) => (
            <Marker
              key={idx}
              position={[marker.lat, marker.lng]}
              icon={customMarkerIcon}
            >
              <Popup>
                A pretty CSS3 popup.
                <br />
                Easily customizable.
              </Popup>
            </Marker>
          ))}

          {markers.length > 0 && (
            <Polygon
              positions={markers.map((marker) => [marker.lat, marker.lng])}
              color="purple"
            />
          )}
          <Markers />
          <ZoomControl />
        </MapContainer>

        <div className="map-controls">
          <Button onClick={() => setMarkers([])} className="delete-markers-btn">
            Delete Markers
          </Button>
        </div>

        <div className="add-field-button">
          <div className="d-flex justify-content-between mx-auto">
            <div className="add-field-left-arrow">
              <button>
                <Calender />
              </button>
              <button>
                <LeftArrow />
              </button>
            </div>
            <button onClick={toggleAddMarkers} className="add-field">
              Add Field
            </button>
            <button className="add-field-right-arrow">
              <RightArrow />
            </button>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default AddFieldMap;