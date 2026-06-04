import api from "./api";

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
  isBarrenLand,
}) => {
  try {
    const response = await api.post(`/api/field/add-field/${userId}`, {
        latlng,
        cropName,
        variety,
        sowingDate,
        typeOfIrrigation,
        farmName,
        acre,
        typeOfFarming,
        isBarrenLand,
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
    const response = await api.get(`/api/field/get-field/${userId}`);
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
      `/api/field/update-field/${fieldId}`,
      updatedData,
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
    const response = await api.delete(`/api/field/delete-field/${fieldId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting field:", error);
    throw error;
  }
};
