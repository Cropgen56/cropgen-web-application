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
import { planCurrencyForUser } from "../../../utils/planRegion";
import { fetchSubscriptions } from "../../../redux/slices/subscriptionSlice";
import SettingsPanel from "../SettingsPanel";
import { FEATURE_DISPLAY_NAMES } from "../../../utils/planFeatures";
import {
  ENTERPRISE_CONTACT_URL,
  ENTERPRISE_NAME,
  ENTERPRISE_PRICING,
  ENTERPRISE_TAGLINE,
} from "../../../utils/enterprisePlan";


const ENTERPRISE_PLAN = {
  _id: "enterprise",
  name: ENTERPRISE_NAME,
  description: ENTERPRISE_TAGLINE,
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

  return byCycle.find((p) => norm(p).currency === cur) || null;
}

/** 1 acre = 0.404686 ha. Web shows every plan price per hectare. */
const ACRES_TO_HECTARES = 0.404686;

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
    const major = entry.pricePerUnitMinor / 100;
    const perHa = entry.unit === "hectare" ? major : major / ACRES_TO_HECTARES;
    return { value: Math.round(perHa * 100) / 100, perAcre: true };
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
          plan.platform === "web" ||
          plan.platform === "all") &&
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

/**
 * Real yearly saving vs paying monthly for 12 months, from the plan's own
 * per-hectare prices in `currency`. Returns null when it can't be computed
 * (missing price, enterprise, or yearly not cheaper).
 */
