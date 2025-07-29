import React, { useState, useEffect } from "react";
import Signup from "../components/AuthLayout/signup/Signup";
import { Logo } from "../assets/Icons.jsx";
import { loadLocalStorage, decodeToken } from "../redux/slices/authSlice.js";
import { useDispatch } from "react-redux";
import bgimage from "../assets/image/login/bgimage.svg";
import weather from "../assets/image/login/weather.png";
import soilTemp from "../assets/image/login/soil t.png";
import soilMois from "../assets/image/login/soil m.png";
import sattelite from "../assets/image/login/satellite.png";
import laptop from "../assets/image/login/laptop-overlay.png";
import ndvi from "../assets/image/login/ndvi.png";

import { User } from "lucide-react";

const AuthLayout = () => {
  const [activeTab, setActiveTab] = useState("SignUp");
  const [animate, setAnimate] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadLocalStorage());
    dispatch(decodeToken());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-white overflow-hidden font-poppins">
      {/* Left Side - Image/Testimonial */}
      <div className="hidden lg:block relative w-full lg:w-1/2 h-full items-center justify-center overflow-hidden">
        {/* Background image */}
        <img
          src={bgimage}
          alt="Farming Background"
          className="w-full h-full object-contain scale-x-[1.5] origin-center"
        />

        {/* Overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "linear-gradient(180deg, #344E41CC 10%, #344E411A 80%)",
          }}
        />

        {/* Foreground Content */}
        <div className="absolute inset-0 z-20 flex flex-col h-full p-4 sm:p-6 lg:p-8 xl:p-10 text-white">
          {/* Logo */}
          <div className="flex items-center gap-2 text-white">
            <Logo className="w-12 h-12 cursor-pointer" />
            <span className="text-lg lg:text-xl font-medium cursor-pointer">
              CropGen
            </span>
          </div>

          {/* Testimonial */}
          <div className="mt-4 w-full flex justify-start z-30">
            <div className="bg-white/20 p-3 sm:p-4 lg:p-5 rounded-xl max-w-xs sm:max-w-sm w-full text-white backdrop-blur-md">
              <p className="text-xs mb-2 leading-relaxed line-clamp-4 font-semibold">
                With Cropgen, I manage my crops without stepping into the field
                daily. I get instant crop health updates, weather alerts, and
                expert advice on my phone. It saves time, water, and effort.
              </p>
              <div className="flex items-center gap-1 text-white">
                <div className="p-1 rounded-full bg-gray-300 flex items-center justify-center">
                  <User color="white" fill="white" className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold mb-0">
                    Kishor Adkine
                  </p>
                  <p className="text-[8px] mb-0">Maharashtra Farmer</p>
                </div>
              </div>
            </div>
          </div>

          <div
            className="relative w-full flex justify-center mt-6 lg:mt-10 mb-4 z-20"
            style={{ height: "max-content" }}
          >
            <div className="relative w-[60%]">
              {" "}
              <img
                src={sattelite}
                // className="absolute -top-32 left-1/2 transform -translate-x-1/2 w-[55%] h-auto z-4 pointer-events-none"
                className={`absolute -top-32 left-1/2 transform -translate-x-1/2 w-[55%] z-[4] pointer-events-none ${
                  animate ? "animate-satelliteMove" : ""
                }`}
                alt="Satellite"
              />
              <img
                src={laptop}
                alt="Laptop Preview"
                className="relative w-full h-auto object-contain z-20"
              />
            </div>

            {/* <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 flex flex-col gap-2"> */}
            <img
              src={weather}
              // className="absolute left-[15%] top-[10%] w-36 h-auto rounded-md z-30"
              className={`absolute left-[15%] top-[10%] w-36 rounded-md z-30 ${
                animate ? "animate-floatUp" : ""
              }`}
              alt="Side 1"
            />
            <img
              src={soilTemp}
              // className="absolute bottom-[25%] left-[22%] w-20 h-auto rounded-md z-30"
              className={`absolute left-[22%] bottom-[25%] w-20 rounded-md z-30 ${
                animate ? "animate-floatUp" : ""
              }`}
              alt="Side 2"
            />
            <img
              src={soilMois}
              // className="absolute top-[17%] right-[22%] w-20 h-auto rounded-md z-30"
              className={`absolute right-[22%] top-[17%] w-20 rounded-md z-30 ${
                animate ? "animate-floatDown" : ""
              }`}
              alt="Side 3"
            />
            <img
              src={ndvi}
              // className="absolute bottom-[20%] right-[15%] w-36 h-auto rounded-md z-30"
              className={`absolute right-[15%] bottom-[20%] w-36 rounded-md z-30 ${
                animate ? "animate-floatDown" : ""
              }`}
              alt="Side 4"
            />
            {/* </div> */}
          </div>

          {/* Bottom Tagline Text */}
          <div className="absolute bottom-10 w-full text-center px-4 z-30">
            <h2 className="text-white text-lg lg:text-[30px] font-bold">
              Your Smart Farming Assistant
            </h2>
            <p className="text-white text-xs md:text-base font-semibold mt-1 max-w-md mx-auto">
              Powered by satellite insights, CropGen helps you detect, decide,
              and grow better—field by field.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Signup/Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-10 h-screen">
        <Signup />
      </div>
    </div>
  );
};

export default AuthLayout;
