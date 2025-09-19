import React from "react";
import { motion } from "framer-motion";
import logo from "../../../assets/image/login/logo.svg"

const LogoFlipLoader = () => {
    return (
        <div className="flex justify-center items-center h-[200px] perspective-[800px]">
            <motion.img
                src={logo}
                alt="Loading..."
                className="w-[120px] h-[120px]"
                animate={{ rotateY: [0, 180, 360] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                style={{ transformStyle: "preserve-3d" }}
            />
        </div>
    );
};

export default LogoFlipLoader;
