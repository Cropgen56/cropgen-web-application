import axios from 'axios';

const API_BASE_URL = 'https://server.cropgenapp.com/v1/api';

export const checkFieldSubscription = async (fieldId, authToken) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/user-subscriptions/check/${fieldId}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error checking field subscription:', error);
    return {
      success: false,
      hasActiveSubscription: false,
      message: 'Error checking subscription status'
    };
  }
};