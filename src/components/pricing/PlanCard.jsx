import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Users, Headphones, Shield } from "lucide-react";

export default function PlanCard({
  plan,
  selectedField,
  onSubscribeClick,
  onContactClick,
}) {
  const [flipped, setFlipped] = useState(false);

  const isRecommended = !!plan.recommended;
  const isEnterprise = !!plan.isEnterprise;
  const isDisabled = !!plan.trialDisabled;

  /* ================= ENTERPRISE ================= */

  if (isEnterprise) {
    return (
      <div
        className="w-[300px] md:w-[320px] h-[540px]"
        style={{ perspective: 1000 }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.7 }}
          style={{
            transformStyle: "preserve-3d",
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          <div
            className="absolute inset-0 rounded-2xl shadow-xl p-6 flex flex-col justify-between bg-gradient-to-br from-[#1a2e22] via-[#344E41] to-[#2d4a3a] text-white border border-[#E1FFF0]/30"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-[#344E41] text-xs font-bold px-4 py-1 rounded-full shadow">
              ENTERPRISE
            </span>

            <div>
              <h3 className="text-[24px] font-extrabold mt-6">{plan.name}</h3>
              <p className="text-sm text-gray-200 mt-1">{plan.tagline}</p>

              <div className="mt-5 text-[22px] font-bold text-[#E1FFF0]">
                Custom Pricing
              </div>
            </div>

            <div className="space-y-3 text-sm font-medium">
              <p className="flex items-center gap-2">
                <Check size={16} /> All Premium Features
              </p>
              <p className="flex items-center gap-2">
                <Users size={16} /> Unlimited Team Members
              </p>
              <p className="flex items-center gap-2">
                <Headphones size={16} /> Dedicated Manager
              </p>
              <p className="flex items-center gap-2">
                <Shield size={16} /> Priority Support
              </p>
            </div>

            <button className="w-full py-3 rounded-xl bg-white text-[#344E41] font-semibold">
              Contact Sales
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ================= NORMAL PLAN ================= */

  const FRONT_FEATURE_LIMIT = 4;

  const frontFeatures = plan.features.slice(0, FRONT_FEATURE_LIMIT);

  const backFeatures = [
    ...plan.features.slice(FRONT_FEATURE_LIMIT),
    ...(plan.missing || []),
  ];

  const handleSubscribe = (e) => {
    e.stopPropagation();
    if (isDisabled) return;
    onSubscribeClick?.({ plan, selectedField });
  };

  return (
    <div
      className="w-[300px] md:w-[320px] h-[540px]"
      style={{ perspective: 1000 }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7 }}
        style={{
          transformStyle: "preserve-3d",
          position: "relative",
          width: "100%",
          height: "100%",
        }}
        className={isDisabled ? "cursor-not-allowed" : "cursor-pointer"}
      >
        {/* FRONT SIDE */}

        <div
          className={`absolute inset-0 rounded-2xl shadow-xl p-6 flex flex-col justify-between ${
            isRecommended
              ? "bg-[#344E41] text-white border-2 border-white"
              : "bg-white text-black border border-gray-200"
          } ${isDisabled ? "opacity-70" : ""}`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* TOP CONTENT */}

          <div>
            <h3 className="text-[24px] font-extrabold mt-4">{plan.name}</h3>
            <p className="text-sm mt-1 mb-4">{plan.tagline}</p>

            {/* PRICE */}

            <div>
              <p className="text-[26px] font-bold">
                ${plan.totalPrice?.toFixed(2)}/{plan.billingCycle}
              </p>

              <p className="text-xs text-gray-500 font-medium mt-1">
                {plan.area.toFixed(2)} acres × ${plan.unitPrice}
              </p>
            </div>

            <hr className="border-t border-gray-300 my-4" />

            {/* FEATURES */}

            <div className="flex flex-col gap-2 text-sm font-medium">
              {isDisabled ? (
                <div className="rounded-xl border border-[#344E41]/15 bg-[#F4F7F4] px-4 py-4 text-sm leading-7 text-[#344E41] min-h-[180px]">
                  {plan.disabledMessage}
                </div>
              ) : (
                <>
                  {frontFeatures.map((f, idx) => (
                    <p key={idx} className="flex items-center gap-2">
                      <Check size={16} className="text-green-600" />
                      {f}
                    </p>
                  ))}

                  {plan.features.length > FRONT_FEATURE_LIMIT && (
                    <p className="text-xs text-gray-400 mt-1">
                      +{plan.features.length - FRONT_FEATURE_LIMIT} more
                      features
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* BUTTONS */}

          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFlipped(true);
              }}
              className={`flex-1 py-2 rounded-xl text-sm text-white font-medium ${
                isDisabled
                  ? "bg-[#9AA9A1] cursor-not-allowed"
                  : "bg-[#5A7C6B] hover:bg-[#49675a]"
              }`}
              disabled={isDisabled}
            >
              View All
            </button>

            <button
              onClick={handleSubscribe}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border ${
                isDisabled
                  ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                  : "bg-white text-[#344E41] border-[#344E41] hover:bg-[#f5f7f6]"
              }`}
              disabled={isDisabled}
            >
              {isDisabled ? "Not Available" : "Subscribe"}
            </button>
          </div>
        </div>

        {/* BACK SIDE */}

        <div
          className="absolute inset-0 rounded-2xl shadow-xl p-6 flex flex-col justify-between bg-white text-black border border-gray-200"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div>
            <h3 className="text-[20px] font-bold mt-4 mb-4">
              {plan.name} — All Features
            </h3>

            <div className="max-h-[320px] overflow-y-auto text-sm font-medium space-y-2 pr-2">
              {backFeatures.map((f, idx) => (
                <p key={idx} className="flex items-center gap-2">
                  {plan.features.includes(f) ? (
                    <Check size={16} className="text-green-600" />
                  ) : (
                    <X size={16} className="text-red-500" />
                  )}
                  {f}
                </p>
              ))}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setFlipped(false);
            }}
            className="mt-4 w-full py-2 rounded-xl bg-[#5A7C6B] text-white font-medium hover:bg-[#49675a]"
          >
            Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
