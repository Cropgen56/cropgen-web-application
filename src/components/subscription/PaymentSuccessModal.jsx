import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, Sparkles, ArrowRight, Calendar, Shield, Zap, Star, Check } from 'lucide-react';

const Confetti = ({ isActive }) => {
  const colors = ['#10b981', '#34d399', '#6ee7b7', '#86efac', '#4ade80', '#22c55e'];
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 1,
    size: 4 + Math.random() * 8,
    angle: Math.random() * 360,
  }));

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[10001]">
          {confettiPieces.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute"
              style={{
                left: `${piece.left}%`,
                backgroundColor: piece.color,
                width: piece.size,
                height: piece.size,
              }}
              initial={{
                y: -20,
                opacity: 1,
                rotate: 0,
                scale: 0,
              }}
              animate={{
                y: window.innerHeight + 100,
                opacity: [1, 1, 0],
                rotate: piece.angle * 3,
                scale: [0, 1, 1, 0.5],
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

const SparkleAnimation = ({ isActive }) => {
  const sparkles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    size: 8 + Math.random() * 10,
    left: 10 + Math.random() * 80,
    top: 10 + Math.random() * 80,
    delay: Math.random() * 2,
  }));

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {sparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              className="absolute pointer-events-none hidden sm:block"
              style={{
                left: `${sparkle.left}%`,
                top: `${sparkle.top}%`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                delay: sparkle.delay,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            >
              <Star
                className="text-green-400 fill-green-400"
                style={{ width: sparkle.size, height: sparkle.size }}
              />
            </motion.div>
          ))}
        </>
      )}
    </AnimatePresence>
  );
};

