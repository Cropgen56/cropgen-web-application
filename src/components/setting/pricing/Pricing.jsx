import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  X,
  Building2,
  ArrowRight,
  Crown,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSubscriptions } from "../../../redux/slices/subscriptionSlice";

const FEATURE_DISPLAY_NAMES = {
  satelliteImagery: "Satellite Imagery",
  cropHealthAndYield: "Crop Health & Yield Monitoring",
  soilAnalysisAndHealth: "Soil Analysis & Health",
  weatherAnalytics: "Weather Analytics",
  vegetationIndices: "Vegetation Indices",
  waterIndices: "Water Indices",
  evapotranspirationMonitoring: "Evapotranspiration Monitoring",
  agronomicInsights: "Agronomic Insights",
  weeklyAdvisoryReports: "Weekly Advisory Reports",
  cropGrowthMonitoring: "Crop Growth Monitoring",
  farmOperationsManagement: "Farm Operations Management",
  diseaseDetectionAlerts: "Disease Detection Alerts",
  smartAdvisorySystem: "Smart Advisory System",
  soilReportGeneration: "Soil Report Generation",
  other: "Other Features",
};

const ENTERPRISE_PLAN = {
  _id: "enterprise",
  name: "Enterprise",
  description: "Custom solution for large-scale agriculture",
  features: Object.entries(FEATURE_DISPLAY_NAMES).map(([key, name]) => ({
    name,
    enabled: true,
  })),
  isEnterprise: true,
  active: true,
};

function transformApiData(apiData) {
  if (!Array.isArray(apiData)) return [];

  const plans = apiData.map((plan) => {
    const pricing = plan.pricing || [];
    const getPrice = (cycle, currency) =>
      pricing.find((p) => p.billingCycle === cycle && p.currency === currency)
        ?.amountMinor / 100 || 0;

    const features = Object.entries(FEATURE_DISPLAY_NAMES).map(
      ([key, name]) => ({
        name,
        enabled: !!(plan.features?.[key] ?? false),
      })
    );

    return {
      ...plan,
      prices: {
        monthly: {
          INR: getPrice("monthly", "INR"),
          USD: getPrice("monthly", "USD"),
        },
        yearly: {
          INR: getPrice("yearly", "INR"),
          USD: getPrice("yearly", "USD"),
        },
      },
      features,
    };
  });

  plans.push(ENTERPRISE_PLAN);
  return plans.filter((p) => p.active !== false);
}

