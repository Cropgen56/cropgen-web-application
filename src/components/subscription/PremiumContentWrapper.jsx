import React from "react";
import { motion } from "framer-motion";
import { Lock, Crown } from "lucide-react";

// Wrapper for premium content sections dahsboard and premium page
const PremiumContentWrapper = ({ children, isLocked, onSubscribe, title }) => {
  if (!isLocked) return children;

  return (
    <div className="relative ">
      {/* Blurred Content */}
      <div className="filter blur-sm h-full pointer-events-none select-none">
        {children}
      </div>

      {/* Glassmorphism Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center rounded-2xl"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <div className="text-center p-6 max-w-sm">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-700 shadow-lg"
          >
            <Lock className="w-8 h-8 text-white" />
          </motion.div>

          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Premium Content
          </h3>

          {title && (
            <p className="text-gray-600 mb-4">
              Unlock {title} with our premium subscription
            </p>
          )}

          <motion.button
            onClick={onSubscribe}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Crown className="w-5 h-5" />
            Subscribe to Preview
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default PremiumContentWrapper;
