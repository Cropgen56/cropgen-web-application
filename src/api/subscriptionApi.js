import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Fetch all subscriptions
export const fetchAllSubscriptions = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/api/subscription-plans`, {
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

/* ---------------- CREATE ORDER ---------------- */

export const createSubscription = async (payload, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/subscription/create-order`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/* ---------------- VERIFY PAYMENT ---------------- */

export const verifySubscriptionPayment = async (
  subscriptionId,
  paymentData,
  token,
) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/subscription/verify-order`,
      {
        subscriptionId,
        ...paymentData,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    /*
      Expected backend response:
      {
        success: true,
        data: {
          subscriptionId,
          fieldName,
          planName,
          daysLeft,
          transactionId
        }
      }
    */

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
