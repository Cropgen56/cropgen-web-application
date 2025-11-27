import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

// All possible features for Enterprise Plan
const ALL_ENTERPRISE_FEATURES = [
  "Satellite Imagery",
  "Crop Health & Yield Monitoring",
  "Soil Analysis & Health",
  "Weather Analytics",
  "Vegetation Indices",
  "Water Indices",
  "Evapotranspiration Monitoring",
  "Agronomic Insights",
  "Weekly Advisory Reports",
  "Crop Growth Monitoring",
  "Farm Operations Management",
  "Disease Detection Alerts",
  "Smart Advisory System",
  "Soil Report Generation",
  "Unlimited Fields",
  "Priority Support",
  "API/ERP Integration",
  "Custom Reports",
  "Team Collaboration",
  "Dedicated Account Manager",
];

// Static Enterprise Card Component
export function EnterprisePlanCard() {
  const [flipped, setFlipped] = useState(false);

  const frontCount = 6;
  const frontFeatures = ALL_ENTERPRISE_FEATURES.slice(0, frontCount);

  const handleContactUs = (e) => {
    e.stopPropagation();
    window.open("https://www.cropgenapp.com/contact", "_blank");
  };

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
          className="absolute inset-0 rounded-2xl shadow-xl p-6 flex flex-col bg-gradient-to-br from-[#1a2f23] via-[#2d4a3a] to-[#344E41] text-white border-[2px] border-yellow-500"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Enterprise Badge */}
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-[#1a2f23] text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <span></span> Enterprise
          </span>

          <h3 className="text-[24px] font-extrabold mt-6 mb-1">
            Enterprise Plan
          </h3>
          <p className="text-xs mb-2 text-gray-300">
            Complete solution for large-scale farming operations
          </p>

          {/* Custom Pricing */}
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-[18px] font-bold text-yellow-400">
              Custom Pricing
            </p>
            <p className="text-xs text-gray-400">Tailored to your needs</p>
          </div>

          <hr className="border-t border-gray-600 my-3" />

          <div className="flex-1 flex flex-col gap-1 text-[11px] font-semibold leading-[24px] overflow-hidden">
            {frontFeatures.map((f, idx) => (
              <p key={idx} className="flex items-center gap-2 mb-0">
                <Check
                  strokeWidth={4}
                  size={14}
                  className="text-yellow-400 shrink-0"
                />
                {f}
              </p>
            ))}
            <p className="text-yellow-400 text-[10px] mt-1 font-medium">
              + {ALL_ENTERPRISE_FEATURES.length - frontCount} more premium
              features...
            </p>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFlipped(true);
              }}
              className="flex-1 py-2 rounded-2xl text-xs bg-[#5A7C6B] text-white hover:bg-[#466657] transition-colors"
            >
              View All Features
            </button>
            <button
              onClick={handleContactUs}
              className="flex-1 py-2 rounded-2xl font-bold text-xs bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#1a2f23] hover:from-yellow-300 hover:to-yellow-400 flex items-center justify-center gap-1 transition-all shadow-md"
            >
              <span>📞</span> Contact Us
            </button>
          </div>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 rounded-2xl shadow-xl p-6 flex flex-col bg-gradient-to-br from-[#1a2f23] via-[#2d4a3a] to-[#344E41] text-white border-[2px] border-yellow-500"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <h3 className="text-[18px] font-bold mt-4 mb-3 text-yellow-400">
            Enterprise Plan — All Features
          </h3>
          <div className="text-[11px] flex-1 overflow-auto font-semibold leading-[20px] pr-2 scrollbar-thin scrollbar-thumb-yellow-500 scrollbar-track-transparent">
            {ALL_ENTERPRISE_FEATURES.map((f, idx) => (
              <p key={idx} className="flex items-center gap-2 mb-1.5">
                <Check
                  strokeWidth={4}
                  size={14}
                  className="text-yellow-400 shrink-0"
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
              className="flex-1 py-2 rounded-2xl bg-[#5A7C6B] text-white hover:bg-[#466657] text-xs transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleContactUs}
              className="flex-1 py-2 rounded-2xl font-bold text-xs bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#1a2f23] hover:from-yellow-300 hover:to-yellow-400 flex items-center justify-center gap-1 transition-all shadow-md"
            >
              <span>📞</span> Contact Us
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Regular Plan Card Component
export default function PlanCard({ plan, selectedField, onSubscribeClick }) {
  const [flipped, setFlipped] = useState(false);
  const isRecommended = !!plan.recommended;

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
        {/* FRONT */}
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
              className="flex-1 py-2 rounded-2xl font-bold text-xs bg-white text-[#344E41] hover:bg-gray-900 border-[1px] border-[#344E41]"
            >
              Subscribe
            </button>
          </div>
        </div>

        {/* BACK */}
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