import React, { useState } from "react";
import Signup from "../components/AuthLayout/signup/Signup";
import Login from "../components/AuthLayout/login/Login";
import { Logo } from "../assets/Icons.jsx"; // Your logo component
import "../style/AuthLayout.css";

const AuthLayout = () => {
  const [activeTab, setActiveTab] = useState("SignUp");

  return (
    <div className="auth-container">
      {/* Left - Image + Overlay */}
      <div className="auth-image">
        <div className="overlay" />
        <div
          style={{
            position: "relative",
            height: "100%",
            padding: "2rem",
            color: "white",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Logo at top */}
          <div style={{ marginBottom: 20 }}>
            <Logo />
          </div>

          {/* Heading */}
          <h2 style={{ fontWeight: "bold", fontSize: "2.5rem", marginBottom: "auto" }}>
            Smart Farming,<br />Simple Access.
          </h2>

          {/* Testimonial card near bottom, horizontally centered */}
          <div
            style={{
              position: "absolute",
              bottom: "4rem",      // distance from bottom
              left: "50%",
              transform: "translateX(-50%)",
              maxWidth: 360,
              width: "90%",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(255 255 255 / 0.2)",
                borderRadius: "1rem",
                padding: "1.5rem",
                color: "white",
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              }}
            >
              <p style={{ fontSize: "0.9rem", lineHeight: "1.4rem", marginBottom: "1rem" }}>
                With CropGen, I now manage my crops without stepping into the field every day.
                I get instant crop health updates, weather alerts, and expert advice all on my phone.
                It saves me time, water, and effort. This is the future of farming.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="Ram Kishan"
                  style={{ width: 40, height: 40, borderRadius: "50%" }}
                />
                <div>
                  <p style={{ margin: 0, fontWeight: "bold" }}>Ram Kishan</p>
                  <p style={{ margin: 0, fontSize: "0.85rem" }}>Rajasthan Farmer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Form Section */}
      <div className="auth-form">
        <div>
          {activeTab === "SignUp" ? (
            <Signup setActiveTab={setActiveTab} />
          ) : (
            <Login setActiveTab={setActiveTab} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
