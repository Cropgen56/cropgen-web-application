import React from "react";
import { motion } from "framer-motion";
import { Lock, Crown } from "lucide-react";

/**
 * Wraps content that requires a premium subscription.
 * The parent component is responsible for any card shell / header — this
 * component only adds a blur + lock overlay when `isLocked` is true.
 */
const PremiumContentWrapper = ({ children, isLocked, onSubscribe, title }) => {
  if (!isLocked) return children;

  return (
    <div className="relative rounded-xl overflow-hidden">
      {/* Blurred content preview */}
      <div className="filter blur-sm pointer-events-none select-none">
        {children}
      </div>

      {/* Lock overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <div className="text-center p-6 max-w-xs">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="mb-3 inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-700 shadow-lg"
          >
            <Lock className="w-7 h-7 text-white" />
          </motion.div>

          <p className="text-sm text-gray-600 mb-4">
            Subscribe to unlock{" "}
            <span className="font-semibold text-[#344E41]">{title}</span>
          </p>

          <motion.button
            onClick={onSubscribe}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md transition-all duration-300 text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Crown className="w-4 h-4" />
            Subscribe to Preview
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default PremiumContentWrapper;
