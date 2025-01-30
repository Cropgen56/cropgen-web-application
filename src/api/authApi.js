import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Signup API
export const signupAPI = async (signupData) => {
  const response = await axios.post(`${API_URL}/api/auth/signup`, signupData);
  return response.data;
};

// Signin API
export const signinAPI = async (signinData) => {
  const response = await axios.post(`${API_URL}/api/auth/signin`, signinData);
  return response.data;
};
