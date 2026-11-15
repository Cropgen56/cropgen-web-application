import api from "./api";

export const fetchAllSubscriptions = async () => {
  const response = await api.get("/api/subscription-plans");
  // `currency` is the account's price list from the server (INR for India,
  // USD elsewhere); null when it could not be determined.
  return { plans: response.data.data, currency: response.data.currency || null };
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

export const demoActivateAllSubscriptions = async (key) => {
  const response = await api.post("/api/subscription/demo-activate-all", {
    key,
  });
  return response.data;
};
