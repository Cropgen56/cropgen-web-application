import React, { useState, useEffect } from "react";
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
    <div className="flex flex-col lg:flex-row h-screen w-full bg-gray-50 overflow-hidden">
      {/* Left Side - Image/Testimonial */}
      <div className="hidden lg:block relative w-full lg:w-7/12 bg-green-900">
        <div className="absolute inset-0 bg-green-900 bg-opacity-60" />
        <div className="relative z-10 flex flex-col h-full p-6 sm:p-8 lg:p-10">
          {/* Logo */}
          <div className="flex items-center gap-2 text-white text-lg sm:text-2xl font-semibold">
            <Logo className="cursor-pointer" />
            <span className="text-xl cursor-pointer">CropGen</span>
          </div>

          {/* Heading */}
          <div className="mt-6 sm:mt-8">
            <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
              Smart Farming,
              <br />
              Simple Access.
            </h2>
          </div>

          {/* Testimonial Card */}
          <div className="mt-auto pb-6 w-full flex justify-center">
            <div className="bg-white/20 p-4 sm:p-5 rounded-xl max-w-sm w-full text-white backdrop-blur-md">
              <p className="text-sm sm:text-base mb-3 leading-relaxed line-clamp-4">
                With CropGen, I manage my crops without stepping into the field
                daily. I get instant crop health updates, weather alerts, and
                expert advice on my phone. It saves time, water, and effort.
                This is the future of farming.
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full bg-gray-300"
                  aria-hidden="true"
                ></div>
                <div>
                  <p className="text-sm sm:text-base font-semibold">
                    Ram Kishan
                  </p>
                  <p className="text-xs sm:text-sm text-white/80">
                    Rajasthan Farmer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup/Login Form */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-4 sm:p-6  h-full ">
        {/* <div className="w-full max-w-sm"> */}
        {activeTab === "SignUp" ? (
          <Signup setActiveTab={setActiveTab} />
        ) : (
          <Login setActiveTab={setActiveTab} />
        )}
        {/* </div> */}
      </div>
    </div>
  );
};

export default AuthLayout;
