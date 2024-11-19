import React from "react";
import "./SocialButton.css";
import { FacebookIcon, GoogleIcon } from "../../../../assets/Globalicon";
import { useGoogleLogin } from "@react-oauth/google";

const SocialButtons = () => {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log("Token:", tokenResponse);
      fetchUserInfo(tokenResponse.access_token);
    },
    onError: () => {
      console.log("Login Failed");
    },
  });

  const fetchUserInfo = async (accessToken) => {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const userInfo = await response.json();
    console.log("User Info:", userInfo);
  };
  return (
    <div className="social-buttons pt-1">
      <button className="facebook-btn">
        <span className="mx-4">
          <FacebookIcon />
        </span>
        Connect with Facebook
      </button>
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
