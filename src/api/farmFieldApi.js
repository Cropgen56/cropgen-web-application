import axios from "axios";

const API_URL = "https://server.cropgenapp.com/api/auth";
// const API_URL = "http://localhost:8080/api/field";

// Add field API
export const addFieldAPI = async ({
  latlng,
  userId,
  cropName,
  variety,
  sowingDate,
  typeOfIrrigation,
  farmName,
}) => {
  try {
    const response = await axios.post(`${API_URL}/add-field/${userId}`, {
      latlng,
      cropName,
      variety,
      sowingDate,
      typeOfIrrigation,
      farmName,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding field:", error);
    throw error;
  }
};

// Get field API
export const getFieldAPI = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/get-field/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching field data:", error);
    throw error;
  }
};
