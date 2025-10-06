import React, { useState, useEffect } from "react";
import Signup from "../components/AuthLayout/signup/Signup";
import { loadLocalStorage, decodeToken } from "../redux/slices/authSlice";
import { useDispatch } from "react-redux";
import laptop from "../assets/image/login/laptop-overlay.png";
import logo from "../assets/image/login/logo.png";
import sphere from "../assets/image/login/Desktop-background.svg";
import keywordBg from "../assets/image/login/keyword-bg.svg";


const AuthLayout = () => {
    const dispatch = useDispatch();
    const [animate, setAnimate] = useState(false);
    const [height, setHeight] = useState(window.innerHeight);
    const [width, setWidth] = useState(window.innerWidth);
    const isTablet = width <= 1024;

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
            {!isTablet ? (
                <div className="flex flex-row w-full h-full">
                    <div className="w-1/2 relative h-full bg-[#344E41]">
                        <div className="absolute top-4 left-4 lg:top-6 lg:left-6 flex items-center gap-2">
                            <img src={logo} alt="Logo" className="h-12 lg:h-20 w-auto" />
                        </div>
                        <div className="flex flex-col gap-4 justify-center items-center h-full w-full">
                            <div className="lg:mt-20 mt-32 mx-6 lg:mx-0 text-center">
                                <h2 className="text-xl lg:text-3xl font-bold text-white [text-shadow:0px_4px_4px_#00000040]">
                                    Your Smart Farming Assistant
                                </h2>
                                <p className="text-sm lg:text-base font-medium max-w-lg mb-2 text-white [text-shadow:0px_4px_4px_#00000040]">
                                    Powered by satellite insights, CropGen helps you detect, decide, and grow better—field by field.
                                </p>
                                <div className="relative mt-2 w-80 lg:w-[28rem] mx-auto">
                                    <img src={sphere} alt="Background" className="relative z-10 w-full h-auto" />
                                    {/* Clip Path Container */}
                                    <div
                                        className="absolute inset-0 z-20 w-full h-auto lg:h-[400px] rounded-full overflow-hidden flex items-center justify-center"
                                        style={{
                                            clipPath: "circle(50% at 50%)",
                                        }}
                                    >
                                        <img
                                            src={keywordBg}
                                            alt="Keywords"
                                            className="max-w-[75%] max-h-[85%] object-contain animate-[spin_12s_linear_infinite]"
                                        />
                                    </div>
                                    <img src={laptop} alt="Laptop" className="absolute left-[-6rem] top-1/2 -translate-y-1/2 z-30 w-80 lg:w-[500px] xl:w-[600px] max-w-full" />
                                    <div className="absolute inset-0 rounded-full bg-white/20 blur-3xl animate-[spin_12s_linear_infinite]" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-1/2 flex justify-center items-center h-full ">
                        <Signup />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col w-full h-full z-40">
                    <div className="relative w-full h-[30%] bg-[#344E41] flex">
                        <div className="flex-1 flex justify-start items-center px-4 relative">
                            <div className="absolute w-[350px] h-[350px] top-[30%] pointer-events-none">
                                <img src={sphere} alt="Background" className="relative z-10 w-full h-auto" />


                                <div
                                    className="absolute inset-0 z-20 w-full h-full rounded-full overflow-hidden flex items-center justify-center"
                                    style={{
                                        clipPath: "circle(50% at 50%)",
                                    }}
                                >
                                    <img
                                        src={keywordBg}
                                        alt="Keywords"

                                        className="max-w-[75%] max-h-[85%] object-contain animate-[spin_12s_linear_infinite]"
                                    />
                                </div>

                                <img
                                    src={laptop}
                                    alt="Laptop"
                                    className="absolute left-[-2rem] top-1/2 -translate-y-1/2 z-30 w-[300px] max-w-full"
                                />
                                <div className="absolute inset-0 rounded-full bg-white/20 blur-3xl animate-[spin_12s_linear_infinite]" />
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-center items-start px-4">
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                <img src={logo} alt="Logo" className="h-20 w-auto" />
                            </div>
                            <div className="mt-28 mx-2 text-left">
                                <h2 className="text-[28px] font-bold text-white text-center [text-shadow:0px_4px_4px_#00000040]">
                                    Your Smart Farming Assistant
                                </h2>
                                <p className="text-[14px] font-medium text-white text-center [text-shadow:0px_4px_4px_#00000040] max-w-[90%]">
                                    Powered by satellite insights, CropGen helps you detect, decide, and grow better—field by field.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="h-[55%]  bg-white flex-grow flex">
                        <Signup />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthLayout;