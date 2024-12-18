import React, { useState } from "react";
import "./SocialButton.css";
import { GoogleIcon } from "../../../../assets/Globalicon";
import { useGoogleLogin } from "@react-oauth/google";

const SocialButtons = () => {
  const [userData, setUserData] = useState(null);

  // Google Login handler
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      fetchUserInfo(tokenResponse.access_token);
    },
    onError: () => {
      console.log("Login Failed");
    },
    scope: "profile email https://www.googleapis.com/auth/contacts.readonly",
  });

  // Fetch user information from Google API
  const fetchUserInfo = async (accessToken) => {
    try {
      // Get basic user info
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const userInfo = await response.json();

      // Fetch extended information (like phone number) using the People API
      const extendedResponse = await fetch(
        "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,phoneNumbers",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const extendedUserInfo = await extendedResponse.json();

      // Check if phoneNumbers exists and safely access its value
      const phoneNumber = extendedUserInfo.phoneNumbers
        ? extendedUserInfo.phoneNumbers[0].value
        : "No phone number available";

      setUserData({
        ...userInfo,
        firstName: extendedUserInfo.names
          ? extendedUserInfo.names[0].givenName
          : "",
        lastName: extendedUserInfo.names
          ? extendedUserInfo.names[0].familyName
          : "",
        phoneNumber: phoneNumber,
      });
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

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
