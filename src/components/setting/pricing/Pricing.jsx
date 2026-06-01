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
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSubscriptions } from "../../../redux/slices/subscriptionSlice";
import SettingsPanel from "../SettingsPanel";

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

function findPricingEntry(pricing, cycle, currency) {
  if (!Array.isArray(pricing) || pricing.length === 0) return null;
  const cur = String(currency || "").toUpperCase();
  const cyc = String(cycle || "").toLowerCase();

  const norm = (p) => ({
    currency: String(p.currency ?? p.currencyCode ?? "").toUpperCase(),
    billingCycle: String(
      p.billingCycle ?? p.billing_cycle ?? ""
    ).toLowerCase(),
  });

  const byCycle = pricing.filter((p) => norm(p).billingCycle === cyc);
  if (byCycle.length === 0) return null;

  const exact = byCycle.find((p) => norm(p).currency === cur);
  if (exact) return exact;

  return byCycle[0];
}

function amountMajorFromEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return { value: 0, perAcre: false };
  }

  if (typeof entry.amountMinor === "number") {
    return { value: entry.amountMinor / 100, perAcre: false };
  }
  if (typeof entry.amount_minor === "number") {
    return { value: entry.amount_minor / 100, perAcre: false };
  }
  if (typeof entry.pricePerUnitMinor === "number") {
    return { value: entry.pricePerUnitMinor / 100, perAcre: true };
  }
  if (typeof entry.price_per_unit_minor === "number") {
    return { value: entry.price_per_unit_minor / 100, perAcre: true };
  }
  if (typeof entry.amount === "number") {
    return { value: entry.amount, perAcre: false };
  }
  if (typeof entry.price === "number") {
    return { value: entry.price, perAcre: false };
  }

  return { value: 0, perAcre: false };
}

function buildPriceTier(pricing, cycle, currency) {
  const entry = findPricingEntry(pricing, cycle, currency);
  const { value, perAcre } = amountMajorFromEntry(entry);
  const displayCurrency =
    entry && String(entry.currency ?? entry.currencyCode ?? "").trim()
      ? String(entry.currency ?? entry.currencyCode).toUpperCase()
      : String(currency || "").toUpperCase();
  return { value, perAcre, displayCurrency };
}

function transformApiData(apiData) {
  if (!Array.isArray(apiData)) return [];

  const plans = apiData
    .filter(
      (plan) =>
        (plan.platform == null ||
          plan.platform === "" ||
          plan.platform === "web") &&
        plan.active !== false &&
        plan.isInternal !== true
    )
    .map((plan) => {
      const pricing = plan.pricing || [];

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
            INR: buildPriceTier(pricing, "monthly", "INR"),
            USD: buildPriceTier(pricing, "monthly", "USD"),
          },
          yearly: {
            INR: buildPriceTier(pricing, "yearly", "INR"),
            USD: buildPriceTier(pricing, "yearly", "USD"),
          },
        },
        features,
      };
    });

  plans.push(ENTERPRISE_PLAN);
  return plans.filter((p) => p.active !== false);
}

