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
import sphere from "../assets/image/login/Desktop-background.svg";
import keywordBg from "../assets/image/login/keyword-bg.svg";


import { User } from "lucide-react";

const AuthLayout = () => {
  const dispatch = useDispatch();

  const [animate, setAnimate] = useState(false);
  const [height, setHeight] = useState(window.innerHeight);
  const [width, setWidth] = useState(window.innerWidth);
  const [scaleValue, setScaleValue] = useState(1);

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

  // // ✅ Calculate scaling factor for left panel
  // useEffect(() => {
  //   // 900px height is "full" scale, anything smaller shrinks
  //   const minHeight = 600; // stop shrinking too much
  //   const fullHeight = 900;
  //   const clampedHeight = Math.max(height, minHeight);
  //   const scale = Math.min(clampedHeight / fullHeight, 1);
  //   setScaleValue(scale);
  // }, [height]);

  return (
    <div className="relative flex flex-row w-full h-screen overflow-hidden font-poppins">
        {/* right side panel */}
        <div className="w-1/2 relative h-full bg-[#344E41]">
            {/* logo */}
            <div className="absolute top-4 left-4 lg:top-6 lg:left-6 flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-12 lg:h-20 w-auto" />
            </div>

            <div className="flex flex-col gap-4 justify-center items-center h-full w-full">
                <div className="lg:mt-20 mt-32 mx-6 lg:mx-0 text-center">
                    <h2 className="text-xl lg:text-3xl font-bold text-white [text-shadow:0px_4px_4px_#00000040]">
                        Your Smart Farming Assistant
                    </h2>
                    <p className="text-sm lg:text-base font-medium max-w-lg mb-2 text-white [text-shadow:0px_4px_4px_#00000040]">
                        Powered by satellite insights, CropGen helps you detect, decide,
                        and grow better—field by field.
                    </p>
                    {/* <img
                            src={sphere} 
                            alt="Background"
                            className="mt-6 w-80 lg:w-[28rem] drop-shadow-[0px_4px_4px_#00000040] mx-auto animate-[spin_10s_linear_infinite]"
                        /> */}
                    <div className="relative mt-2 w-80 lg:w-[28rem] mx-auto">
                    {/* Image */}
                        <img
                            src={sphere}
                            alt="Background"
                            className="relative z-10 w-full h-auto"
                        />

                        <img
                            src={keywordBg}
                            alt="Keywords"
                            className="absolute inset-0 z-20 w-full h-auto lg:h-[400px] animate-[spin_12s_linear_infinite]"
                        />
                          
                        {/* <div className="absolute inset-0 flex items-center justify-center z-30">
                                <div className="relative w-[260px] h-[240px] animate-[spin_20s_linear_infinite]">
                                    {[
                                    { label: "Farm Report", icon: "/icons/farm.png" },
                                    { label: "Soil Report", icon: "/icons/soil.png" },
                                    { label: "Smart Advisory", icon: "/icons/advisory.png" },
                                    { label: "Disease Detection", icon: "/icons/disease.png" },
                                    { label: "Operations", icon: "/icons/operations.png" },
                                    { label: "Weather Report", icon: "/icons/weather.png" },
                                    { label: "CropGen Analytics", icon: "/icons/analytics.png" },
                                    ].map((item, i, arr) => {
                                    const angle = (360 / arr.length) * i;
                                    return (
                                        <div
                                        key={i}
                                        className="absolute top-1/2 left-1/2"
                                        style={{
                                            transform: `rotate(${angle}deg) translate(130px) rotate(-${angle}deg)`,
                                        }}
                                        >
                                        <div className="flex flex-col items-center justify-center bg-white border-[3px] border-[#344E41] text-[#344E41] text-[11px] font-medium rounded-full shadow-md w-[90px] h-[90px]">
                                            <img src={item.icon} alt={item.label} className="w-6 h-6 mb-1" />
                                            <span className="text-xs text-center">{item.label}</span>
                                        </div>
                                        </div>
                                    );
                                    })}
                                </div>
                            </div> */}

                        <img
                            src={laptop}
                            alt="Laptop"
                            className="absolute left-[-6rem] top-1/2 -translate-y-1/2 z-30 w-80 lg:w-[500px] xl:w-[600px] max-w-full"
                        />          

                    {/* Rotating shadow layer */}
                    <div className="absolute inset-0 rounded-full bg-white/20 blur-3xl animate-[spin_12s_linear_infinite]" />
                    </div>
                </div>
            </div>
        </div>

        {/* Right Panel: Signup */}
        <div className="w-1/2 flex justify-center items-center h-full bg-white">
            <Signup />
        </div>
    </div>
  );
};

export default AuthLayout;
