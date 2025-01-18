import React from "react";
import "./SocialButton.css";
import { GoogleIcon } from "../../../../assets/Globalicon";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SocialButtons = () => {
  const navigate = useNavigate();
  // Google Login handler
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Fetch user profile info using Axios
        const userResponse = await axios.get(
          "https://www.googleapis.com/oauth2/v1/userinfo",
          {
            params: {
              alt: "json",
              access_token: tokenResponse.access_token,
            },
          }
        );
        const user = userResponse.data;

        // Send to backend using Axios
        const backendResponse = await axios
          .post(
            "https://server.cropgenapp.com/api/auth/google-login",
            {
              access_token: tokenResponse.access_token,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
          .then((res) => {
            if (res.data.success) {
              localStorage.setItem("authToken", res.data.token);
              navigate("/");
            }
          });
      } catch (error) {
        console.error("Error during login:", error);
      }
    },
    onError: () => {
      alert("Login field try again !");
    },
    scope: "profile email https://www.googleapis.com/auth/contacts.readonly",
  });

  return (
    <div className="social-buttons pt-1">
      {/* Google Button */}
      <button className="google-btn" onClick={() => login()}>
        <span className="mx-4">
          <GoogleIcon />
        </span>
        Connect with Google
      </button>
    </div>
  );
};

export default SocialButtons;
