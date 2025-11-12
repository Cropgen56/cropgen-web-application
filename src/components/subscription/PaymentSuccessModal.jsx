import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, Sparkles, ArrowRight, Calendar, Shield, Zap, TrendingUp, Star } from 'lucide-react';

const Confetti = ({ isActive }) => {
  const colors = ['#10b981', '#34d399', '#6ee7b7', '#86efac', '#4ade80', '#22c55e']; // All green shades
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
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
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

// Sparkle animation component
const SparkleAnimation = ({ isActive }) => {
  const sparkles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: 8 + Math.random() * 16,
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
              className="absolute pointer-events-none"
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
      // Trigger animations
      setShowConfetti(true);
      setShowSparkles(true);
      
      // Show features after a delay
      setTimeout(() => setShowFeatures(true), 800);

      // Stop confetti after 3 seconds
      const confettiTimeout = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      // Stop sparkles after 5 seconds
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
    { name: 'Satellite Monitoring', icon: '🛰️' },
    { name: 'Weather Forecast', icon: '🌤️' },
    { name: 'Crop Advisory', icon: '🌱' },
    { name: 'Growth Tracking', icon: '📈' },
    { name: 'Insights & Analytics', icon: '📊' },
    { name: 'Soil Analysis', icon: '🔬' }
  ];

  const displayFeatures = features.length > 0 ? features : defaultFeatures;

  const getPlanColor = (plan) => {
    const planLower = plan?.toLowerCase() || '';
    if (planLower.includes('premium') || planLower.includes('pro')) return 'from-green-500 to-green-600';
    if (planLower.includes('enterprise')) return 'from-green-600 to-emerald-600';
    if (planLower.includes('basic')) return 'from-green-400 to-green-500';
    return 'from-green-500 to-green-600';
  };

  // Floating animation variants
  const floatAnimation = {
    initial: { y: 0 },
    animate: {
      y: [-5, 5, -5],
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
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
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
            className="relative rounded-3xl shadow-2xl max-w-lg w-full p-8 overflow-hidden border border-green-500/30"
            style={{
              background: 'rgba(52, 78, 65, 0.95)', // Dark green glassmorphism
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sparkle Animation Layer */}
            <SparkleAnimation isActive={showSparkles} />
            
            {/* Animated background decorations */}
            <motion.div 
              className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-green-400/30 to-emerald-400/30 rounded-full blur-3xl"
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
              className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-green-500/30 to-emerald-500/30 rounded-full blur-3xl"
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
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all duration-200 group z-10"
            >
              <X className="w-5 h-5 text-white/70 group-hover:text-white" />
            </button>

            {/* Success Icon with animation */}
            <motion.div 
              className="flex justify-center mb-6 relative z-10"
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
                  className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-60"
                  animate={{
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <CheckCircle className="w-24 h-24 text-green-400 relative" strokeWidth={1.5} />
                
                {/* Rotating sparkles around the check */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
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
                        transform: `rotate(${i * 120}deg) translateY(-60px)`
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
                      <Sparkles className="w-6 h-6 text-green-300" />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Content */}
            <motion.div 
              className="text-center space-y-4 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.h2 
                className="text-3xl font-bold bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent"
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
              
              <div className="space-y-3">
                <p className="text-white/80">
                  Your subscription has been activated for
                </p>
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="inline-block"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <p className="text-xl font-semibold text-white px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    {fieldName || "Your Field"}
                  </p>
                </motion.div>

                {planName && (
                  <motion.div 
                    className="inline-flex items-center gap-2 mt-2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className={`inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${getPlanColor(planName)} rounded-full shadow-lg`}>
                      <Shield className="w-4 h-4 text-white" />
                      <span className="text-white font-semibold">{planName} Plan</span>
                    </div>
                  </motion.div>
                )}

                {daysLeft && (
                  <motion.div
                    className="flex items-center justify-center gap-2 text-sm text-white/70 mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>{daysLeft} days of premium access</span>
                  </motion.div>
                )}
              </div>

              {/* Transaction ID */}
              {transactionId && (
                <motion.div
                  className="text-xs text-white/40 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Transaction ID: {transactionId}
                </motion.div>
              )}

              {/* Features unlocked grid */}
              <AnimatePresence>
                {showFeatures && (
                  <motion.div
                    className="mt-6 p-4 rounded-xl border border-green-400/30"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                    }}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.p 
                      className="text-sm text-green-300 font-semibold mb-3 flex items-center justify-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Zap className="w-4 h-4" />
                      Premium Features Unlocked
                    </motion.p>
                    <div className="grid grid-cols-2 gap-2">
                      {displayFeatures.slice(0, 6).map((feature, idx) => (
                        <motion.div
                          key={idx}
                          className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-white/10 hover:border-green-400/50 transition-all cursor-default"
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            backdropFilter: 'blur(10px)',
                          }}
                          initial={{ opacity: 0, scale: 0, x: -20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          transition={{ delay: 0.7 + idx * 0.05 }}
                          whileHover={{ 
                            scale: 1.05,
                            boxShadow: "0 5px 15px rgba(34, 197, 94, 0.2)"
                          }}
                        >
                          <motion.span 
                            className="text-base"
                            animate={{
                              rotate: [0, -10, 10, -10, 0]
                            }}
                            transition={{
                              duration: 0.5,
                              delay: idx * 0.1,
                              repeat: Infinity,
                              repeatDelay: 5
                            }}
                          >
                            {feature.icon || '✓'}
                          </motion.span>
                          <span className="text-white/90 font-medium">
                            {typeof feature === 'string' ? feature : feature.name}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action buttons */}
              <div className="pt-4 space-y-3">
                <motion.button
                  onClick={onClose}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden"
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(34, 197, 94, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Button shimmer effect */}
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
                  <span className="relative z-10">Start Exploring Premium Features</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                </motion.button>

                <motion.p
                  className="text-xs text-white/60 flex items-center justify-center gap-1 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <TrendingUp className="w-3 h-3" />
                  Your farm monitoring is now supercharged!
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentSuccessModal;