import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, ArrowRight, Users, Headphones, Shield } from "lucide-react";

export default function PlanCard({
  plan,
  selectedField,
  onSubscribeClick,
  onContactClick,
}) {
  const [flipped, setFlipped] = useState(false);

  const isRecommended = !!plan.recommended;
  const isEnterprise = !!plan.isEnterprise;

  /* ================= ENTERPRISE ================= */

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
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-[#344E41] text-xs font-bold px-4 py-1 rounded-full shadow">
              ENTERPRISE
            </span>

            <h3 className="text-[24px] font-extrabold mt-6">{plan.name}</h3>
            <p className="text-xs text-gray-300">{plan.tagline}</p>

            <div className="mt-4 text-[20px] font-bold text-[#E1FFF0]">
              Custom Pricing
            </div>

            <div className="flex-1 mt-4 space-y-2 text-sm font-semibold">
              <p className="flex items-center gap-2">
                <Check size={14} /> All Premium Features
              </p>
              <p className="flex items-center gap-2">
                <Users size={14} /> Unlimited Team Members
              </p>
              <p className="flex items-center gap-2">
                <Headphones size={14} /> Dedicated Manager
              </p>
              <p className="flex items-center gap-2">
                <Shield size={14} /> Priority Support
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ================= NORMAL PLAN ================= */

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

  return (
    <div
      className="w-[300px] md:w-[320px] h-[500px]"
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
        {/* FRONT */}
        <div
          className={`absolute inset-0 rounded-2xl shadow-lg p-6 flex flex-col ${
            isRecommended
              ? "bg-[#344E41] text-white border-2 border-white"
              : "bg-white text-black border border-gray-200"
          }`}
          style={{ backfaceVisibility: "hidden" }}
        >
          <h3 className="text-[24px] font-extrabold mt-6">{plan.name}</h3>
          <p className="text-xs mb-3">{plan.tagline}</p>

          {/* ✅ PRICE SECTION */}
          <div className="mb-3">
            <p className="text-[24px] font-bold">
              ${plan.totalPrice?.toFixed(2)}/{plan.billingCycle}
            </p>

            <p className="text-[12px] text-gray-500 font-medium mt-1">
              {plan.area.toFixed(2)} acres × ${plan.unitPrice}
            </p>
          </div>

          <hr className="border-t border-gray-300 my-3" />

          {/* FEATURES */}
          <div className="flex-1 flex flex-col gap-1 text-[11px] font-semibold">
            {frontFeatures.map((f, idx) => (
              <p key={idx} className="flex items-center gap-2">
                <Check size={14} className="text-green-700" />
                {f}
              </p>
            ))}
          </div>

          {/* BUTTONS */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFlipped(true);
              }}
              className="flex-1 py-2 rounded-xl text-xs bg-[#5A7C6B] text-white"
            >
              View All
            </button>

            <button
              onClick={handleSubscribe}
              className="flex-1 py-2 rounded-xl text-xs font-bold bg-white text-[#344E41] border border-[#344E41]"
            >
              Subscribe
            </button>
          </div>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 rounded-2xl shadow-lg p-6 flex flex-col bg-white text-black border border-gray-200"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <h3 className="text-[18px] font-bold mt-6 mb-3">
            {plan.name} — All Features
          </h3>

          <div className="flex-1 overflow-auto text-[11px] font-semibold">
            {backFeatures.map((f, idx) => (
              <p key={idx} className="flex items-center gap-2 mb-1">
                {plan.features.includes(f) ? (
                  <Check size={14} className="text-green-700" />
                ) : (
                  <X size={14} className="text-red-600" />
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
            className="mt-3 w-full py-2 rounded-xl bg-[#5A7C6B] text-white"
          >
            Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
