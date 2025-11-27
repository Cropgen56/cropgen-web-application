import api from "./api";

const API_URL = process.env.REACT_APP_API_URL;

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
    const response = await api.post(
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
    const response = await api.get(`${API_URL}/api/field/get-field/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching field data:", error);
    throw error;
  }
};

// Update field API
export const updateFieldAPI = async (fieldId, updatedData) => {
  try {
    const response = await api.patch(
      `${API_URL}/api/field/update-field/${fieldId}`,
      updatedData
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
    const response = await api.delete(
      `${API_URL}/api/field/delete-field/${fieldId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting field:", error);
    throw error;
  }
};
