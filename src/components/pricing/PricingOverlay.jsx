import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchSubscriptions,
  createUserSubscription,
  verifyUserSubscriptionPayment,
  setPaymentSuccess,
} from "../../redux/slices/subscriptionSlice";
import { getFarmFields } from "../../redux/slices/farmSlice";
import { toast } from "react-toastify";
import PlanCard from "./PlanCard";

/* ================= CONSTANTS ================= */

const PLAN_ORDER = [
  "web-basic",
  "web-pro",
  "web-premium",
  "free-trial",
  "basic",
  "pro",
  "premium",
];

/** US survey acre → hectare (same factor as elsewhere in the web app). */
const ACRES_TO_HECTARES = 0.404686;

function resolveFieldAreaAcres(selectedField) {
  const acre = Number(selectedField?.acre);
  if (acre > 0) return acre;
  const ha = Number(selectedField?.areaInHectares);
  if (ha > 0) return ha / ACRES_TO_HECTARES;
  return 0;
}

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
  other: "Other",
};

const ENTERPRISE_PLAN = {
  _id: "enterprise",
  name: "Enterprise",
  tagline: "Complete solution for large-scale agricultural operations",
  isEnterprise: true,
  features: Object.values(FEATURE_DISPLAY_NAMES),
  missing: [],
  active: true,
};

/* ================= HELPERS ================= */

/** Matches API free-trial plans even if slug is not exactly "free-trial" (e.g. trial, free_trial). */
function isCatalogTrialPlan(plan) {
  const s = (plan?.slug || "").toLowerCase().replace(/_/g, "-").trim();
  const n = (plan?.name || "").toLowerCase();
  if (s === "free-trial" || s === "freetrial") return true;
  if (s === "trial" || s.endsWith("-trial")) return true;
  if (n.includes("free") && n.includes("trial")) return true;
  return false;
}

function transformApiData(
  apiData,
  billing,
  selectedField,
  platform = "web",
  displayCurrency = "USD",
) {
  if (!Array.isArray(apiData)) return [];

  const area = resolveFieldAreaAcres(selectedField);
  const areaHectares = area * ACRES_TO_HECTARES;
  const cur = displayCurrency === "INR" ? "INR" : "USD";

  let plans = apiData
    .filter(
      (plan) =>
        plan.platform === platform &&
        plan.active !== false &&
        plan.isInternal !== true,
    )
    .map((plan) => {
      const priceObj = plan.pricing?.find(
        (p) => p.currency === "USD" && p.billingCycle === billing,
      );
      const inrObj = plan.pricing?.find(
        (p) => p.currency === "INR" && p.billingCycle === billing,
      );

      let unitPrice = 0;
      let total = 0;
      let unitPriceInr = 0;
      let totalPriceInr = 0;

      if (priceObj && area > 0) {
        unitPrice = priceObj.pricePerUnitMinor / 100; // cents → dollars
        total = unitPrice * area;
      }
      if (inrObj && area > 0) {
        unitPriceInr = inrObj.pricePerUnitMinor / 100; // paise → rupees
        totalPriceInr = unitPriceInr * area;
      }

      const enabled = [];
      const disabled = [];

      Object.entries(plan.features || {}).forEach(([k, v]) => {
        (v ? enabled : disabled).push(FEATURE_DISPLAY_NAMES[k] || k);
      });

      const catalogTrialSlug = isCatalogTrialPlan(plan);
      const isTrialPlan =
        plan.isTrialEnabled === true || catalogTrialSlug;
      const primaryRow = cur === "INR" ? inrObj : priceObj;
      const unavailableForBilling = !primaryRow;

      return {
        _id: plan._id,
        slug: plan.slug,
        name: plan.name,
        tagline: plan.description,
        billingCycle: billing,

        unitPrice,
        totalPrice: total,
        unitPriceInr,
        totalPriceInr,
        hasInrPricing: Boolean(inrObj),
        hasUsdPricing: Boolean(priceObj),
        priceDisplayCurrency: cur,

        area,
        areaHectares,

        features: enabled,
        missing: disabled,
        isTrialPlan,
        trialDays:
          isTrialPlan && plan.trialDays >= 1
            ? plan.trialDays
            : isTrialPlan
              ? 7
              : 0,
        active: plan.active,
        isEnterprise: false,
        unavailableForBilling,
      };
    });

  plans.sort((a, b) => {
    const ia = PLAN_ORDER.indexOf(a.slug);
    const ib = PLAN_ORDER.indexOf(b.slug);
    const sa = ia === -1 ? PLAN_ORDER.length : ia;
    const sb = ib === -1 ? PLAN_ORDER.length : ib;
    if (sa !== sb) return sa - sb;
    return (a.name || "").localeCompare(b.name || "");
  });
  plans.push(ENTERPRISE_PLAN);

  return plans;
}

