import axios from "axios";

export const getCrops = async () => {
  const response = await axios.get(
    "https://server.cropgenapp.com/v1/api/crop/get-crop-list",
  );
  return response.data;
};
