import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  setGoogleLoginData,
  decodeToken,
} from "../../../../redux/slices/authSlice";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function SocialButtons() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async (response) => {
    try {
      setIsLoading(true);
      const { credential } = response;

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/google`,
        {
          token: credential,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        dispatch(
          setGoogleLoginData({
            accessToken: res.data.accessToken,
            user: res.data.user,
            role: res.data.role,
            onboardingRequired: res.data.onboardingRequired,
          })
        );
        navigate("/cropgen-analytics");

        // Decode the token to update user details
        dispatch(decodeToken());
      } else {
        // Handle API error response
        alert(`Login Failed: ${res.data.message}`);
        console.error("Login Failed: ", res.data.message);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred.";
      alert(`Google Login Error: ${errorMessage}`);
      console.error("Google Login Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={() => {
          alert("Google Login Failed. Please try again.");
          console.error("Google Login Failed");
          setIsLoading(false);
        }}
        disabled={isLoading}
        text="Sign in with Google"
      />
    </GoogleOAuthProvider>
  );
}

export default SocialButtons;