function formatPlanPrice(value, currency) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  if (currency === "INR") {
    return n.toLocaleString("en-IN", {
      maximumFractionDigits: n % 1 === 0 ? 0 : 2,
      minimumFractionDigits: 0,
    });
  }
  return n.toLocaleString("en-US", {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
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

  const tier = plan.prices?.[billing]?.[currency] || {
    value: 0,
    perAcre: false,
    displayCurrency: currency,
  };
  const price = tier.value ?? 0;
  const perAcre = !!tier.perAcre;
  const displayCurrency = tier.displayCurrency || currency;
  const symbol = displayCurrency === "INR" ? "₹" : "$";

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
      <div className="w-[320px] h-[450px] flex-shrink-0" style={{ perspective: 1000 }}>
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
            className="absolute inset-0 p-6 flex flex-col rounded-2xl bg-gradient-to-br from-[#0a2e22] via-ember-sidebar to-ember-gradient-mid text-white border-2 border-[#E1FFF0]/30"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#E1FFF0] to-[#a8e6cf] text-ember-sidebar text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1 shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
              <Crown size={12} className="text-ember-sidebar" />
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
                className="flex-1 py-2 rounded-2xl font-bold text-xs bg-[#E1FFF0] text-ember-sidebar hover:bg-white transition-all duration-500 ease-in-out flex items-center justify-center gap-1"
              >
                Contact Us
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div
            className="absolute inset-0 rounded-2xl shadow-xl p-6 flex flex-col bg-gradient-to-br from-[#0a2e22] via-ember-sidebar to-ember-gradient-mid text-white border-2 border-[#E1FFF0]/30"
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
                className="flex-1 py-2 rounded-2xl font-bold text-xs bg-[#E1FFF0] text-ember-sidebar hover:bg-white transition-all duration-500 ease-in-out flex items-center justify-center gap-1"
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
      className="h-[min(400px,72vh)] w-[min(280px,82vw)] flex-shrink-0 sm:h-[420px] sm:w-[260px] md:w-[280px]"
      style={{ perspective: 1000 }}
    >
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
          className="absolute inset-0 rounded-2xl px-4 py-3 flex flex-col gap-2 bg-white text-black border-1 border-ember-sidebar"
          style={{ backfaceVisibility: "hidden" }}
        >
          <h3 className="mb-0 text-lg font-extrabold sm:text-xl">{plan.name}</h3>
          <p className="text-xs mb-0">{plan.description}</p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="text-[20px] font-bold text-ember-sidebar mb-0">
              {price === 0 ? (
                "Free"
              ) : (
                <>
                  {symbol}
                  {formatPlanPrice(price, displayCurrency)}
                  {perAcre ? (
                    <span className="text-sm font-semibold text-ember-sidebar/80">
                      /acre
                    </span>
                  ) : null}
                </>
              )}
            </p>
            <span className="text-sm text-gray-500">/{billing}</span>
            {displayCurrency !== currency && price !== 0 ? (
              <span className="text-[10px] text-gray-400 w-full">
                Priced in {displayCurrency}
              </span>
            ) : null}
          </div>

          <hr className="border-t border-1 border-ember-sidebar my-2" />

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
              className="flex-1 py-2 rounded-2xl font-bold text-xs bg-ember-sidebar text-white hover:bg-ember-sidebar-hover transition-all duration-500 ease-in-out"
            >
              Subscribe
            </button>
          </div>
        </div>

        <div
          className="absolute inset-0 rounded-2xl px-4 py-3 flex flex-col gap-2 bg-white text-black border-1 border-ember-sidebar"
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
  const scrollContainerRef = React.useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    dispatch(fetchSubscriptions());
  }, [dispatch]);

  const plans = useMemo(() => transformApiData(subscriptions), [subscriptions]);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [plans]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350; // Card width + gap
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <SettingsPanel
      title="Pricing & Plans"
      description="Choose the plan that best fits your farm needs."
      onBack={setShowSidebar}
      className="h-full bg-[#f8fbf9]"
    >
      <div className="mx-auto w-full max-w-6xl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex overflow-hidden rounded-md border border-gray-200 text-xs">
          {["monthly", "yearly"].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBilling(b)}
              className={`px-2.5 py-1 capitalize transition-colors sm:px-3 sm:py-1.5 ${
                billing === b
                  ? "bg-ember-sidebar text-white"
                  : "bg-white text-gray-600 hover:text-ember-sidebar"
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        <div className="flex overflow-hidden rounded-md border border-gray-200 text-xs">
          {["INR", "USD"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              className={`px-2.5 py-1 transition-colors sm:px-3 sm:py-1.5 ${
                currency === c
                  ? "bg-ember-sidebar text-white"
                  : "bg-white text-gray-600 hover:text-ember-sidebar"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-2 shadow-[0_2px_6px_rgba(0,0,0,0.3)] hover:bg-gray-100 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="scrollbar-hide my-3 overflow-x-auto overflow-y-hidden sm:my-4"
          style={{
            scrollBehavior: "smooth",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          <div className="flex gap-4 pb-2">
            {plans.map((plan) => (
              <PlanCard
                key={plan._id}
                plan={plan}
                billing={billing}
                currency={currency}
              />
            ))}
          </div>
        </div>

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-2 shadow-[0_2px_6px_rgba(0,0,0,0.3)] hover:bg-gray-100 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      </div>
    </SettingsPanel>
  );
};

export default Pricing;