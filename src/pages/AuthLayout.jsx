import React, { useState, useEffect } from "react";
import Signup from "../components/AuthLayout/signup/Signup";
import { loadLocalStorage, decodeToken } from "../redux/slices/authSlice.js";
import { useDispatch } from "react-redux";

// Images
import defaultBg from "../assets/image/Group 523.png"; // desktop background
import tabletBg from "../assets/image/image.png";      // tablet background

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
  const [bgImg, setBgImg] = useState(
    window.innerWidth <= 1024 && window.innerHeight <= 1366 ? tabletBg : defaultBg
  );

  const dispatch = useDispatch();

  // Load token
  useEffect(() => {
    dispatch(loadLocalStorage());
    dispatch(decodeToken());
  }, [dispatch]);

  // Start animation
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Track height
  useEffect(() => {
    const handleResize = () => setHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update background image on resize
  useEffect(() => {
    const updateBg = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width <= 1024 && height <= 1366) {
        setBgImg(tabletBg);
      } else {
        setBgImg(defaultBg);
      }
    };

    updateBg(); // run on mount
    window.addEventListener("resize", updateBg);
    return () => window.removeEventListener("resize", updateBg);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden font-poppins">
      {/* Fullscreen Background */}
      <img
        src={bgImg}
        alt="Farming Background"
        className="absolute inset-0 w-full h-full object-cover z-0 transition-all duration-500 ease-in-out"
        style={{
          objectPosition:
            window.innerWidth <= 1024 && window.innerHeight <= 1366
              ? "22% center" // Adjust until the laptop aligns with the hand
              : "center center",
        }}
      />


      {/* Overlay gradient */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: "linear-gradient(180deg, #344E41CC 10%, #344E411A 80%)",
        }}
      />

      {/* Main Layout */}
      <div className="relative z-20 flex flex-col lg:flex-row w-full h-full items-center justify-between p-4 sm:p-8">
        {/* Left Content */}
        <div className="hidden lg:flex flex-col justify-between h-full w-[60%] text-white">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="Logo"
              className="h-12 sm:h-26 md:h-26 lg:h-16 w-auto max-w-full"
            />
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
          <div className="relative w-full flex justify-center items-end mt-6 lg:mt-10 mb-4 z-20 -translate-x-4 lg:-translate-x-12">
            <div className="relative" style={{ width: height >= 800 ? "70%" : "50%" }}>
              {/* Satellite */}
              <img
                src={sattelite}
                className={`absolute left-1/2 transform -translate-x-1/2 w-[55%] z-[4] pointer-events-none ${animate ? "animate-satelliteMove" : ""
                  }`}
                style={{
                  top: window.innerWidth < 1024 ? "auto" : "-68px",
                  bottom: window.innerWidth < 1024 ? "-220px" : "auto",
                }}
                alt="Satellite"
              />

              {/* Laptop */}
              <img
                src={laptop}
                alt="Laptop"
                className="relative z-10 w-full object-contain"
                style={{
                  bottom: window.innerWidth < 1024 ? "-300px" : "0px",
                }}
              />
            </div>

            {/* Floating Images */}
            <img
              src={weather}
              className={`absolute w-36 rounded-md z-30 ${animate ? "animate-floatUp" : ""
                }`}
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
              alt="Weather"
            />
            <img
              src={soilTemp}
              className={`absolute w-20 rounded-md z-30 ${animate ? "animate-floatUp" : ""
                }`}
              style={{
                left:
                  window.innerWidth < 1024
                    ? "10%"
                    : window.innerHeight < 800
                      ? "28%"
                      : "20%",
                bottom: window.innerWidth < 1024 ? "-170%" : "25%",
              }}
              alt="Soil Temp"
            />
            <img
              src={soilMois}
              className={`absolute w-20 rounded-md z-30 ${animate ? "animate-floatDown" : ""
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
              alt="Soil Moisture"
            />
            <img
              src={ndvi}
              className={`absolute w-36 rounded-md z-30 ${animate ? "animate-floatDown" : ""
                }`}
              style={{
                right:
                  window.innerWidth < 1024
                    ? "-5%"
                    : window.innerHeight < 800
                      ? "20%"
                      : "10%",
                bottom: window.innerWidth < 1024 ? "-163%" : "20%",
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

        {/* Right Content - Glass Signup */}
        <div className="w-full lg:w-[45%] flex justify-center items-center h-full z-30">
          <Signup />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
