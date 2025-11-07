import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const IndexPremiumWrapper = ({ children, isLocked, onSubscribe }) => {
  if (!isLocked) return children;

  return (
    <div className="relative">
      {/* Blurred Content */}
      <div className="filter blur-sm pointer-events-none select-none">
        {children}
      </div>

      {/* Simple Glassmorphism Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center rounded-lg"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <motion.button
          onClick={onSubscribe}
          className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 px-4 rounded-full shadow-lg transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Lock className="w-5 h-5" />
          <span>Premium Content • Subscribe to Unlock</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default IndexPremiumWrapper;