/* ================= COMPONENT ================= */

export default function PricingOverlay({ onClose, selectedField }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { subscriptions, loading, error } = useSelector((s) => s.subscription);
  const { token, user } = useSelector((s) => s.auth);

  const [billing, setBilling] = useState("monthly");
  /** Shown prices + sent as displayCurrency on create-order (server uses matching pricing row). */
  const [displayCurrency, setDisplayCurrency] = useState("USD");
  const [groupIndex, setGroupIndex] = useState(0);
  const [cardsPerGroup, setCardsPerGroup] = useState(3);
  const [checkoutData, setCheckoutData] = useState(null);
  const [dialogError, setDialogError] = useState(null);
  const [showBillingDetails, setShowBillingDetails] = useState(false);

  /** Keep latest values for Razorpay handler (avoids stale closures). */
  const selectedFieldRef = useRef(selectedField);
  const userRef = useRef(user);
  const dispatchRef = useRef(dispatch);
  const navigateRef = useRef(navigate);
  const onCloseRef = useRef(onClose);
  /** Prevents double rzp.open when effect re-runs (Strict Mode or unstable callback deps). */
  const rzpOpenKeyRef = useRef(null);

  useEffect(() => {
    selectedFieldRef.current = selectedField;
    userRef.current = user;
  }, [selectedField, user]);

  useEffect(() => {
    dispatchRef.current = dispatch;
    navigateRef.current = navigate;
    onCloseRef.current = onClose;
  }, [dispatch, navigate, onClose]);

  const resolveUserId = () => userRef.current?.id ?? userRef.current?._id;

  /* ---------- LOAD DATA ---------- */

  useEffect(() => {
    dispatch(fetchSubscriptions());
  }, [dispatch]);

  useEffect(() => {
    if (!window.Razorpay) {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  /* ---------- RESPONSIVE ---------- */

  useEffect(() => {
    const resize = () => {
      if (window.innerWidth < 768) setCardsPerGroup(1);
      else if (window.innerWidth < 1024) setCardsPerGroup(2);
      else setCardsPerGroup(3);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ---------- DATA ---------- */

  const plans = useMemo(
    () =>
      transformApiData(
        subscriptions,
        billing,
        selectedField,
        "web",
        displayCurrency,
      ),
    [subscriptions, billing, selectedField, displayCurrency],
  );

  const headerTrialDays = useMemo(() => {
    const p = plans.find((pl) => pl.isTrialPlan && pl.trialDays > 0);
    return p?.trialDays ?? null;
  }, [plans]);

  const groups = useMemo(() => {
    const arr = [];
    for (let i = 0; i < plans.length; i += cardsPerGroup) {
      arr.push(plans.slice(i, i + cardsPerGroup));
    }
    return arr;
  }, [plans, cardsPerGroup]);

  const visiblePlans = groups[groupIndex] || [];

  const refreshFarmFields = useCallback(async () => {
    const userId = resolveUserId();
    if (!userId) {
      toast.error("Could not refresh your farms. Please reload the page.");
      return;
    }
    try {
      await dispatch(getFarmFields(userId)).unwrap();
    } catch (e) {
      console.error("getFarmFields after subscribe:", e);
      toast.warn(
        "Subscription saved, but farm list could not refresh. Pull to refresh or reopen the app.",
      );
    }
  }, [dispatch]);

  const refreshFarmFieldsRef = useRef(refreshFarmFields);
  useEffect(() => {
    refreshFarmFieldsRef.current = refreshFarmFields;
  }, [refreshFarmFields]);

  /* ---------- SUBSCRIBE ---------- */

  const handleSubscribeClick = async ({ plan }) => {
    if (!token) return toast.error("Please login");

    try {
      const farmId = selectedField?.id ?? selectedField?._id;
      if (!farmId) {
        setDialogError(
          "Missing farm id. Please reopen this screen from your farm.",
        );
        return;
      }

      if (plan.unavailableForBilling) {
        const other = displayCurrency === "USD" ? "INR" : "USD";
        setDialogError(
          `This plan has no ${billing} ${displayCurrency} price. Switch the currency toggle to ${other}, change Monthly/Yearly, or add ${displayCurrency} pricing in admin.`,
        );
        return;
      }

      const payload = {
        farmId,
        planId: plan._id,
        /** Web: every plan starts with a free trial; post-trial billing uses Monthly/Yearly toggle. */
        billingCycle: "trial",
        commitBillingCycle: billing,
        displayCurrency,
      };

      const res = await dispatch(createUserSubscription(payload)).unwrap();

      if (res.type === "trial") {
        dispatch(
          setPaymentSuccess({
            fieldName: selectedField.fieldName,
            planName: plan.name,
            daysLeft: res.daysLeft,
          }),
        );

        await refreshFarmFields();
        onClose();
        return;
      }

      if (res.type === "trial_with_mandate" && res.razorpay?.subscription_id) {
        setCheckoutData({
          checkoutKind: "subscription",
          plan,
          subscriptionId: res.subscriptionId,
          razorpay: res.razorpay,
          trialDaysLeft: res.daysLeft,
        });
        return;
      }

      if (res.type === "subscription" && res.razorpay?.subscription_id) {
        setCheckoutData({
          checkoutKind: "subscription",
          plan,
          subscriptionId: res.subscriptionId,
          razorpay: res.razorpay,
        });
        return;
      }

      setCheckoutData({
        checkoutKind: "order",
        plan,
        order: res.order,
        subscriptionId: res.subscriptionId,
      });
    } catch (e) {
      const message =
        (typeof e === "string" && e) ||
        e?.payload ||
        e?.message ||
        "Subscription failed. Please try again.";

      setDialogError(message);
    }
  };

  /* ---------- RAZORPAY ---------- */

  useEffect(() => {
    if (!checkoutData || !window.Razorpay) {
      if (!checkoutData) rzpOpenKeyRef.current = null;
      return;
    }

    const {
      checkoutKind,
      plan,
      order,
      subscriptionId,
      razorpay,
      trialDaysLeft,
    } = checkoutData;

    const openKey =
      checkoutKind === "order" && order?.id
        ? `order:${order.id}`
        : checkoutKind === "subscription" && razorpay?.subscription_id
          ? `subscription:${razorpay.subscription_id}`
          : null;

    if (openKey && rzpOpenKeyRef.current === openKey) {
      return;
    }
    if (openKey) rzpOpenKeyRef.current = openKey;

    const description =
      checkoutKind === "subscription" && trialDaysLeft != null
        ? `Save payment — full plan amount in INR only after your ${trialDaysLeft}-day trial ends.`
        : checkoutKind === "subscription"
          ? "CropGen subscription"
          : "Farm subscription";

    const fieldSnap = selectedFieldRef.current;
    const planSnap = plan;

    const options = {
      key:
        checkoutKind === "subscription"
          ? razorpay?.key
          : order?.key || razorpay?.key,
      name: "CropGen",
      description,
      handler: async (response) => {
        try {
          const result = await dispatchRef.current(
            verifyUserSubscriptionPayment({
              subscriptionId,
              paymentData: response,
            }),
          ).unwrap();

          if (!result?.success) {
            toast.error(
              result?.message || "Payment could not be verified. Contact support if charged.",
            );
            return;
          }

          const d = result.data || {};
          dispatchRef.current(
            setPaymentSuccess({
              fieldName: d.fieldName ?? fieldSnap?.fieldName,
              planName: d.planName ?? planSnap?.name,
              features: d.features ?? [],
              daysLeft: d.daysLeft ?? trialDaysLeft,
              transactionId:
                d.transactionId ?? response.razorpay_payment_id ?? null,
              subscriptionId: d.subscriptionId ?? subscriptionId,
            }),
          );

          await refreshFarmFieldsRef.current();
          onCloseRef.current();

          if (trialDaysLeft != null) {
            toast.success(
              "You're set. Trial is active — your plan bills in INR when the trial ends.",
            );
          } else {
            navigateRef.current("/cropgen-analytics");
          }
        } catch (err) {
          const msg =
            (typeof err === "string" && err) ||
            err?.message ||
            "Verification failed.";
          toast.error(msg);
        }
      },
    };

    if (checkoutKind === "subscription") {
      options.subscription_id = razorpay.subscription_id;
    } else {
      options.order_id = order.id;
    }

    const rzp = new window.Razorpay(options);
    rzp.open();
    setCheckoutData(null);
  }, [checkoutData]);

  /* ================= RENDER ================= */

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#2a3f33]/90 backdrop-blur-sm p-6">
        <div className="flex flex-col items-center gap-4 text-white">
          <Loader2 className="h-10 w-10 animate-spin text-[#E1FFF0]" />
          <p className="text-sm text-white/80">Loading plans…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#344E41]/60 p-2 backdrop-blur-[2px] sm:p-3 md:p-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="flex max-h-[calc(100dvh-0.75rem)] w-full max-w-7xl min-h-0 flex-col overflow-x-hidden overflow-y-hidden rounded-2xl border border-white/10 bg-white/10 shadow-xl backdrop-blur-md sm:max-h-[calc(100dvh-1.25rem)] md:max-h-[calc(100dvh-2rem)]"
      >
        <div className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-white/10 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 md:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E1FFF0]/60 sm:h-10 sm:w-10"
            aria-label="Back"
            title="Back"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.25} />
          </button>
          <h2 className="text-center text-lg font-extrabold leading-tight text-white sm:text-2xl md:text-3xl">
            Choose the <span className="text-[#E1FFF0]">Right Plan</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E1FFF0]/60 sm:h-10 sm:w-10"
            aria-label="Close"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
          </button>
        </div>

        {/* Currency + billing — compact; details on demand */}
        <div className="shrink-0 space-y-2 border-b border-white/10 px-3 py-2.5 sm:space-y-2.5 sm:px-4 sm:py-3 md:px-6">
          <div className="mx-auto max-w-2xl px-0.5 text-center">
            {headerTrialDays ? (
              <p className="text-[11px] leading-snug text-white/90 sm:text-xs md:text-sm">
                <strong className="text-white">
                  {headerTrialDays}-day free trial
                </strong>{" "}
                on this field — one{" "}
                <strong className="text-white">Razorpay (INR)</strong>{" "}
                checkout, then the{" "}
                <strong className="text-white">full plan</strong> after the
                trial. <strong className="text-white">Monthly</strong> /{" "}
                <strong className="text-white">Yearly</strong> applies after
                that.
                <span className="text-white/70">
                  {" "}
                  USD/INR toggle is display only (per acre × area).
                </span>
              </p>
            ) : (
              <p className="text-[11px] leading-snug text-white/90 sm:text-xs md:text-sm">
                One{" "}
                <strong className="text-white">Razorpay (INR)</strong> checkout
                for this field.{" "}
                <strong className="text-white">Monthly</strong> /{" "}
                <strong className="text-white">Yearly</strong> applies
                immediately based on your selection.
                <span className="text-white/70">
                  {" "}
                  USD/INR toggle is display only (per acre × area).
                </span>
              </p>
            )}
            {showBillingDetails ? (
              <div className="mt-2 space-y-1.5 text-left text-[11px] leading-relaxed text-white/80 sm:text-xs">
                <p>
                  One checkout saves your payment method in INR. You are not
                  charged the full subscription amount until the trial ends.
                  Monthly or Yearly sets recurring billing from then on.
                </p>
                <p className="text-white/70">
                  Switching USD or INR only changes how dollar or rupee amounts
                  are shown; payment is processed in INR.
                </p>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setShowBillingDetails((v) => !v)}
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[#E1FFF0] underline decoration-[#E1FFF0]/50 underline-offset-2 hover:text-white sm:text-xs"
              aria-expanded={showBillingDetails}
            >
              {showBillingDetails ? "Hide details" : "More about billing"}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${showBillingDetails ? "rotate-180" : ""}`}
                strokeWidth={2.5}
              />
            </button>
          </div>
          <div className="flex w-full max-w-2xl flex-col items-stretch gap-2 sm:mx-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-6 sm:gap-y-2">
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-white select-none sm:text-sm sm:justify-start">
              <span className="text-white/70">Prices in</span>
              <button
                type="button"
                onClick={() => setDisplayCurrency("USD")}
                className={`font-semibold px-1 rounded ${
                  displayCurrency === "USD"
                    ? "text-[#E1FFF0] underline decoration-2 underline-offset-4"
                    : "text-white/60 hover:text-white/90"
                }`}
              >
                USD
              </button>
              <button
                type="button"
                aria-label="Toggle currency"
                onClick={() =>
                  setDisplayCurrency((c) => (c === "USD" ? "INR" : "USD"))
                }
                className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer shrink-0"
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-[#344E41] transition-[left] duration-200 ${
                    displayCurrency === "USD" ? "left-0.5" : "left-[1.375rem]"
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => setDisplayCurrency("INR")}
                className={`font-semibold px-1 rounded ${
                  displayCurrency === "INR"
                    ? "text-[#E1FFF0] underline decoration-2 underline-offset-4"
                    : "text-white/60 hover:text-white/90"
                }`}
              >
                INR
              </button>
            </div>

            <div
              className="hidden h-7 w-px shrink-0 bg-white/25 sm:block"
              aria-hidden
            />

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-white sm:gap-3 sm:text-sm">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={
                  billing === "monthly"
                    ? "font-semibold text-[#E1FFF0]"
                    : "text-white/70 hover:text-white"
                }
              >
                Monthly
              </button>
              <button
                type="button"
                aria-label="Toggle monthly or yearly billing"
                onClick={() =>
                  setBilling((b) => (b === "monthly" ? "yearly" : "monthly"))
                }
                className="w-14 h-7 bg-gray-200 rounded-full relative cursor-pointer shrink-0"
              >
                <span
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-[#344E41] transition-[left] duration-200 ${
                    billing === "monthly" ? "left-1" : "left-7"
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => setBilling("yearly")}
                className={
                  billing === "yearly"
                    ? "font-semibold text-[#E1FFF0]"
                    : "text-white/70 hover:text-white"
                }
              >
                Yearly
              </button>
              <span className="bg-[#E1FFF0] text-[#344E41] px-2 py-0.5 rounded text-xs font-bold">
                Save 20%
              </span>
            </div>
          </div>
        </div>

        {/* Plans: cards use fixed height (540px) so %-height chains never collapse to “top border only” */}
        <div className="flex min-h-0 flex-1 flex-col px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 sm:px-3 md:px-5">
          <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col">
            <div className="relative flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
                <div
                  className={`flex flex-wrap justify-center gap-5 py-2 sm:gap-6 md:gap-8 ${
                    groups.length > 1
                      ? "px-6 sm:px-10 md:px-12"
                      : "px-1"
                  }`}
                >
                  {visiblePlans.map((p) => (
                    <PlanCard
                      key={p._id}
                      plan={p}
                      displayCurrency={displayCurrency}
                      selectedField={selectedField}
                      onSubscribeClick={handleSubscribeClick}
                    />
                  ))}
                </div>
              </div>

              {groups.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setGroupIndex(
                        (i) => (i - 1 + groups.length) % groups.length,
                      )
                    }
                    className="pointer-events-auto absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-[#2d4236]/95 text-white shadow-md transition hover:bg-[#344E41] sm:h-11 sm:w-11 md:left-1"
                    aria-label="Previous plans"
                  >
                    <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setGroupIndex((i) => (i + 1) % groups.length)
                    }
                    className="pointer-events-auto absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-[#2d4236]/95 text-white shadow-md transition hover:bg-[#344E41] sm:h-11 sm:w-11 md:right-1"
                    aria-label="Next plans"
                  >
                    <ChevronRight
                      className="h-6 w-6 sm:h-7 sm:w-7"
                      strokeWidth={2}
                    />
                  </button>
                </>
              ) : null}
            </div>

            {groups.length > 1 ? (
              <div
                className="flex shrink-0 justify-center gap-1.5 py-2"
                role="tablist"
                aria-label="Plan groups"
              >
                {groups.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === groupIndex}
                    onClick={() => setGroupIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === groupIndex
                        ? "w-5 bg-[#E1FFF0]"
                        : "w-1.5 bg-white/35 hover:bg-white/55"
                    }`}
                    aria-label={`Show plan group ${i + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Error Dialog */}
        {dialogError && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
              <button
                onClick={() => setDialogError(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-black"
              >
                <X size={20} />
              </button>

              <h3 className="text-xl font-semibold text-red-600 mb-4">
                Subscription
              </h3>

              <p className="text-gray-700 mb-6">{dialogError || error}</p>

              <div className="flex justify-end">
                <button
                  onClick={() => setDialogError(null)}
                  className="px-5 py-2 bg-[#344E41] text-white rounded-lg"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
