import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Signup API
export const signup = async (signupData) => {
  const response = await axios.post(`${API_URL}/api/auth/signup`, signupData);
  return response.data;
};

// Signin API
export const signin = async (signinData) => {
  const response = await axios.post(`${API_URL}/api/auth/signin`, signinData);
  return response.data;
};

// get user API
export const getUser = async (token) => {
  const response = await axios.get(`${API_URL}/api/auth/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// update user API
export const updateUser = async ({ id, token, updateData }) => {
  const response = await axios.patch(
    `${API_URL}/api/auth/update-user/${id}`,
    updateData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};
