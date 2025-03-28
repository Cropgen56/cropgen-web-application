import React, { useState } from "react";
import "../style/AuthLayout.css";
import SignUp from "../components/AuthLayout/signup/Signnup";
import Login from "../components/AuthLayout/login/Login";
import SocialButtons from "../components/AuthLayout/shared/socialbuttons/SocialButton";
import { Logo } from "../assets/Icons.jsx";
import { loadLocalStorage, decodeToken } from "../redux/slices/authSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthLayout = () => {
  const [activeTab, setActiveTab] = useState("SignUp");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(loadLocalStorage());
    dispatch(decodeToken());
  }, [dispatch]);

  const handleSuccess = (credentialResponse) => {
    console.log("Encoded JWT ID token:", credentialResponse.credential);
    // Decode and use JWT to fetch user data
  };

  const handleError = () => {
    console.log("Login Failed");
  };
  return (
    <div className="auth-container">
      {/* Left Side with Image and Text */}
      <div className="auth-image">
        <div className="overlay">
          <span className="logo">
            {" "}
            <Logo /> CropGen
          </span>
          <div className="auth-image-text ">
            <h4>Manage your fields remotely</h4>
            <p>
              Monitor the state of your crops right from the office, learn about
              the slightest changes on-the-spot, and make fast and reliable
              decisions on field treatment.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side with Forms */}
      <div className="auth-form">
        <div>
          {/* <LanguageSwitcher /> */}
          <p className="auth-form-text">
            Manage your field easier - Moniter online. Detect in real-time. Act
            smart.
          </p>
        </div>
        <div className="form-header row mx-auto">
          <div className="signup-login-button-container p-0 m-0">
            <div
              className={`signup-button ${
                activeTab === "SignUp" ? "active-tab" : ""
              }`}
            >
              <button onClick={() => setActiveTab("SignUp")}>Sign Up</button>
            </div>
            <div
              className={`signin-button ${
                activeTab === "Login" ? "active-tab" : ""
              }`}
            >
              {" "}
              <button onClick={() => setActiveTab("Login")}>Login</button>
            </div>
          </div>
          <div className="login-body py-2">
            <SocialButtons
              handleSuccess={handleSuccess}
              handleError={handleError}
            />
            <div className="or ">
              <hr />
              <span>OR</span>
              <hr />
            </div>
            {activeTab === "SignUp" ? (
              <SignUp setActiveTab={setActiveTab} />
            ) : (
              <Login />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