function PlanCard({
  plan,
  billing,
  currency,
  onSubscribeClick,
  onContactClick,
}) {
  const [flipped, setFlipped] = useState(false);
  const isEnterprise = !!plan.isEnterprise;

  const features = plan.features || [];
  const sortedFeatures = [...features].sort((a, b) => {
    if (a.enabled === b.enabled) return 0;
    return a.enabled ? -1 : 1;
  });

  const frontCount = Math.min(9, Math.ceil(sortedFeatures.length / 2) + 1);
  const frontFeatures = sortedFeatures.slice(0, frontCount);
  const backFeatures = sortedFeatures.slice(frontCount);

  const price = plan.prices?.[billing]?.[currency] || 0;
  const symbol = currency === "INR" ? "₹" : "$";

  const handleSubscribe = (e) => {
    e.stopPropagation();
    onSubscribeClick?.({ plan, billing, currency });
  };

  const handleContact = (e) => {
    e.stopPropagation();
    if (onContactClick) onContactClick({ plan });
    else window.open("https://www.cropgenapp.com/contact", "_blank");
  };

  if (isEnterprise) {
    return (
      <div className="w-[320px] h-[450px]" style={{ perspective: 1000 }}>
        <motion.div
          onClick={() => setFlipped((s) => !s)}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.7 }}
          style={{
            transformStyle: "preserve-3d",
            width: "100%",
            height: "100%",
            position: "relative",
          }}
          className="cursor-pointer"
        >
          <div
            className="absolute inset-0 p-6 flex flex-col rounded-2xl bg-gradient-to-br from-[#1a2e22] via-[#344E41] to-[#2d4a3a] text-white border-2 border-[#E1FFF0]/30"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#E1FFF0] to-[#a8e6cf] text-[#344E41] text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1 shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
              <Crown size={12} className="text-[#344E41]" />
              ENTERPRISE
            </span>

            <div className="mt-3 mb-2 flex items-start gap-3">
              <div className="w-14 h-12 rounded-xl bg-[#E1FFF0]/20 border border-[#E1FFF0]/30 flex items-center justify-center">
                <Building2 className="text-[#E1FFF0]" size={28} />
              </div>

              <div className="flex flex-col gap-0.5">
                <h3 className="text-[20px] font-extrabold mb-0">{plan.name}</h3>
                <p className="text-xs text-gray-300 mb-0">{plan.description}</p>
              </div>
            </div>

            <div className="flex items-baseline gap-2 my-1">
              <p className="text-[20px] font-bold text-[#E1FFF0] mb-0">
                Custom Pricing
              </p>
            </div>

            <hr className="border-t border-white/60 my-2" />

            <div className="flex-1 flex flex-col gap-2 text-[11px] font-semibold overflow-hidden">
              {frontFeatures.map((f, idx) => (
                <p key={idx} className="flex items-center gap-2 mb-0">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      f.enabled ? "bg-[#E1FFF0]/20" : "bg-red-100"
                    }`}
                  >
                    {f.enabled ? (
                      <Check
                        strokeWidth={3}
                        size={12}
                        className="text-[#E1FFF0]"
                      />
                    ) : (
                      <X strokeWidth={3} size={12} className="text-red-500" />
                    )}
                  </div>
                  {f.name}
                </p>
              ))}
            </div>

            <div className="mt-2 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFlipped(true);
                }}
                className="flex-1 py-2 rounded-2xl text-xs bg-white/10 text-white hover:bg-white/20 transition-all duration-500 ease-in-out border border-white/20"
              >
                View All Features
              </button>
              <button
                onClick={handleContact}
                className="flex-1 py-2 rounded-2xl font-bold text-xs bg-[#E1FFF0] text-[#344E41] hover:bg-white transition-all duration-500 ease-in-out flex items-center justify-center gap-1"
              >
                Contact Us
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div
            className="absolute inset-0 rounded-2xl shadow-xl p-6 flex flex-col bg-gradient-to-br from-[#1a2e22] via-[#344E41] to-[#2d4a3a] text-white border-2 border-[#E1FFF0]/30"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="flex items-center gap-2 mt-4 mb-3">
              <Building2 className="text-[#E1FFF0]" size={24} />
              <h3 className="text-[18px] font-bold">
                {plan.name} — All Features
              </h3>
            </div>

            <div className="text-[11px] flex-1 overflow-auto font-semibold leading-[20px] pr-2">
              {features.map((f, idx) => (
                <p key={idx} className="flex items-center gap-2 mb-1.5">
                  <Check
                    strokeWidth={4}
                    size={14}
                    className="text-[#E1FFF0] shrink-0"
                  />
                  {f.name}
                </p>
              ))}
            </div>

            <div className="mt-2 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFlipped(false);
                }}
                className="flex-1 py-2 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all duration-500 ease-in-out border border-white/20"
              >
                Back
              </button>
              <button
                onClick={handleContact}
                className="flex-1 py-2 rounded-2xl font-bold text-xs bg-[#E1FFF0] text-[#344E41] hover:bg-white transition-all duration-500 ease-in-out flex items-center justify-center gap-1"
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
    <div className="w-[300px] h-[450px]" style={{ perspective: 1000 }}>
      <motion.div
        onClick={() => setFlipped((s) => !s)}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7 }}
        style={{
          transformStyle: "preserve-3d",
          width: "100%",
          height: "100%",
          position: "relative",
        }}
        className="cursor-pointer"
      >
        <div
          className="absolute inset-0 rounded-2xl px-4 py-3 flex flex-col gap-2 bg-white text-black border-1 border-[#344E41]"
          style={{ backfaceVisibility: "hidden" }}
        >
          <h3 className="text-[24px] font-extrabold mb-0">{plan.name}</h3>
          <p className="text-xs mb-0">{plan.description}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-[20px] font-bold text-[#344E41] mb-0">
              {price === 0 ? "Free" : `${symbol}${price}`}
            </p>
            <span className="text-sm text-gray-500">/{billing}</span>
          </div>

          <hr className="border-t border-1 border-[#344E41] my-2" />

          <div className="flex-1 flex flex-col gap-2 text-[11px] font-semibold overflow-hidden">
            {frontFeatures.map((f, idx) => (
              <p key={idx} className="flex items-center gap-2 mb-0">
                {f.enabled ? (
                  <Check strokeWidth={3} size={14} className="text-green-500" />
                ) : (
                  <X strokeWidth={3} size={14} className="text-red-500" />
                )}
                {f.name}
              </p>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFlipped(true);
              }}
              className="flex-1 py-2 rounded-2xl text-xs bg-[#5A7C6B] text-white hover:bg-[#466657] transition-all duration-500 ease-in-out"
            >
              View All Features
            </button>
            <button
              onClick={handleSubscribe}
              className="flex-1 py-2 rounded-2xl font-bold text-xs bg-[#344E41] text-white hover:bg-[#2b3e33] transition-all duration-500 ease-in-out"
            >
              Subscribe
            </button>
          </div>
        </div>

        <div
          className="absolute inset-0 rounded-2xl px-4 py-3 flex flex-col gap-2 bg-white text-black border-1 border-[#344E41]"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <h3 className="text-[18px] font-bold mb-2">
            {plan.name} — All Features
          </h3>
          <div className="text-[11px] flex-1 overflow-auto font-semibold leading-[24px] pr-2">
            {backFeatures.map((f, idx) => (
              <p key={idx} className="flex items-center gap-2 mb-1">
                {f.enabled ? (
                  <Check strokeWidth={3} size={14} className="text-green-500" />
                ) : (
                  <X strokeWidth={3} size={14} className="text-red-500" />
                )}
                {f.name}
              </p>
            ))}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFlipped(false);
            }}
            className="mt-3 w-full py-2 rounded-2xl bg-[#5A7C6B] text-white hover:bg-[#466657] transition-all duration-500 ease-in-out"
          >
            Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const Pricing = ({ setShowSidebar }) => {
  const dispatch = useDispatch();
  const { subscriptions = [] } = useSelector(
    (state) => state.subscription || {}
  );
  const [billing, setBilling] = useState("monthly");
  const [currency, setCurrency] = useState("INR");
  const [index, setIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(1);

  useEffect(() => {
    dispatch(fetchSubscriptions());
  }, [dispatch]);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setCardsPerView(1);
      else if (window.innerWidth < 1024) setCardsPerView(2);
      else setCardsPerView(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const plans = useMemo(() => transformApiData(subscriptions), [subscriptions]);
  const maxIndex = Math.max(plans.length - cardsPerView, 0);

  return (
    <div className="max-w-[1200px] w-[99%] mx-auto my-2 p-2 lg:p-4 rounded-lg bg-white shadow-md font-inter h-[98%] overflow-y-auto">
      <div className="flex items-center justify-between text-left px-4 py-1 border-b border-black/40 text-[#344E41]">
        <h5 className="font-bold">Pricing & Plans</h5>
        <button
          onClick={() => setShowSidebar(true)}
          className="flex items-center gap-1 text-sm text-[#344E41] hover:text-[#1d3039] transition-all duration-300 ease-in-out cursor-pointer"
        >
          <ArrowLeft size={18} /> Back to Settings
        </button>
      </div>

      <div className="flex justify-between sm:justify-end sm: gap-4 mt-3 items-center w-full">
        <div className="flex rounded-md border overflow-hidden">
          {["monthly", "yearly"].map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={`px-2 sm:px-4 py-1.5 text-sm transition-all ease-in-out duration-500 ${
                billing === b
                  ? "bg-[#344E41] text-white"
                  : "bg-white text-gray-600 hover:text-[#344E41]"
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        <div className="flex rounded-md border overflow-hidden">
          {["INR", "USD"].map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-2 sm:px-4 py-1.5 text-sm transition-all ease-in-out duration-500 ${
                currency === c
                  ? "bg-[#344E41] text-white"
                  : "bg-white text-gray-600 hover:text-[#344E41]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden">
        <button
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          disabled={index === 0}
          className={`absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-1 shadow-[0_2px_6px_rgba(0,0,0,0.3)]
    ${index === 0 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"}`}
        >
          <ChevronLeft />
        </button>

        <div className="overflow-hidden">
          <div
            className="flex gap-4 transition-transform duration-300 my-4"
            style={{
              transform: `translateX(-${index * (100 / cardsPerView)}%)`,
              width: `${(plans.length * 100) / cardsPerView}%`,
            }}
          >
            {plans.map((plan) => (
              <div
                key={plan._id}
                className="flex justify-center"
                style={{ width: `${100 / plans.length}%` }}
              >
                <PlanCard plan={plan} billing={billing} currency={currency} />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIndex((i) => Math.min(i + 1, maxIndex))}
          disabled={index === maxIndex}
          className={`absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-1 shadow-[0_2px_6px_rgba(0,0,0,0.3)]
    ${
      index === maxIndex ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"
    }`}
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Pricing;
