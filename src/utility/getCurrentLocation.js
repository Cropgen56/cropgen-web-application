export const getCurrentLocation = ({ setLocation }) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (position?.coords) {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        } else {
          console.error("Position coordinates are undefined.");
        }
      },
      (err) => {
        console.error("Error fetching location:", err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
};
