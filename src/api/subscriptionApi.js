import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Fetch all subscriptions
export const fetchAllSubscriptions = async (token) => {
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

// Create user subscription and initiate Razorpay payment
export const createSubscription = async (subscriptionData, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/user-subscriptions`,
      subscriptionData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error.response?.data || error;
  }
};

// Verify payment and activate subscription
export const verifySubscriptionPayment = async (
  subscriptionId,
  paymentData,
  token
) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/user-subscriptions/${subscriptionId}/verify`,
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error.response?.data || error;
  }
};