function yearlySavings(plan, currency) {
  const m = plan?.prices?.monthly?.[currency]?.value;
  const y = plan?.prices?.yearly?.[currency]?.value;
  if (!(m > 0) || !(y > 0)) return null;
  const monthsPaid = m * 12;
  const saved = monthsPaid - y;
  const pct = Math.round((saved / monthsPaid) * 100);
  if (!(pct > 0)) return null;
  return { pct, saved, monthsPaid, yearly: y, perMonth: y / 12 };
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
  const savings = isEnterprise ? null : yearlySavings(plan, currency);

  const handleSubscribe = (e) => {
    e.stopPropagation();
    onSubscribeClick?.({ plan, billing, currency });
  };

  const handleContact = (e) => {
    e.stopPropagation();
    if (onContactClick) onContactClick({ plan });
    else window.open(ENTERPRISE_CONTACT_URL, "_blank", "noopener,noreferrer");
  };

  if (isEnterprise) {
    return (
      <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.25 }} className="w-[min(320px,86vw)] min-h-[450px] flex-shrink-0" style={{ perspective: 1000 }}>
        <motion.div
          onClick={() => setFlipped((s) => !s)}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.7 }}
          style={{
            transformStyle: "preserve-3d",
            width: "100%",
            height: "100%",
            minHeight: 450,
            position: "relative",
          }}
          className="cursor-pointer"
        >
          <div
            className="relative h-full p-6 flex flex-col rounded-3xl shadow-2xl bg-gradient-to-br from-[#0a2e22] via-ember-sidebar to-ember-gradient-mid text-white border-2 border-[#E1FFF0]/30"
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

            <div className="my-1 flex flex-col gap-1">
              {ENTERPRISE_PRICING.map(({ label, value }) => (
                <p
                  key={label}
                  className="mb-0 flex items-baseline justify-between gap-3 text-xs text-white/75"
                >
                  {label}
                  <span className="text-[18px] font-bold text-[#E1FFF0]">
                    {value}
                  </span>
                </p>
              ))}
            </div>

            <hr className="border-t border-white/60 my-2" />

            <div className="flex-1 flex flex-col gap-2.5 text-xs font-semibold">
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
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="min-h-[430px] w-[min(300px,82vw)] flex-shrink-0 sm:w-[290px] md:w-[300px]"
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
          minHeight: 430,
          position: "relative",
        }}
        className="cursor-pointer"
      >
        <div
          className={`relative h-full overflow-hidden rounded-3xl px-5 py-4 flex flex-col gap-2.5 text-black shadow-lg ${
            plan.isFreeTrialOffer
              ? "bg-gradient-to-b from-[#d6f5e3] via-[#f1fbf5] to-white border-2 border-[#5A7C6B]/60"
              : "bg-white border border-[#344E41]/15"
          }`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {plan.isFreeTrialOffer ? (
            <span className="absolute right-4 top-4 rounded-full bg-[#344E41] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              {plan.trialDays} days free
            </span>
          ) : null}
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#5A7C6B] via-[#7dd3a8] to-[#344E41]" />
          <h3 className="mb-0 mt-1 text-xl font-extrabold sm:text-2xl">{plan.name}</h3>
          <p className="text-sm mb-0 text-gray-600">{plan.description}</p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="text-[28px] font-extrabold tracking-tight text-ember-sidebar mb-0">
              {plan.isFreeTrialOffer || price === 0 ? (
                "Free"
              ) : (
                <>
                  {symbol}
                  {formatPlanPrice(price, displayCurrency)}
                  {perAcre ? (
                    <span className="text-sm font-semibold text-ember-sidebar/80">
                      /ha
                    </span>
                  ) : null}
                </>
              )}
            </p>
            <span className="whitespace-nowrap text-sm text-gray-500">
              {plan.isFreeTrialOffer
                ? `for ${plan.trialDays} days`
                : billing === "yearly"
                ? "/year"
                : "/month"}
            </span>
            {plan.isFreeTrialOffer ? (
              <span className="w-full text-[11px] text-gray-500">
                1 farm, up to {plan.freeTrialOffer.maxHectares} ha, then{" "}
                {symbol}
                {formatPlanPrice(price, displayCurrency)}/ha per {billing === "yearly" ? "year" : "month"}
              </span>
            ) : null}
            {displayCurrency !== currency && price !== 0 ? (
              <span className="text-[10px] text-gray-400 w-full">
                Priced in {displayCurrency}
              </span>
            ) : null}
            {savings && !plan.isFreeTrialOffer ? (
              billing === "yearly" ? (
                <div className="w-full space-y-1">
                  <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
                    You save {savings.pct}% vs monthly
                  </span>
                  <p className="mb-0 text-[11px] text-gray-500">
                    <span className="line-through">
                      {symbol}
                      {formatPlanPrice(savings.monthsPaid, displayCurrency)}
                    </span>{" "}
                    {symbol}
                    {formatPlanPrice(savings.yearly, displayCurrency)}/ha per
                    year = {symbol}
                    {formatPlanPrice(savings.perMonth, displayCurrency)}/ha per
                    month. You save {symbol}
                    {formatPlanPrice(savings.saved, displayCurrency)}/ha.
                  </p>
                </div>
              ) : (
                <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
                  Save {savings.pct}% with yearly billing
                </span>
              )
            ) : null}
          </div>

          <hr className="border-t border-[#344E41]/15 my-2" />

          <div className="flex-1 flex flex-col gap-2.5 text-xs font-semibold">
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

          <div className="mt-auto flex gap-2 pt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFlipped(true);
              }}
              className="min-w-0 flex-1 h-11 whitespace-nowrap px-2 rounded-xl text-[13px] font-semibold border border-[#5A7C6B]/50 bg-white text-[#344E41] hover:border-[#344E41] hover:bg-[#eefaf3] transition-all duration-300 ease-in-out"
            >
              All Features
            </button>
            <button
              onClick={handleSubscribe}
              className="min-w-0 flex-[1.35] h-11 whitespace-nowrap px-2 rounded-xl font-bold text-[13px] bg-gradient-to-r from-[#344E41] to-[#5A7C6B] text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 transition-all duration-300 ease-in-out"
            >
              {plan.isFreeTrialOffer ? "Start Free Trial" : "Subscribe"}
            </button>
          </div>
        </div>

        <div
          className="absolute inset-0 overflow-hidden rounded-3xl px-5 py-4 flex flex-col gap-2 bg-gradient-to-b from-[#eefaf3] via-white to-white text-black border border-[#344E41]/20 shadow-lg"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <h3 className="text-[18px] font-bold mb-2">
            {plan.name} — All Features
          </h3>
          <div className="text-xs flex-1 overflow-auto font-semibold leading-[24px] pr-2">
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
            className="mt-3 w-full min-h-[40px] py-2 rounded-2xl bg-gradient-to-r from-[#344E41] to-[#5A7C6B] text-sm font-bold text-white shadow-md hover:brightness-110 transition-all duration-300 ease-in-out"
          >
            Back
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

