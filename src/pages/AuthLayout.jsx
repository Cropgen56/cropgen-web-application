import React, { useState } from "react";
import "../style/AuthLayout.css";
import SignUp from "../components/AuthLayout/signup/Signnup";
import Login from "../components/AuthLayout/login/Login";
import SocialButtons from "../components/AuthLayout/shared/socialbuttons/SocialButton";
import LanguageSwitcher from "../components/AuthLayout/shared/LanguageSwitcher";
import { Logo } from "../assets/Icons.jsx";

const AuthLayout = () => {
  const [activeTab, setActiveTab] = useState("SignUp");

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
          <div className="login-body">
            <SocialButtons />
            <div className="or ">
              <hr />
              <span>OR</span>
              <hr />
            </div>
            {activeTab === "SignUp" ? <SignUp /> : <Login />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
