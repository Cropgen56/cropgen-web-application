import api from "./api";

export const fetchAllSubscriptions = async () => {
  const response = await api.get("/api/subscription-plans");
  return response.data.data;
};

export const createSubscription = async (payload) => {
  const response = await api.post("/api/subscription/create-order", payload);
  return response.data;
};

export const verifySubscriptionPayment = async (subscriptionId, paymentData) => {
  const response = await api.post("/api/subscription/verify-order", {
    subscriptionId,
    ...paymentData,
  });
  return response.data;
};