const Pricing = ({ setShowSidebar }) => {
  const dispatch = useDispatch();
  const { subscriptions = [], currency: serverCurrency = null } = useSelector(
    (state) => state.subscription || {}
  );
  const [billing, setBilling] = useState("monthly");
  const { user } = useSelector((state) => state.auth || {});
  // India -> INR plan, everyone else -> USD plans (by profile country).
  const currency = useMemo(
    () => planCurrencyForUser(user, serverCurrency),
    [user, serverCurrency]
  );
  const scrollContainerRef = React.useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    dispatch(fetchSubscriptions());
  }, [dispatch]);

  const plans = useMemo(
    () =>
      transformApiData(subscriptions).filter(
        (p) =>
          p.isEnterprise ||
          (p.pricing || []).some(
            (r) => String(r.currency).toUpperCase() === currency
          )
      ),
    [subscriptions, currency]
  );

  // Free Trial card (e.g. 21 days), built from the plan that carries the
  // trial offer in the shown currency (same as the "Choose the Right Plan" popup).
  const displayPlans = useMemo(() => {
    const base = plans.find(
      (p) =>
        p.freeTrialOffer &&
        String(p.freeTrialOffer.currency || "").toUpperCase() === currency
    );
    if (!base) return plans;
    const offer = base.freeTrialOffer;
    const trialCard = {
      ...base,
      _id: `free-trial:${base._id}`,
      name: "Free Trial",
      description: `${offer.days} days of ${base.name} features`,
      isFreeTrialOffer: true,
      trialDays: offer.days,
    };
    return [trialCard, ...plans];
  }, [plans, currency]);

  const savingsPcts = displayPlans
    .filter((p) => !p.isFreeTrialOffer && !p.isEnterprise)
    .map((p) => yearlySavings(p, currency)?.pct || 0)
    .filter((n) => n > 0);
  const maxSavingsPct = savingsPcts.length ? Math.max(...savingsPcts) : 0;
  const minSavingsPct = savingsPcts.length ? Math.min(...savingsPcts) : 0;

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
        <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-white text-sm shadow-sm">
          {["monthly", "yearly"].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBilling(b)}
              className={`min-h-[38px] px-4 py-1.5 font-semibold capitalize transition-colors ${
                billing === b
                  ? "bg-ember-sidebar text-white"
                  : "bg-white text-gray-600 hover:text-ember-sidebar"
              }`}
            >
              {b}
              {b === "yearly" && maxSavingsPct > 0 ? (
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold normal-case ${
                    billing === "yearly"
                      ? "bg-white/20 text-white"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  Save {minSavingsPct === maxSavingsPct ? "" : "up to "}
                  {maxSavingsPct}%
                </span>
              ) : null}
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
          className="scrollbar-hide my-3 overflow-x-auto overflow-y-hidden rounded-3xl bg-gradient-to-br from-[#dff3e8] via-[#eef8f2] to-[#cfe9db] sm:my-4"
          style={{
            scrollBehavior: "smooth",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          <div className="flex items-stretch gap-5 px-4 pb-5 pt-5">
            {displayPlans
              .filter(
                (plan) =>
                  plan.isEnterprise ||
                  (plan.pricing || []).some(
                    (p) => String(p.currency).toUpperCase() === currency,
                  ),
              )
              .map((plan) => (
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