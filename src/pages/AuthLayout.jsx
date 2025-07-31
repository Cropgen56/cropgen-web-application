import React, { useState, useEffect } from "react";
import Signup from "../components/AuthLayout/signup/Signup";
import { loadLocalStorage, decodeToken } from "../redux/slices/authSlice.js";
import { useDispatch } from "react-redux";
import bgimage from "../assets/image/login/bgimage.svg";
import weather from "../assets/image/login/weather.png";
import soilTemp from "../assets/image/login/soil t.png";
import soilMois from "../assets/image/login/soil m.png";
import sattelite from "../assets/image/login/satellite.png";
import laptop from "../assets/image/login/laptop-overlay.png";
import ndvi from "../assets/image/login/ndvi.png";
import logo from "../assets/image/login/logo.png";

import { User } from "lucide-react";

const AuthLayout = () => {
  const [animate, setAnimate] = useState(false);
  const [height, setHeight] = useState(window.innerHeight);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadLocalStorage());
    dispatch(decodeToken());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => setHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-row h-screen w-full bg-white overflow-hidden font-poppins">
      {/* Left Side - Image/Testimonial */}
      <div className="flex relative w-[60%] h-full items-center justify-center overflow-hidden">
        {/* Background image */}
        <img
          src={bgimage}
          alt="Farming Background"
          // className="w-full h-full object-contain scale-x-[1.5] origin-center"
          className="w-full h-full object-contain md:scale-y-[1.9] lg:scale-100 md:scale-x-[1.1] lg:scale-x-[1.76] origin-center"
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
            <img
              src={logo}
              alt="CropGen Logo"
              className="w-auto md:h-12 h-20 cursor-pointer"
            />
            {/* <Logo className="w-12 h-12 cursor-pointer" />
            <span className="text-lg lg:text-xl font-medium cursor-pointer">
              CropGen
            </span> */}
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
            className="relative w-full flex justify-center items-end mt-6 lg:mt-10 mb-4 z-20"
            style={{ height: "max-content" }}
          >
            <div
              className="relative"
              style={{ width: height >= 800 ? "70%" : "50%" }}
            >
              <img
                src={sattelite}
                // className="absolute -top-32 left-1/2 transform -translate-x-1/2 w-[55%] h-auto z-4 pointer-events-none"
                className={`absolute left-1/2 transform -translate-x-1/2 w-[55%] z-[4] pointer-events-none ${
                  animate ? "animate-satelliteMove" : ""
                }`}
                style={{
                  top: window.innerWidth < 1024 ? "auto" : "-68px", // -32*4px approx
                  bottom: window.innerWidth < 1024 ? "-220px" : "auto",
                }}
                alt="Satellite"
              />
              <img
                src={laptop}
                alt="Laptop Preview"
                className="relative w-full h-auto object-contain z-20"
                style={{
                  width: window.innerWidth < 1024 ? "100%" : "auto",
                  position: window.innerWidth < 1024 ? "relative" : "relative",
                  bottom: window.innerWidth < 1024 ? "-330px" : "0px",
                }}
              />
            </div>

            {/* <div className="absolute inset-0 flex justify-between items-center pointer-events-none"> */}
            <img
              src={weather}
              // className="absolute left-[20%] top-[10%]  w-36 h-auto rounded-md z-30"
              className={`absolute w-36 rounded-md z-30 ${
                animate ? "animate-floatUp" : ""
              }`}
              // style={{ left: window.innerHeight < 800 ? "20%" : "12%" }}
              style={{
                top: window.innerWidth < 1024 ? "auto" : "10%",
                bottom: window.innerWidth < 1024 ? "-120%" : "auto",
                left:
                  window.innerWidth < 1024
                    ? "2%"
                    : window.innerHeight < 800
                    ? "20%"
                    : "12%",
              }}
              alt="Side 1"
            />
            <img
              src={soilTemp}
              // className="absolute left-[28%] bottom-[25%] w-20 h-auto rounded-md z-30"
              className={`absolute  w-20 rounded-md z-30 ${
                animate ? "animate-floatUp" : ""
              }`}
              style={{
                left:
                  window.innerWidth < 1024
                    ? "10%"
                    : window.innerHeight < 800
                    ? "28%"
                    : "20%",
                bottom: window.innerWidth < 1024 ? "-170%" : "25%",
                top: window.innerWidth < 1024 ? "auto" : "auto",
              }}
              alt="Side 2"
            />
            <img
              src={soilMois}
              // className="absolute right-[28%] top-[17%]  w-20 h-auto rounded-md z-30"
              className={`absolute w-20 rounded-md z-30 ${
                animate ? "animate-floatDown" : ""
              }`}
              style={{
                right:
                  window.innerWidth < 1024
                    ? "10%"
                    : window.innerHeight < 800
                    ? "28%"
                    : "18%",
                bottom: window.innerWidth < 1024 ? "-110%" : "auto",
                top: window.innerWidth < 1024 ? "auto" : "17%",
              }}
              alt="Side 3"
            />
            <img
              src={ndvi}
              // className="absolute right-[20%] bottom-[20%]] w-36 h-auto rounded-md z-30"
              className={`absolute w-36 rounded-md z-30 ${
                animate ? "animate-floatDown" : ""
              }`}
              style={{
                right:
                  window.innerWidth < 1024
                    ? "-5%"
                    : window.innerHeight < 800
                    ? "20%"
                    : "10%",
                bottom: window.innerWidth < 1024 ? "-163%" : "20%",
                top: window.innerWidth < 1024 ? "auto" : "auto",
              }}
              alt="Side 4"
            />
          </div>
          {/* </div> */}

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
      <div className="w-[40%] flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-10 h-screen">
        <Signup />
      </div>
    </div>
  );
};

export default AuthLayout;
