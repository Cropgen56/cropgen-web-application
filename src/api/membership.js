import api from "./api";

export const checkFieldSubscription = async (fieldId) => {
  try {
    const response = await api.get(
      `/api/user-subscriptions/check/${fieldId}`,
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
