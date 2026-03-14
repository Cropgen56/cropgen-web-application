import axios from "axios";

const OPENWEATHER_KEY =
  process.env.REACT_APP_OPENWEATHER_KEY || "90f5701f849c1f746ddcaac6137727f7";

export const getCityState = async ({ lat, lng, setCity, setState }) => {
  if (typeof lat !== "number" || typeof lng !== "number") {
    console.error("Invalid latitude or longitude provided.");
    return { city: null, state: null };
  }

  const url = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=5&appid=${OPENWEATHER_KEY}`;

  try {
    const response = await axios.get(url);
    if (response?.data?.length > 0) {
      setCity(response.data[0].name);
      setState(response.data[0].state);
    }
  } catch (error) {
    console.error("Error fetching location data:", error.message);
    return { city: null, state: null };
  }
};
