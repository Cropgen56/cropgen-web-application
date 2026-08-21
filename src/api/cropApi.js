import axios from "axios";
import { API_BASE_URL } from "../config/envUrls";

const CROP_API_BASE = API_BASE_URL;

export const getCrops = async () => {
  const response = await axios.get(`${CROP_API_BASE}/api/crop/get-crop-list`);
  return response.data;
};
