import axios from "axios";

export const checkFieldSubscription = async (fieldId, authToken) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/user-subscriptions/check/${fieldId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error checking field subscription:", error);
    return {
      success: false,
      hasActiveSubscription: false,
      message: "Error checking subscription status",
    };
  }
};
