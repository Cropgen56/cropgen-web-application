import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react"

const USD_TO_INR = 83;

const plans = [
    {
        name: "Free Trial",
        tagline: "Perfect for getting started",
        basePrice: 0, // number for calculations
        unit: "/30 days",
        features: [
            "Up to 5 hectares",
            "Graphs & Historical Data",
            "Satellite Crop Monitoring (12+ indices)",
            "Weather Forecast (7–14 days)",
            "Soil Moisture & Temperature",
            "Growth Stage Tracking (BBCH)",
        ],
        missing: [
            "Fertilizer (NPK) Advisory",
            "Irrigation Updates (ET-based)",
            "Pest & Disease Alerts",
            "Yield Prediction",
            "Harvest Window Insights",
            "Soil Fertility Analysis",
            "SOC Analytics (Soil Organic Carbon)",
            "Advisory Delivery",
            "Weekly Reports",
            "Operations Management Dashboard",
            "API/ERP Integration",
            "Enterprise Support",
        ],
    },

    {
        name: "Premium",
        tagline: "Advanced analytics",
        basePrice: 29,
        unit: "/ha/month",
        recommended: true,
        features: [
            "Up to 5 hectares",
            "Graphs & Historical Data (7 yr)",
            "Satellite Crop Monitoring (12+ indices)",
            "Weather Forecast (7–14 days advanced)",
            "Soil Moisture & Temperature (advanced soil)",
            "Growth Stage Tracking (BBCH AI-enhanced)",
            "Fertilizer (NPK) Advisory (advanced)",
            "Irrigation Updates (ET-based smart)",
            "Pest & Disease Alerts (AI early-warning)",
            "Yield Prediction",
            "Harvest Window Insights",
            "Soil Fertility Analysis",
            "SOC Analytics (Soil Organic Carbon)",
            "Advisory Delivery Email (daily + weekly)",
            "Weekly Reports (detailed PDF)",
            "Operations Management Dashboard",
            "API/ERP Integration",
            "Enterprise Support (priority email)",
        ],
    },

    {
        name: "Basic",
        tagline: "For small farms",
        basePrice: 5,
        unit: "/ha/month",
        features: [
            "Up to 5 hectares",
            "Graphs & Historical Data (3 yr)",
            "Satellite Crop Monitoring (12+ indices)",
            "Weather Forecast (7–14 days)",
            "Soil Moisture & Temperature (surface)",
            "Growth Stage Tracking (BBCH basic)",
            "Fertilizer (NPK) Advisory",
            "Irrigation Updates (ET-based)",
            "Pest & Disease Alerts",
            "Yield Prediction",
            "Harvest Window Insights",
        ],
        missing: [
            "Soil Fertility Analysis",
            "SOC Analytics (Soil Organic Carbon)",
            "Advisory Delivery Email (weekly)",
            "Weekly Reports (basic PDF)",
            "Operations Management Dashboard",
            "API/ERP Integration",
            "Enterprise Support",
        ],
    },
    {
        name: "Pro",
        tagline: "Most popular choice",
        basePrice: 15,
        unit: "/ha/month",
        features: [
            "Up to 5 hectares",
            "Graphs & Historical Data (5 yr)",
            "Satellite Crop Monitoring (12+ indices)",
            "Weather Forecast (7–14 days)",
            "Soil Moisture & Temperature (root-soil)",
            "Growth Stage Tracking (BBCH basic)",
            "Fertilizer (NPK) Advisory",
            "Irrigation Updates (ET-based)",
            "Pest & Disease Alerts",
            "Yield Prediction",
            "Harvest Window Insights",
            "Weekly Reports (PDF)",
        ],
        missing: [
            "Soil Fertility Analysis",
            "SOC Analytics (Soil Organic Carbon)",
            "Advisory Delivery Email (detailed weekly)",
            "Operations Management Dashboard",
            "API/ERP Integration",
            "Enterprise Support",
        ],
    },

    {
        name: "Enterprise",
        tagline: "For large operations",
        basePrice: 2.5,// assuming min $2.5/ha
        unit: "/ha/month",
        features: [
            "Up to 5 hectares",
            "Graphs & Historical Data (10 Year Plus)",
            "Satellite Crop Monitoring (zone-wide analysis)",
            "Weather Forecast (7–14 days) (multi-field)",
            "Soil Moisture & Temperature (advanced soil)",
            "Growth Stage Tracking (BBCH) (AI-enhanced)",
            "Fertilizer (NPK) Advisory (advanced)",
            "Irrigation Updates (ET-based) (smart)",
            "Pest & Disease Alerts (AI early-warning)",
            "Yield Prediction (farm-wide)",
            "Harvest Window Insights",
            "Soil Fertility Analysis (zone-wide analysis)",
            "SOC Analytics (Soil Organic Carbon) (regional mapping)",
            "Advisory Delivery Email (farm + Enterprise Dashboard)",
            "Weekly Reports (bulk reporting)",
            "Operations Management Dashboard (multi-user, enterprise)",
            "API/ERP Integration",
            "Enterprise Support (dedicated account manager)",
        ],
    },
];

