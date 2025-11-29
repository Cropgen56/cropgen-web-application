import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const token = localStorage.getItem("authToken") || null;

// Add field API
export const addFieldAPI = async ({
  latlng,
  userId,
  cropName,
  variety,
  sowingDate,
  typeOfIrrigation,
  farmName,
  acre,
  typeOfFarming,
}) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/field/add-field/${userId}`,
      {
        latlng,
        cropName,
        variety,
        sowingDate,
        typeOfIrrigation,
        farmName,
        acre,
        typeOfFarming,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding field:", error);
    throw error;
  }
};

// Get field API
export const getFieldAPI = async (userId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/field/get-field/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching field data:", error);
    throw error;
  }
};


// Update field API
export const updateFieldAPI = async (fieldId, updatedData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/api/field/update-field/${fieldId}`,
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating field:", error);
    throw error;
  }
};


// Delete field API
export const deleteFieldAPI = async (fieldId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/field/delete-field/${fieldId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting field:", error);
    throw error;
  }
};
