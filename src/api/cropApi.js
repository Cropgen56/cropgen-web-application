import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const getCrops = async () => {
    const response = await axios.get(`${API_URL}/api/crop/get-crop-list`);
    return response.data;
};