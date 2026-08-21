import React from "react";
import { motion } from "framer-motion";
import { Lock, Crown } from "lucide-react";

const PremiumPageWrapper = ({ children, isLocked, onSubscribe, title }) => {
  if (!isLocked) return children;

  return (
    <div className="relative w-full min-h-[70vh] overflow-hidden rounded-2xl">
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background: "rgba(52, 78, 65, 0.72)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="text-center p-8 max-w-md">
          <motion.div
            initial={{ scale: 0.5, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-2xl"
          >
            <Lock className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h3
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold text-white mb-3"
          >
            Premium Content
          </motion.h3>

          {title && (
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white/90 mb-6 text-lg font-semibold"
            >
              Unlock {title} with a plan that includes this feature
            </motion.p>
          )}

          <motion.button
            onClick={onSubscribe}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Crown className="w-5 h-5" />
            Subscribe to Unlock
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default PremiumPageWrapper;
