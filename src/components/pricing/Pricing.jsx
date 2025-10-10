import React, { useMemo, useState, useEffect, useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSubscriptions } from "../../redux/slices/subscriptionSlice.js";
import PlanCard from "./PlanCard";

const USD_TO_INR = 83;
const DEFAULT_AREA = 5;

const FEATURE_DISPLAY_NAMES = {
    graphHistoricalData: "Graphs & Historical Data",
    satelliteCropMonitoring: "Satellite Crop Monitoring",
    weatherForecast: "Weather Forecast",
    soilMoistureTemp: "Soil Moisture & Temperature",
    growthStageTracking: "Growth Stage Tracking (BBCH)",
    advisory: "Fertilizer (NPK) Advisory",
    irrigationUpdates: "Irrigation Updates (ET-based)",
    pestDiseaseAlerts: "Pest & Disease Alerts",
    yieldPrediction: "Yield Prediction",
    harvestWindow: "Harvest Window Insights",
    insights: "Insights",
    soilFertilityAnalysis: "Soil Fertility Analysis",
    socCarbon: "SOC Analytics (Soil Organic Carbon)",
    advisoryControl: "Advisory Control",
    advisoryDelivery: "Advisory Delivery",
    weeklyReports: "Weekly Reports",
    operationsManagement: "Operations Management Dashboard",
    apiIntegration: "API/ERP Integration",
    enterpriseSupport: "Enterprise Support"
};

function transformApiData(apiData, billing, currency, userArea) {
    if (!apiData || !Array.isArray(apiData)) return [];

    const areaInHectares = userArea || DEFAULT_AREA;

    return apiData
        .map((plan) => {
            const pricingByCurrencyAndCycle = {};

            // Pick highest amount per currency-billingCycle
            plan.pricing?.forEach(price => {
                const key = `${price.currency}_${price.billingCycle}`;
                if (!pricingByCurrencyAndCycle[key] ||
                    pricingByCurrencyAndCycle[key].amountMinor < price.amountMinor) {
                    pricingByCurrencyAndCycle[key] = price;
                }
            });

            let displayPrice = 0;
            let pricePerHectare = 0;
            let totalPrice = 0;
            let unit = billing === "monthly" ? "/month" : "/year";
            let basePrice = 0;

            const isTrial = plan.isTrial || plan.pricing?.some(p => p.billingCycle === "trial");

            if (!isTrial) {
                const matchKey = `${currency}_${billing}`;
                const exactMatch = pricingByCurrencyAndCycle[matchKey];

                if (exactMatch) {
                    pricePerHectare = exactMatch.amountMinor / 100;
                    totalPrice = pricePerHectare * areaInHectares;
                    basePrice = pricePerHectare;
                } else {
                    const currencyMatch = Object.values(pricingByCurrencyAndCycle)
                        .find(p => p.currency === currency);

                    if (currencyMatch) {
                        pricePerHectare = currencyMatch.amountMinor / 100;

                        // Handle monthly/yearly conversion
                        if (billing === "yearly" && currencyMatch.billingCycle === "monthly") {
                            pricePerHectare = pricePerHectare * 12 * 0.8;
                        } else if (billing === "monthly" && currencyMatch.billingCycle === "yearly") {
                            pricePerHectare = pricePerHectare / 12 / 0.8;
                        }

                        totalPrice = pricePerHectare * areaInHectares;
                        basePrice = pricePerHectare;
                    } else {
                        const anyPrice = Object.values(pricingByCurrencyAndCycle)[0];
                        if (anyPrice) {
                            pricePerHectare = anyPrice.amountMinor / 100;

                            // Currency conversion fallback
                            if (anyPrice.currency === "INR" && currency === "USD") {
                                pricePerHectare = pricePerHectare / USD_TO_INR;
                            } else if (anyPrice.currency === "USD" && currency === "INR") {
                                pricePerHectare = pricePerHectare * USD_TO_INR;
                            }

                            // Handle monthly/yearly conversion
                            if (billing === "yearly" && anyPrice.billingCycle === "monthly") {
                                pricePerHectare = pricePerHectare * 12 * 0.8;
                            } else if (billing === "monthly" && anyPrice.billingCycle === "yearly") {
                                pricePerHectare = pricePerHectare / 12 / 0.8;
                            }

                            totalPrice = pricePerHectare * areaInHectares;
                            basePrice = pricePerHectare;
                        }
                    }
                }

                displayPrice = totalPrice;
            }

            let formattedPrice;
            let priceBreakdown = "";

            if (isTrial || displayPrice === 0) {
                formattedPrice = plan.trialDays ? `Free Trial (${plan.trialDays} days)` : "Free";
            } else {
                if (currency === "USD") {
                    formattedPrice = `$${displayPrice.toFixed(2)}${unit}`;
                    priceBreakdown = `($${basePrice.toFixed(2)}/ha × ${areaInHectares.toFixed(1)} ha)`;
                } else {
                    formattedPrice = `₹${Math.round(displayPrice)}${unit}`;
                    priceBreakdown = `(₹${Math.round(basePrice)}/ha × ${areaInHectares.toFixed(1)} ha)`;
                }
            }

            // Features
            const enabledFeatures = [];
            const disabledFeatures = [];
            Object.entries(plan.features || {}).forEach(([key, value]) => {
                const displayName = FEATURE_DISPLAY_NAMES[key] || key;
                if (value) {
                    enabledFeatures.push(displayName);
                } else {
                    disabledFeatures.push(displayName);
                }
            });

            return {
                _id: plan._id,
                name: plan.name,
                tagline: plan.description || "Perfect for your needs",
                basePrice,
                totalPrice: displayPrice,
                price: formattedPrice,
                priceBreakdown,
                unit,
                features: enabledFeatures,
                missing: disabledFeatures,
                recommended: plan.recommended || false,
                active: plan.active,
                maxUsers: plan.maxUsers,
                isTrial,
                areaInHectares
            };
        })
        .filter(plan => plan.active !== false);
}


