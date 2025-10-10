import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const fetchAllSubscriptions = async () => {
    const token = localStorage.getItem("authToken");

    try {
        const response = await axios.get(`${API_URL}/api/subscription`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching subscriptions:", error);
        throw error.response?.data || error;
    }
};
