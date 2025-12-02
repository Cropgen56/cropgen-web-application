import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Building2, ArrowRight, Crown, Users, Headphones, Shield } from "lucide-react";

export default function PlanCard({ plan, selectedField, onSubscribeClick, onContactClick }) {
  const [flipped, setFlipped] = useState(false);
  const isRecommended = !!plan.recommended;
  const isEnterprise = !!plan.isEnterprise;

  const frontCount = Math.min(5, Math.ceil(plan.features.length / 2) + 1);
  const frontFeatures = plan.features.slice(0, frontCount);
  const backFeatures = [
    ...plan.features.slice(frontCount),
    ...(plan.missing || []),
  ];

  const handleSubscribe = (e) => {
    e.stopPropagation();
    onSubscribeClick?.({ plan, selectedField });
  };

  const handleContact = (e) => {
    e.stopPropagation();
    if (onContactClick) {
      onContactClick({ plan, selectedField });
    } else {
      window.open('https://www.cropgenapp.com/contact', '_blank');
    }
  };

  if (isEnterprise) {
    return (
      <div
        className="w-[300px] md:w-[320px] h-[420px]"
        style={{ perspective: 1000 }}
      >
        <motion.div
          onClick={() => setFlipped((s) => !s)}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.7 }}
          style={{
            transformStyle: "preserve-3d",
            position: "relative",
            width: "100%",
            height: "100%",
          }}
          className="cursor-pointer"
        >
          <div
            className="absolute inset-0 rounded-2xl shadow-xl p-6 flex flex-col bg-gradient-to-br from-[#1a2e22] via-[#344E41] to-[#2d4a3a] text-white border-2 border-[#E1FFF0]/30"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#E1FFF0] to-[#a8e6cf] text-[#344E41] text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <Crown size={12} className="text-[#344E41]" />
              ENTERPRISE
            </span>

            <div className="absolute top-0 right-0 w-24 h-24 bg-[#E1FFF0]/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#E1FFF0]/5 rounded-full blur-xl" />

            <div className="mt-6 mb-2">
              <div className="w-12 h-12 rounded-xl bg-[#E1FFF0]/20 border border-[#E1FFF0]/30 flex items-center justify-center">
                <Building2 className="text-[#E1FFF0]" size={24} />
              </div>
            </div>

            <h3 className="text-[24px] font-extrabold mb-1">{plan.name}</h3>
            <p className="text-xs text-gray-300 mb-2">{plan.tagline}</p>

            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-[20px] font-bold text-[#E1FFF0]">
                Custom Pricing
              </p>
            </div>

            <hr className="border-t border-white/20 my-3" />

            <div className="flex-1 flex flex-col gap-2 text-[11px] font-semibold leading-[22px] overflow-hidden">
              <p className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#E1FFF0]/20 flex items-center justify-center shrink-0">
                  <Check strokeWidth={3} size={12} className="text-[#E1FFF0]" />
                </div>
                All Premium Features Included
              </p>
              <p className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#E1FFF0]/20 flex items-center justify-center shrink-0">
                  <Users strokeWidth={3} size={12} className="text-[#E1FFF0]" />
                </div>
                Unlimited Team Members
              </p>
              <p className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#E1FFF0]/20 flex items-center justify-center shrink-0">
                  <Headphones strokeWidth={3} size={12} className="text-[#E1FFF0]" />
                </div>
                Dedicated Account Manager
              </p>
              <p className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#E1FFF0]/20 flex items-center justify-center shrink-0">
                  <Shield strokeWidth={3} size={12} className="text-[#E1FFF0]" />
                </div>
                Priority Support & SLA
              </p>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFlipped(true);
                }}
                className="flex-1 py-2 rounded-2xl text-xs bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/20"
              >
                View All Features
              </button>
              <button
                onClick={handleContact}
                className="flex-1 py-2 rounded-2xl font-bold text-xs bg-[#E1FFF0] text-[#344E41] hover:bg-white transition-all duration-300 flex items-center justify-center gap-1"
              >
                Contact Us
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div
            className="absolute inset-0 rounded-2xl shadow-xl p-6 flex flex-col bg-gradient-to-br from-[#1a2e22] via-[#344E41] to-[#2d4a3a] text-white border-2 border-[#E1FFF0]/30"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#E1FFF0]/10 rounded-full blur-2xl" />

            <div className="flex items-center gap-2 mt-4 mb-3">
              <Building2 className="text-[#E1FFF0]" size={20} />
              <h3 className="text-[18px] font-bold">
                {plan.name} — All Features
              </h3>
            </div>

            <div className="text-[11px] flex-1 overflow-auto font-semibold leading-[20px] pr-2">
              {plan.features.map((f, idx) => (
                <p key={idx} className="flex items-center gap-2 mb-1.5">
                  <Check
                    strokeWidth={4}
                    size={14}
                    className="text-[#E1FFF0] shrink-0"
                  />
                  {f}
                </p>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFlipped(false);
                }}
                className="flex-1 py-2 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/20"
              >
                Back
              </button>
              <button
                onClick={handleContact}
                className="flex-1 py-2 rounded-2xl font-bold text-xs bg-[#E1FFF0] text-[#344E41] hover:bg-white transition-all duration-300 flex items-center justify-center gap-1"
              >
                Contact Us
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="w-[300px] md:w-[320px] h-[420px]"
      style={{ perspective: 1000 }}
    >
      <motion.div
        onClick={() => setFlipped((s) => !s)}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7 }}
        style={{
          transformStyle: "preserve-3d",
          position: "relative",
          width: "100%",
          height: "100%",
        }}
        className="cursor-pointer"
      >
        <div
          className={`absolute inset-0 rounded-2xl shadow-lg p-6 flex flex-col ${
            isRecommended
              ? "bg-[#344E41] text-white border-[2px] border-white"
              : "bg-white text-black border border-gray-200"
          }`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {isRecommended && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-[#344E41] text-xs font-bold px-3 py-1 rounded-full">
              Recommended
            </span>
          )}
          <h3 className="text-[24px] font-extrabold mt-6 mb-1">{plan.name}</h3>
          <p className="text-xs mb-2">{plan.tagline}</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-[20px] font-bold">{plan.price || ""}</p>
            {plan.priceBreakdown && (
              <p className="text-xs text-gray-400">{plan.priceBreakdown}</p>
            )}
          </div>

          <hr className="border-t border-gray-800 mb-3" />
          <div className="flex-1 flex flex-col gap-1 text-[11px] font-semibold leading-[24px] overflow-hidden">
            {frontFeatures.length > 0 ? (
              frontFeatures.map((f, idx) => (
                <p key={idx} className="flex items-center gap-2 mb-0">
                  <Check
                    strokeWidth={4}
                    size={14}
                    className="text-green-700 shrink-0"
                  />
                  {f}
                </p>
              ))
            ) : (
              <p className="text-gray-500">No features enabled</p>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFlipped(true);
              }}
              className="flex-1 py-2 rounded-2xl text-xs bg-[#5A7C6B] text-white hover:bg-[#466657]"
            >
              View All Features
            </button>
            <button
              onClick={handleSubscribe}
              className="flex-1 py-2 rounded-2xl font-bold text-xs bg-white text-[#344E41] hover:bg-gray-100 border-[1px] border-[#344E41]"
            >
              Subscribe
            </button>
          </div>
        </div>

        <div
          className={`absolute inset-0 rounded-2xl shadow-lg p-6 flex flex-col ${
            isRecommended
              ? "bg-[#344E41] text-white border-[2px] border-white"
              : "bg-white text-black border border-gray-200"
          }`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <h3 className="text-[18px] font-bold mt-6 mb-3">
            {plan.name} — All Features
          </h3>
          <div className="text-[11px] flex-1 overflow-auto font-semibold leading-[20px] pr-2">
            {backFeatures.map((f, idx) => (
              <p key={idx} className="flex items-center gap-2 mb-1">
                {plan.features.includes(f) ? (
                  <Check
                    strokeWidth={4}
                    size={14}
                    className="text-green-700 shrink-0"
                  />
                ) : (
                  <X
                    strokeWidth={4}
                    size={14}
                    className="text-red-600 shrink-0"
                  />
                )}
                {f}
              </p>
            ))}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFlipped(false);
            }}
            className="mt-3 w-full py-2 rounded-2xl bg-[#5A7C6B] text-white hover:bg-[#466657]"
          >
            Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}