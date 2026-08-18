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

// ===================== Multi-crop: crops on a farm =====================

// Add another crop to an existing farm.
export const addCropToFieldAPI = async (fieldId, cropData) => {
  try {
    const response = await api.post(`/api/field/${fieldId}/crops`, cropData);
    return response.data;
  } catch (error) {
    console.error("Error adding crop to field:", error);
    throw error;
  }
};

// List all crops (active + historical) for a farm.
export const getCropsForFieldAPI = async (fieldId) => {
  try {
    const response = await api.get(`/api/field/${fieldId}/crops`);
    return response.data;
  } catch (error) {
    console.error("Error fetching crops for field:", error);
    throw error;
  }
};

// Edit a crop, or mark it harvested (isActive: false).
export const updateCropAPI = async (fieldId, cropId, updatedData) => {
  try {
    const response = await api.patch(
      `/api/field/${fieldId}/crops/${cropId}`,
      updatedData,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating crop:", error);
    throw error;
  }
};

// Remove a mistakenly-added crop.
export const deleteCropAPI = async (fieldId, cropId) => {
  try {
    const response = await api.delete(`/api/field/${fieldId}/crops/${cropId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting crop:", error);
    throw error;
  }
};