function computeAdjustedPlans(plans, billing, currency) {
    return plans.map((p) => {
        let displayPrice = p.basePrice;
        if (p.basePrice === 0) displayPrice = 0;
        else if (billing === "yearly") displayPrice = p.basePrice * 12 * 0.8;

        let formattedPrice;
        if (displayPrice === 0) formattedPrice = "$0 /30 days";
        else {
            if (currency === "USD")
                formattedPrice = `$${displayPrice.toFixed(2)} ${billing === "yearly" ? "/ha/year" : "/ha/month"
                    }`;
            else
                formattedPrice = `₹${Math.round(displayPrice * USD_TO_INR)} ${billing === "yearly" ? "/ha/year" : "/ha/month"
                    }`;
        }

        return { ...p, price: formattedPrice };
    });
}

// 🔹 single plan card
function PlanCard({ plan }) {
    const [flipped, setFlipped] = useState(false);
    const isRecommended = !!plan.recommended;

    const frontCount = Math.min(5, Math.ceil(plan.features.length / 2) + 1);
    const frontFeatures = plan.features.slice(0, frontCount);
    const backFeatures = [
        ...plan.features.slice(frontCount),
        ...(plan.missing || []),
    ];

    return (
        <div
            className="w-[300px] md:w-[320px] h-[420px]"
            style={{ perspective: 1000, minWidth: 0 }}
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
                    className={`absolute inset-0 rounded-2xl shadow-lg p-6 flex flex-col ${isRecommended
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
                    <h3 className="text-[24px] font-extrabold mt-6 mb-1">
                        {plan.name}
                    </h3>
                    <p className="text-xs mb-2">{plan.tagline}</p>
                    <p className="text-[20px] font-bold mb-3">{plan.price || ""}</p>

                    <hr className="border-t border-gray-800 mb-3" />

                    <div className="flex-1 flex flex-col gap-1 text-[11px] font-semibold leading-[11px] overflow-hidden">
                        {frontFeatures.map((f, idx) => (
                            <p key={idx} className="flex items-start gap-2">
                                <Check
                                    strokeWidth={4}
                                    size={14}
                                    className="text-green-700 shrink-0"
                                />
                                {f}
                            </p>
                        ))}
                    </div>

                    <div className="mt-3 flex gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setFlipped(true);
                            }}
                            className="flex-1 py-2 rounded-2xl text-xs bg-[#5A7C6B] text-white hover:bg-[#466657] "
                        >
                            View All Features
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                alert(`Selected ${plan.name}`);
                            }}
                            className="flex-1 py-2 rounded-2xl text-xs bg-white text-[#344E41] hover:bg-gray-200 border-[2px]"
                        >
                            Get Started
                        </button>
                    </div>
                </div>

                {/* BACK */}
                <div
                    className={`absolute inset-0 rounded-2xl shadow-lg p-6 flex flex-col ${isRecommended
                        ? "bg-[#344E41] text-white border-[2px] border-white"
                        : "bg-white text-black border border-gray-200"
                        }`}
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                    <h3 className="text-[18px] font-bold mt-6 mb-3">
                        {plan.name} — Details
                    </h3>
                    <div className="text-[11px] flex-1 overflow-auto font-semibold leading-[14px] pr-2">
                        {backFeatures.map((f, idx) => (
                            <p key={idx} className="flex items-start gap-2 mb-1">
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
                    <div className="mt-3">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setFlipped(false);
                            }}
                            className="w-full py-2 px-3 rounded-2xl bg-[#5A7C6B] text-white hover:bg-[#466657]"
                        >
                            Back
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function PricingOverlay({ onClose }) {
    const [billing, setBilling] = useState("monthly");
    const [currency, setCurrency] = useState("USD");
    const [groupIndex, setGroupIndex] = useState(0);
    const [cardsPerGroup, setCardsPerGroup] = useState(3);

    // 🔹 update cardsPerGroup based on screen size
    useEffect(() => {
        function handleResize() {
            if (window.innerWidth < 768) setCardsPerGroup(1);
            else if (window.innerWidth < 1024) setCardsPerGroup(2);
            else setCardsPerGroup(3);
        }
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const adjusted = useMemo(
        () => computeAdjustedPlans(plans, billing, currency),
        [billing, currency, plans]
    );

    const groups = useMemo(() => {
        const g = [];
        for (let i = 0; i < adjusted.length; i += cardsPerGroup) {
            g.push(adjusted.slice(i, i + cardsPerGroup));
        }
        return g;
    }, [adjusted, cardsPerGroup]);

    const visibleGroup = groups[groupIndex] || groups[0];

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4"
            style={{ background: "rgba(52,78,65,0.5)" }}
        >
            <motion.div
                key="cards"
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 60 }}
                transition={{ duration: 0.55 }}
                className="relative w-full max-w-7xl rounded-xl p-4 sm:p-6"
                style={{ backdropFilter: "blur(4px)" }}
            >
                {onClose && (
                    <button
                        className="absolute top-2 sm:top-4 right-2 sm:right-4 text-white z-40"
                        onClick={onClose}
                    >
                        <X size={24} className="sm:w-7 sm:h-7" />
                    </button>
                )}

                {/* 🔥 Heading */}
                <h2 className="text-[clamp(20px,5vw,42px)] font-extrabold text-center mb-2 sm:mb-3 text-white">
                    Choose the{" "}
                    <span className="bg-gradient-to-r from-[#5A7C6B] to-[#E1FFF0] bg-clip-text text-transparent">
                        Right Plan
                    </span>{" "}
                    for Your Farm
                </h2>
                <p className="text-[clamp(12px,3vw,18px)] font-semibold text-center text-white mb-6 sm:mb-10">
                    Affordable plans designed to grow with your farming needs.
                </p>

                {/* toggles */}
                <div className="w-full flex flex-col md:flex-row items-center justify-between mb-4 px-1 sm:px-12 gap-3 sm:gap-4">
                    {/* billing toggle */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <span
                            className={`font-bold text-[clamp(12px,2.5vw,16px)] cursor-pointer ${billing === "monthly" ? "text-white" : "text-gray-300"
                                }`}
                            onClick={() => setBilling("monthly")}
                        >
                            Monthly
                        </span>
                        <div
                            onClick={() =>
                                setBilling((b) => (b === "monthly" ? "yearly" : "monthly"))
                            }
                            className="relative flex items-center bg-gray-200 rounded-full w-12 sm:w-14 h-6 sm:h-7 cursor-pointer"
                        >
                            <div
                                className={`absolute top-0.5 w-5 sm:w-6 h-5 sm:h-6 rounded-full transition-all ${billing === "monthly"
                                    ? "left-1 bg-[#344E41]"
                                    : "left-6 sm:left-7 bg-[#344E41]"
                                    }`}
                            />
                        </div>
                        <span
                            className={`font-bold text-[clamp(12px,2.5vw,16px)] cursor-pointer ${billing === "yearly" ? "text-white" : "text-gray-300"
                                }`}
                            onClick={() => setBilling("yearly")}
                        >
                            Yearly
                        </span>
                        <span className="ml-2 text-[10px] sm:text-xs bg-gradient-to-r from-[#5A7C6B] to-[#E1FFF0] text-[#344E41] px-2 py-0.5 rounded-full">
                            Save 20%
                        </span>
                    </div>

                    {/* currency toggle */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <span
                            className={`font-bold text-[clamp(12px,2.5vw,16px)] cursor-pointer ${currency === "USD" ? "text-white" : "text-gray-300"
                                }`}
                            onClick={() => setCurrency("USD")}
                        >
                            Plan in $
                        </span>
                        <div
                            onClick={() =>
                                setCurrency((c) => (c === "USD" ? "INR" : "USD"))
                            }
                            className="relative flex items-center bg-gray-200 rounded-full w-12 sm:w-14 h-6 sm:h-7 cursor-pointer"
                        >
                            <div
                                className={`absolute top-0.5 w-5 sm:w-6 h-5 sm:h-6 rounded-full transition-all ${currency === "USD"
                                    ? "left-1 bg-[#344E41]"
                                    : "left-6 sm:left-7 bg-[#344E41]"
                                    }`}
                            />
                        </div>
                        <span
                            className={`font-bold text-[clamp(12px,2.5vw,16px)] cursor-pointer ${currency === "INR" ? "text-white" : "text-gray-300"
                                }`}
                            onClick={() => setCurrency("INR")}
                        >
                            Plan in ₹
                        </span>
                    </div>
                </div>

                {/* cards row */}
                <div className="relative w-full flex items-stretch justify-center gap-3 sm:gap-6">
                    {/* Left arrow */}
                    <button
                        onClick={() =>
                            setGroupIndex((s) => (s - 1 + groups.length) % groups.length)
                        }
                        className="absolute left-0 md:left-2 sm:left-6 top-1/2 -translate-y-1/2 
               flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 
               text-white rounded-full transition z-50"
                    >
                        <ChevronLeft size={36} strokeWidth={3} />
                    </button>

                    {/* Card group */}
                    <motion.div
                        key={groupIndex}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.45 }}
                        className="flex justify-center gap-4 sm:gap-6"
                    >
                        {visibleGroup.map((p, i) => (
                            <div
                                key={p.name + i}
                                className="w-[90%] sm:w-[280px] md:w-[300px] lg:w-[320px] flex-shrink-0"
                            >
                                <PlanCard plan={p} />
                            </div>
                        ))}
                    </motion.div>

                    {/* Right arrow */}
                    <button
                        onClick={() => setGroupIndex((s) => (s + 1) % groups.length)}
                        className="absolute right-0 md:right-2 sm:right-6 top-1/2 -translate-y-1/2 
               flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 
               text-white rounded-full transition z-50"
                    >
                        <ChevronRight size={36} strokeWidth={3} />
                    </button>
                </div>


                {/* footer */}
                <div className="mt-6 sm:mt-8 text-center text-white font-bold text-[10px] sm:text-xs md:text-sm space-y-3">
                    {/* Links row */}
                    <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                        <a
                            className="text-white hover:text-gray-300 transition-colors"
                            href="https://www.cropgenapp.com/terms-conditions"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Terms and Conditions
                        </a>
                        <a
                            className="text-white hover:text-gray-300 transition-colors"
                            href="https://www.cropgenapp.com/privacy-policy"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Privacy Policy
                        </a>
                    </div>

                    {/* Disclaimer text */}
                    <p>
                        Prices are exclusive of VAT, GST, or other applicable taxes in your region.
                        <br />
                        If you require an invoice to process your CropGen subscription, please
                        contact our support team.
                    </p>
                </div>

            </motion.div>
        </div>
    );
}
