import axios from "axios";

const CROP_API_BASE = "https://server.cropgenapp.com/v1";

export const getCrops = async () => {
  const response = await axios.get(`${CROP_API_BASE}/api/crop/get-crop-list`);
  return response.data;
};
