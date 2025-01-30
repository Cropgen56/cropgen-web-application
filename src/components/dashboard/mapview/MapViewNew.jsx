import React, { useState, useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  ImageOverlay,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./MapViewNew.css";
import { useSelector } from "react-redux";

const FarmMap = ({ farmDetails }) => {
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [polygonBounds, setPolygonBounds] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const mapRef = useRef(null);
  const polygonCoordinates =
    [
      {
        lat: 19.5633729447461,
        lng: 77.8456455378892,
      },
      {
        lat: 19.5635750038991,
        lng: 77.8476622825523,
      },
      {
        lat: 19.5612715145442,
        lng: 77.8477051920133,
      },
      {
        lat: 19.5607461527145,
        lng: 77.845452445315,
      },
    ] || [];

  // Utility function to safely parse JSON
  const parseJSON = (data) => {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error("Invalid JSON data:", data, error);
      return null;
    }
  };

  // Calculate polygon centroid
  const calculatePolygonCentroid = (coordinates) => {
    if (coordinates.length < 3) return { centroidLat: null, centroidLng: null };

    let sumX = 0;
    let sumY = 0;
    let area = 0;

    coordinates.forEach((current, i) => {
      const next = coordinates[(i + 1) % coordinates.length];
      const crossProduct = current.lat * next.lng - next.lat * current.lng;
      area += crossProduct;
      sumX += (current.lat + next.lat) * crossProduct;
      sumY += (current.lng + next.lng) * crossProduct;
    });

    area /= 2;
    return {
      centroidLat: sumX / (6 * area),
      centroidLng: sumY / (6 * area),
    };
  };

  // Calculate polygon bounds
  const calculatePolygonBounds = (coordinates) => {
    if (coordinates.length === 0) return null;

    const lats = coordinates.map(({ lat }) => lat);
    const lngs = coordinates.map(({ lng }) => lng);

    const southWest = [Math.min(...lats), Math.min(...lngs)];
    const northEast = [Math.max(...lats), Math.max(...lngs)];

    return [southWest, northEast];
  };

  // Set map centroid and bounds when polygonCoordinates change
  useEffect(() => {
    if (polygonCoordinates.length > 0) {
      const { centroidLat, centroidLng } =
        calculatePolygonCentroid(polygonCoordinates);
      setLat(centroidLat);
      setLng(centroidLng);
      setPolygonBounds(calculatePolygonBounds(polygonCoordinates));
    }
  }, [polygonCoordinates]);

  // Handle map events
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setLat(e.latlng.lat);
        setLng(e.latlng.lng);
      },
    });
    return null;
  };

  return (
    <div className="farm-map">
      {lat !== null && lng !== null ? (
        <MapContainer
          center={[lat, lng]}
          zoom={17}
          zoomControl={false}
          className="farm-map__map-container"
          whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
        >
          {/* {loading && (
            <div className="farm-map__spinner-overlay">
              <Loading />
            </div>
          )} */}
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
              interactive={true}
            />
          )}
          <MapEvents />
        </MapContainer>
      ) : (
        <div>Loading Map...</div>
      )}
    </div>
  );
};

export default FarmMap;
