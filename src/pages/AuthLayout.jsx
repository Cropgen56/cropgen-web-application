import React, { useState, useEffect } from "react";
import Signup from "../components/AuthLayout/signup/Signup";
import { loadLocalStorage, decodeToken } from "../redux/slices/authSlice";
import { useDispatch } from "react-redux";

// Images
import defaultBg from "../assets/image/Group 523.png"; // Desktop
import tabletBg from "../assets/image/image copy.png"; // Tablet-specific

import weather from "../assets/image/login/weather.png";
import soilTemp from "../assets/image/login/soil t.png";
import soilMois from "../assets/image/login/soil m.png";
import sattelite from "../assets/image/login/satellite.png";
import laptop from "../assets/image/login/laptop-overlay.png";
import ndvi from "../assets/image/login/ndvi.png";
import logo from "../assets/image/login/logo.png";
import { User } from "lucide-react";

const AuthLayout = () => {
  const dispatch = useDispatch();

  const [animate, setAnimate] = useState(false);
  const [height, setHeight] = useState(window.innerHeight);
  const [width, setWidth] = useState(window.innerWidth);
  const isTablet = width <= 1139 && height <= 1367;

  useEffect(() => {
    dispatch(loadLocalStorage());
    dispatch(decodeToken());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setHeight(window.innerHeight);
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden font-poppins">
      {/* Background Image Switch */}
      <img
        src={isTablet ? tabletBg : defaultBg}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0 transition-all duration-500 ease-in-out"
        style={{
          objectPosition: isTablet ? "22% center" : "center center",
        }}
      />

      {/* Overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: "linear-gradient(180deg, #344E41CC 10%, #344E411A 80%)",
        }}
      />
      {width <= 1023 && (
        <div className="absolute top-6 left-6 z-30">
          <img src={logo} alt="CropGen Logo" className="h-12 lg:h-16 w-auto" />
        </div>
      )}

      {/* Main Layout */}
      <div
        className={`relative z-20 w-full h-full p-4 sm:p-8 flex ${isTablet
            ? "flex-col items-center justify-center"
            : "flex-row items-center justify-between"
          }`}
      >
        {/* Left Panel */}
        {!isTablet && (
          <div className="flex flex-col justify-between h-full w-[60%] text-white">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="h-12 lg:h-16 w-auto" />
            </div>

            {/* Testimonial */}
            <div className="flex justify-start mt-4 lg:mt-10">
              <div className="bg-white/20 backdrop-blur-md p-4 rounded-xl max-w-xs text-white shadow">
                <p className="text-[12px] font-semibold leading-relaxed mb-2">
                  With Cropgen, I manage my crops without stepping into the field daily.
                  I get instant crop health updates, weather alerts, and expert advice on my phone.
                  It saves time, water, and effort.
                </p>
                <div className="flex items-center gap-2">
                  <div className="bg-gray-300 p-1 rounded-full">
                    <User className="text-white w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold leading-tight">Kishor Adkine</p>
                    <p className="text-[10px] leading-tight">Maharashtra, Farmer</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Section */}
            <div className="relative w-full flex justify-center items-end mt-10 mb-4 z-20 -translate-x-4 lg:-translate-x-12">
              <div className="relative" style={{ width: height >= 800 ? "70%" : "50%" }}>
                <img
                  src={sattelite}
                  className={`absolute left-1/2 transform -translate-x-1/2 w-[55%] z-[4] pointer-events-none ${animate ? "animate-satelliteMove" : ""
                    }`}
                  style={{
                    top: "-68px",
                  }}
                  alt="Satellite"
                />

                <img
                  src={laptop}
                  alt="Laptop"
                  className="relative z-10 w-full object-contain"
                />
              </div>

              {/* Floating Cards */}
              <img
                src={weather}
                className={`absolute w-36 rounded-md z-30 ${animate ? "animate-floatUp" : ""}`}
                style={{
                  top: "10%",
                  left: height < 800 ? "20%" : "12%",
                }}
                alt="Weather"
              />
              <img
                src={soilTemp}
                className={`absolute w-20 rounded-md z-30 ${animate ? "animate-floatUp" : ""}`}
                style={{
                  left: height < 800 ? "28%" : "20%",
                  bottom: "25%",
                }}
                alt="Soil Temp"
              />
              <img
                src={soilMois}
                className={`absolute w-20 rounded-md z-30 ${animate ? "animate-floatDown" : ""}`}
                style={{
                  right: height < 800 ? "28%" : "18%",
                  top: "17%",
                }}
                alt="Soil Moisture"
              />
              <img
                src={ndvi}
                className={`absolute w-36 rounded-md z-30 ${animate ? "animate-floatDown" : ""}`}
                style={{
                  right: height < 800 ? "20%" : "10%",
                  bottom: "20%",
                }}
                alt="NDVI"
              />
            </div>

            {/* Tagline */}
            <div className="text-center z-30 mb-8">
              <h2 className="text-lg lg:text-3xl font-bold">Your Smart Farming Assistant</h2>
              <p className="text-xs lg:text-[12px] font-semibold mt-1 max-w-md mx-auto">
                Powered by satellite insights, CropGen helps you detect, decide, and grow better—field by field.
              </p>
            </div>
          </div>
        )}

        {/* Right Panel: Signup */}
        <div className="w-full lg:w-[45%] flex justify-center items-center h-full z-30">
          <Signup />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
