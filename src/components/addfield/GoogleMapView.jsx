import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

// Map container styling
const containerStyle = {
  width: "90%",
  height: "90%",
  margin: "auto",
};

// Center coordinates for India
const center = {
  lat: 20.5937, // Latitude for India
  lng: 78.9629, // Longitude for India
};

// Bright theme styles
const mapStyles = [
  {
    featureType: "all",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "all",
    elementType: "labels.text.fill",
    stylers: [{ color: "#333333" }],
  },
  {
    featureType: "all",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#dedede" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#a2daf2" }],
  },
];

const GoogleMapView = () => {
  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAP_API}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={5}
        options={{
          styles: mapStyles,
        }}
      >
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapView;
