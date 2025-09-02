import React from "react";
import { Logo } from "../../../assets/Icons";
import "./Loading.css";

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-transparent z-[1000] animate-fadeIn">
      <div className="text-center p-5 rounded-lg shadow-md bg-white text-black animate-bounceIn">
        <Logo />
        <h5 className="mt-1 text-lg animate-pulsate z-[1001]">Loading...</h5>
      </div>
    </div>
  );
};

export default Loading;
