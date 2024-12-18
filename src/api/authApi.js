import axios from "axios";

const API_URL = "https://server.cropgenapp.com/api/auth";
// const API_URL = "http://localhost:8080/api/auth";

// Signup API
export const signupAPI = async (signupData) => {
  const response = await axios.post(`${API_URL}/signup`, signupData);
  return response.data;
};

// Signin API
export const signinAPI = async (signinData) => {
  const response = await axios.post(`${API_URL}/signin`, signinData);
  return response.data;
};
