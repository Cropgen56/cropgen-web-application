import React, { useState, useEffect } from "react";
import Signup from "../components/AuthLayout/signup/Signup";
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
      <div className="hidden lg:block relative w-full lg:w-1/2 bg-green-900">
        <div className="absolute inset-0 bg-green-900 bg-opacity-60" />
        <div className="relative z-10 flex flex-col h-full p-4 sm:p-6 lg:p-8 xl:p-10">
          {/* Logo */}
          <div className="flex items-center gap-2 text-white text-lg sm:text-xl lg:text-2xl font-semibold">
            <Logo className="cursor-pointer w-6 h-6 lg:w-8 lg:h-8" />
            <span className="text-lg lg:text-xl cursor-pointer">CropGen</span>
          </div>

          {/* Heading */}
          <div className="mt-6 sm:mt-8 lg:mt-10">
            <h2 className="text-white text-xl sm:text-2xl lg:text-3xl xl:text-2xl font-bold leading-tight">
              Smart Farming,
              <br />
              Simple Access.
            </h2>
          </div>

          {/* Testimonial Card */}
          <div className="mt-auto pb-4 sm:pb-6 w-full flex justify-center">
            <div className="bg-white/20 p-3 sm:p-4 lg:p-5 rounded-xl max-w-xs sm:max-w-sm w-full text-white backdrop-blur-md">
              <p className="text-xs sm:text-sm lg:text-base mb-2 sm:mb-3 leading-relaxed line-clamp-4">
                With CropGen, I manage my crops without stepping into the field
                daily. I get instant crop health updates, weather alerts, and
                expert advice on my phone. It saves time, water, and effort.
                This is the future of farming.
              </p>
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300"
                  aria-hidden="true"
                ></div>
                <div>
                  <p className="text-xs sm:text-sm lg:text-base font-semibold">
                    Kishor Adkine
                  </p>
                  <p className="text-xs sm:text-sm text-white/80">
                    Maharashtra Farmer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup/Login Form */}
      <div className="w-full lg:w-1/2 flex items-start justify-center p-4 sm:p-6 lg:p-8 xl:p-10 min-h-screen lg:min-h-0 overflow-y-auto">
        <Signup />
      </div>
    </div>
  );
};

export default AuthLayout;
