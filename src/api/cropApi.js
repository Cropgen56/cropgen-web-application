import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const getCrops = async () => {
  const response = await axios.get(`${API_URL}/api/crop/get-crop-list`);
  return response.data;
};

export const getCropHealthYield = async (payload) => {
  const response = await axios.post(
    "https://server.cropgenapp.com/v2/api/crop-health-yield",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// NEW: Add crop advisory API
export const generateCropAdvisory = async (payload) => {
  const response = await axios.post(
    "https://server.cropgenapp.com/v2/api/generate-advisory-crop",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};
