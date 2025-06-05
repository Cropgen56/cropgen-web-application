import React, { useState, useEffect } from "react";
import "../style/AuthLayout.css";
import Signup from "../components/AuthLayout/signup/Signup";
import Login from "../components/AuthLayout/login/Login";
import { Logo } from "../assets/Icons.jsx";
import { loadLocalStorage, decodeToken } from "../redux/slices/authSlice.js";
import { useDispatch } from "react-redux";

const AuthLayout = () => {
  const [activeTab, setActiveTab] = useState("SignUp");
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadLocalStorage());
    dispatch(decodeToken());
  }, [dispatch]);

  return (
    <div className="auth-container flex flex-col md:flex-row min-h-screen w-full">
      
      {/* Left Side - Image/Testimonial - hidden on mobile */}
      <div className="auth-image hidden md:block relative w-1/2 h-full">
        <div className="absolute inset-0 bg-green-900 bg-opacity-60 z-10" />
        <div className="relative z-20 h-full flex flex-col justify-start px-10 py-10">
          {/* Logo */}
          <div className="flex items-center gap-2 text-white text-xl font-semibold">
            <Logo />
          </div>

          {/* Heading */}
          <div className="mt-10">
            <h2 className="text-white text-3xl font-bold leading-tight">
              Smart Farming,<br />Simple Access.
            </h2>
          </div>

          {/* Testimonial Card */}
          <div className="mt-auto pb-10 w-full flex justify-center">
            <div className="bg-white/20 p-3 sm:p-4 rounded-xl max-w-sm w-full text-white text-sm backdrop-blur-md">
              <p className="text-xs sm:text-sm mb-3 leading-relaxed">
                With CropGen, I now manage my crops without stepping into the field every day.
                I get instant crop health updates, weather alerts, and expert advice all on my phone.
                It saves me time, water, and effort. This is the future of farming.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="Ram Kishan"
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="text-sm font-semibold">Ram Kishan</p>
                  <p className="text-xs text-white/80">Rajasthan Farmer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup/Login Form */}
      <div className="auth-form w-full md:w-1/2 flex flex-col justify-center items-center px-4 py-6 bg-white min-h-screen">
        <div className="w-full max-w-md">
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