export default function PricingOverlay({ onClose, userArea }) {
    const dispatch = useDispatch();
    const { subscriptions, loading, error } = useSelector(state => state.subscription);

    const fieldArea = userArea || DEFAULT_AREA;

    const [billing, setBilling] = useState("monthly");
    const [currency, setCurrency] = useState("INR");
    const [groupIndex, setGroupIndex] = useState(0);
    const [cardsPerGroup, setCardsPerGroup] = useState(3);

    useEffect(() => {
        dispatch(fetchSubscriptions());
    }, [dispatch]);

    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);

    useLayoutEffect(() => {
        function recomputeScale() {
            const el = containerRef.current;
            if (!el) return;
            const naturalW = el.scrollWidth || el.offsetWidth || 1;
            const naturalH = el.scrollHeight || el.offsetHeight || 1;
            const availW = window.innerWidth - 24;
            const availH = window.innerHeight - 24;
            const s = Math.min(availW / naturalW, availH / naturalH, 1);
            setScale(Number.isFinite(s) && s > 0 ? s : 1);
        }
        recomputeScale();
        window.addEventListener("resize", recomputeScale);
        return () => window.removeEventListener("resize", recomputeScale);
    }, [cardsPerGroup, groupIndex]);

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
        () => transformApiData(subscriptions, billing, currency, fieldArea),
        [subscriptions, billing, currency, fieldArea]
    );

    const groups = useMemo(() => {
        const g = [];
        for (let i = 0; i < adjusted.length; i += cardsPerGroup) {
            g.push(adjusted.slice(i, i + cardsPerGroup));
        }
        return g;
    }, [adjusted, cardsPerGroup]);

    const visibleGroup = groups[groupIndex] || groups[0] || [];

    if (loading) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center"
                style={{ background: "rgba(52,78,65,0.5)" }}>
                <div className="bg-white rounded-lg p-8 flex flex-col items-center">
                    <Loader2 className="animate-spin h-12 w-12 text-[#344E41]" />
                    <p className="mt-4 text-lg font-semibold">Loading subscription plans...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center"
                style={{ background: "rgba(52,78,65,0.5)" }}>
                <div className="bg-white rounded-lg p-8 max-w-md">
                    <h3 className="text-xl font-bold text-red-600 mb-2">Error Loading Plans</h3>
                    <p className="text-gray-600">{error.message || "Failed to load subscription plans"}</p>
                    <button
                        onClick={() => dispatch(fetchSubscriptions())}
                        className="mt-4 px-4 py-2 bg-[#344E41] text-white rounded-lg hover:bg-[#2a3d34]"
                    >
                        Retry
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="mt-4 ml-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4"
            style={{ background: "rgba(52,78,65,0.5)" }}
        >
            <motion.div
                key="cards"
                ref={containerRef}
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 60 }}
                transition={{ duration: 0.55 }}
                className="relative w-full max-w-7xl rounded-xl p-4 sm:p-6"
                style={{ backdropFilter: "blur(4px)", transformOrigin: "center", scale }}
            >
                {onClose && (
                    <button
                        className="absolute top-2 sm:top-4 right-2 sm:right-4 text-white z-40"
                        onClick={onClose}
                    >
                        <X size={24} className="sm:w-7 sm:h-7" />
                    </button>
                )}

                <h2 className="text-[clamp(20px,5vw,42px)] font-extrabold text-center mb-2 sm:mb-3 text-white">
                    Choose the{" "}
                    <span className="bg-gradient-to-r from-[#5A7C6B] to-[#E1FFF0] bg-clip-text text-transparent">
                        Right Plan
                    </span>{" "}
                    for Your Farm
                </h2>
                <p className="text-[clamp(12px,3vw,18px)] font-semibold text-center text-white mb-4">
                    Affordable plans designed to grow with your farming needs.
                </p>

                <div className="flex justify-center mb-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center gap-2">
                        <span className="text-white text-sm font-semibold">Your Farm Area:</span>
                        <span className="text-[#E1FFF0] font-bold text-sm">
                            {fieldArea.toFixed(2)} hectares
                        </span>
                    </div>
                </div>

                <div className="w-full flex flex-col md:flex-row items-center justify-between mb-4 px-1 sm:px-12 gap-3 sm:gap-4">
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

                {adjusted.length === 0 ? (
                    <div className="text-center text-white py-12">
                        <p className="text-xl">No subscription plans available at the moment.</p>
                    </div>
                ) : (
                    <div className="relative w-full flex items-stretch justify-center gap-3 sm:gap-6">
                        {groups.length > 1 && (
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
                        )}

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
                                    key={p._id || i}
                                    className="w-[90%] sm:w-[280px] md:w-[300px] lg:w-[320px] flex-shrink-0"
                                >
                                    <PlanCard plan={p} />
                                </div>
                            ))}
                        </motion.div>

                        {groups.length > 1 && (
                            <button
                                onClick={() => setGroupIndex((s) => (s + 1) % groups.length)}
                                className="absolute right-0 md:right-2 sm:right-6 top-1/2 -translate-y-1/2 
                                    flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 
                                    text-white rounded-full transition z-50"
                            >
                                <ChevronRight size={36} strokeWidth={3} />
                            </button>
                        )}
                    </div>
                )}

                <div className="mt-6 sm:mt-8 text-center text-white font-bold text-[10px] sm:text-xs md:text-sm space-y-3">
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

                    <p>
                        Prices are exclusive of GST and other applicable taxes in your region.
                        <br />
                        If you require an invoice to process your CropGen subscription, please
                        contact our support team.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}