const PaymentSuccessModal = ({
  isOpen,
  onClose,
  fieldName,
  planName,
  features = [],
  daysLeft,
  transactionId
}) => {
  const [showFeatures, setShowFeatures] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      setShowSparkles(true);

      setTimeout(() => setShowFeatures(true), 600);

      const confettiTimeout = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      const sparkleTimeout = setTimeout(() => {
        setShowSparkles(false);
      }, 5000);

      return () => {
        clearTimeout(confettiTimeout);
        clearTimeout(sparkleTimeout);
        setShowFeatures(false);
        setShowConfetti(false);
        setShowSparkles(false);
      };
    }
  }, [isOpen]);

  const defaultFeatures = [
    'Satellite Monitoring',
    'Weather Forecast',
    'Crop Advisory',
    'Growth Tracking',
    'Insights & Analytics',
    'Soil Analysis',
  ];

  const displayFeatures = features.length > 0 ? features.slice(0, 6) : defaultFeatures;

  const getPlanColor = (plan) => {
    const planLower = plan?.toLowerCase() || '';
    if (planLower.includes('premium') || planLower.includes('pro')) return 'from-green-500 to-green-600';
    if (planLower.includes('enterprise')) return 'from-green-600 to-emerald-600';
    if (planLower.includes('basic')) return 'from-green-400 to-green-500';
    return 'from-green-500 to-green-600';
  };

  const floatAnimation = {
    initial: { y: 0 },
    animate: {
      y: [-3, 3, -3],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Confetti Layer */}
          <Confetti isActive={showConfetti} />

          <motion.div
            className="relative rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md max-h-[95vh] border border-green-500/30 overflow-hidden"
            style={{
              background: 'rgba(52, 78, 65, 0.95)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scrollable Content Wrapper */}
            <div className="overflow-y-auto max-h-[95vh] custom-scrollbar">
              <div className="p-4 sm:p-6 md:p-8">
                {/* Sparkle Animation Layer */}
                <SparkleAnimation isActive={showSparkles} />

                {/* Animated background decorations */}
                <motion.div
                  className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <motion.div
                  className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-green-500/20 to-emerald-500/20 rounded-full blur-3xl"
                  animate={{
                    scale: [1.2, 1, 1.2],
                    rotate: [360, 180, 0],
                  }}
                  transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 rounded-full hover:bg-white/10 transition-all duration-200 group z-10"
                >
                  <X className="w-4 h-4 text-white/70 group-hover:text-white" />
                </button>

                {/* Success Icon with animation */}
                <motion.div
                  className="flex justify-center mb-3 sm:mb-4 relative z-10"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <motion.div
                    className="relative"
                    variants={floatAnimation}
                    initial="initial"
                    animate="animate"
                  >
                    <motion.div
                      className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-50"
                      animate={{
                        scale: [1, 1.3, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <CheckCircle className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 text-green-400 relative" strokeWidth={1.5} />

                    {/* Rotating sparkles around the check */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center hidden sm:flex"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute"
                          style={{
                            top: '50%',
                            left: '50%',
                            transform: `rotate(${i * 120}deg) translateY(-35px)`
                          }}
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3
                          }}
                        >
                          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-green-300" />
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Content */}
                <motion.div
                  className="text-center space-y-2 sm:space-y-3 relative z-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.h2
                    className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    style={{
                      backgroundSize: "200% 200%",
                    }}
                  >
                    Payment Successful!
                  </motion.h2>

                  <div className="space-y-1.5 sm:space-y-2">
                    <p className="text-xs sm:text-sm text-white/70">
                      Your subscription has been activated for
                    </p>
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <p className="text-base sm:text-lg md:text-xl font-semibold text-white px-3 py-1 sm:px-4 sm:py-1.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 inline-block">
                        {fieldName || "Your Field"}
                      </p>
                    </motion.div>

                    {planName && (
                      <motion.div
                        className="inline-flex items-center gap-2 mt-1"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.03 }}
                      >
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 bg-gradient-to-r ${getPlanColor(planName)} rounded-full shadow-lg`}>
                          <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                          <span className="text-xs sm:text-sm text-white font-semibold">{planName} Plan</span>
                        </div>
                      </motion.div>
                    )}

                    {daysLeft && (
                      <motion.div
                        className="flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-white/60 mt-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>{daysLeft} days of premium access</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Transaction ID */}
                  {transactionId && (
                    <motion.div
                      className="text-[9px] sm:text-[10px] text-white/30 mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      Transaction ID: {transactionId}
                    </motion.div>
                  )}

                  {/* Features unlocked - SIMPLE LIST */}
                  <AnimatePresence>
                    {showFeatures && (
                      <motion.div
                        className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/10"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          className="flex items-center justify-center gap-1 sm:gap-1.5 mb-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-400" />
                          <span className="text-[10px] sm:text-xs font-semibold text-green-300">
                            Premium Features Unlocked
                          </span>
                        </motion.div>

                        {/* Simple List - Compact */}
                        <div className="space-y-1 sm:space-y-1.5 text-left max-w-xs mx-auto">
                          {displayFeatures.map((feature, idx) => (
                            <motion.div
                              key={idx}
                              className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-white/80 group cursor-default"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay: 0.6 + idx * 0.03,
                                type: "spring",
                                stiffness: 300,
                                damping: 25
                              }}
                              whileHover={{ x: 3 }}
                            >
                              {/* Simple Check */}
                              <motion.div
                                className="flex-shrink-0"
                                whileHover={{ scale: 1.2, rotate: 360 }}
                                transition={{ duration: 0.3 }}
                              >
                                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-400" strokeWidth={2.5} />
                              </motion.div>

                              {/* Feature Name */}
                              <span className="group-hover:text-white transition-colors">
                                {typeof feature === 'string' ? feature : feature.name || feature}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action button */}
                  <div className="pt-3 sm:pt-4">
                    <motion.button
                      onClick={onClose}
                      className="w-full py-2 sm:py-2.5 px-4 sm:px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 group relative overflow-hidden text-xs sm:text-sm"
                      whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(34, 197, 94, 0.3)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{
                          x: ["-100%", "100%"]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                      />
                      <span className="relative z-10">Start Exploring</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform relative z-10" />
                    </motion.button>

                    <motion.p
                      className="text-[9px] sm:text-[10px] text-white/50 mt-1.5 sm:mt-2 font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      🚀 Your farm monitoring is now supercharged!
                    </motion.p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Custom Scrollbar Styles */}
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(34, 197, 94, 0.4);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(34, 197, 94, 0.6);
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentSuccessModal;