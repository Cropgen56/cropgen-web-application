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
import { FEATURE_DISPLAY_NAMES } from "../../utils/planFeatures";
import { ENTERPRISE_TAGLINE } from "../../utils/enterprisePlan";
import { describeFarmPlan } from "../../utils/farmPlan";

/* ================= CONSTANTS ================= */

const PLAN_ORDER = [
  "base-plan-mobile",
  "basic-plan",
  "pro-plan",
  "premium",
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

/** Price per hectare (major units) for a pricing row quoted per acre or per hectare. */
function pricePerHectare(row) {
  if (!row) return 0;
  const major = (Number(row.pricePerUnitMinor) || 0) / 100;
  return row.unit === "hectare" ? major : major / ACRES_TO_HECTARES;
}

/**
 * Real yearly saving vs paying monthly for 12 months, from the plan's own
 * pricing rows in `currency` (0 when either price is missing or yearly is not cheaper).
 */
function yearlySavingsPercent(pricing, currency) {
  const rows = Array.isArray(pricing) ? pricing : [];
  const monthly = pricePerHectare(
    rows.find((p) => p.currency === currency && p.billingCycle === "monthly"),
  );
  const yearly = pricePerHectare(
    rows.find((p) => p.currency === currency && p.billingCycle === "yearly"),
  );
  if (!(monthly > 0) || !(yearly > 0)) return 0;
  const pct = Math.round((1 - yearly / (monthly * 12)) * 100);
  return pct > 0 ? pct : 0;
}

function resolveFieldAreaAcres(selectedField) {
  const acre = Number(selectedField?.acre);
  if (acre > 0) return acre;
  const ha = Number(selectedField?.areaInHectares);
  if (ha > 0) return ha / ACRES_TO_HECTARES;
  return 0;
}


const ENTERPRISE_PLAN = {
  _id: "enterprise",
  name: "Enterprise",
  tagline: ENTERPRISE_TAGLINE,
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

/** Free Trial card derived from the Growth plan (same features and post-trial price). */
function buildFreeTrialPlan(base) {
  const offer = base.freeTrialOffer;
  const tooLarge = base.areaHectares > offer.maxHectares + 1e-9;
  const used = Boolean(offer.used);
  return {
    ...base,
    _id: `free-trial:${base._id}`,
    planId: base._id,
    name: "Free Trial",
    tagline: `${offer.days} days of ${base.name} features`,
    recommended: true,
    isFreeTrialOffer: true,
    isTrialPlan: true,
    trialDays: offer.days,
    savingsPct: 0,
    freeTrialLimits: {
      maxHectares: offer.maxHectares,
      maxFarms: offer.maxFarms,
    },
    trialDisabled: tooLarge || used,
    disabledMessage: used
      ? "You have already used your free trial. It is available once per account — choose a plan to continue."
      : tooLarge
      ? `This farm is ${base.areaHectares.toFixed(2)} ha. The free trial supports farms up to ${offer.maxHectares} ha — choose a paid plan instead.`
      : undefined,
  };
}

export function transformApiData(
  apiData,
  billing,
  selectedField,
  platform = "web",
  displayCurrency = "USD",
  options = {},
) {
  if (!Array.isArray(apiData)) return [];

  const area = resolveFieldAreaAcres(selectedField);
  const areaHectares = area * ACRES_TO_HECTARES;
  const cur = displayCurrency === "INR" ? "INR" : "USD";

  let plans = apiData
    .filter(
      (plan) =>
        (plan.platform === platform || plan.platform === "all") &&
        plan.active !== false &&
        plan.isInternal !== true &&
        // INR shows the India plan, USD the international plans.
        (plan.pricing || []).some((p) => p.currency === cur),
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

      // Web shows prices per hectare; total = price/ha × field hectares.
      // Unit prices do not depend on a field (Settings lists plans with no
      // field selected); totals are 0 until an area is known.
      if (priceObj) {
        unitPrice = pricePerHectare(priceObj);
        total = unitPrice * areaHectares;
      }
      if (inrObj) {
        unitPriceInr = pricePerHectare(inrObj);
        totalPriceInr = unitPriceInr * areaHectares;
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
        savingsPct: yearlySavingsPercent(plan.pricing, cur),
        /** Set by the API on the Growth plan: the 21-day Free Trial offer. */
        freeTrialOffer: plan.freeTrialOffer || null,
      };
    });

  // No trial for this farm (it has a plan or already used its trial): nothing
  // should advertise one, the checkout is a normal paid subscription.
  if (options.skipFreeTrial) {
    plans = plans.map((p) => ({ ...p, isTrialPlan: false, trialDays: 0 }));
  }

  plans.sort((a, b) => {
    const ia = PLAN_ORDER.indexOf(a.slug);
    const ib = PLAN_ORDER.indexOf(b.slug);
    const sa = ia === -1 ? PLAN_ORDER.length : ia;
    const sb = ib === -1 ? PLAN_ORDER.length : ib;
    if (sa !== sb) return sa - sb;
    return (a.name || "").localeCompare(b.name || "");
  });
  // A dedicated Free Trial card (21 days, autopay required, 1 farm, up to
  // 5 ha), built from the plan that carries the offer in the shown currency:
  // Growth for USD, Basic for India (INR).
  const trialBase = plans.find(
    (p) =>
      p.freeTrialOffer &&
      p.freeTrialOffer.currency === cur &&
      !p.unavailableForBilling,
  );
  // Not offered to a farm that already has a plan: changing plan is not a trial.
  if (trialBase && !options.skipFreeTrial) {
    const i = plans.indexOf(trialBase);
    // The base plan stays purchasable but no longer advertises its own
    // shorter trial next to the 21-day Free Trial card.
    plans[i] = { ...trialBase, isTrialPlan: false, trialDays: 0 };
    plans.unshift(buildFreeTrialPlan(trialBase));
  }

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

  /* Esc closes the dialog; the page behind does not scroll while it is open. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCloseRef.current?.();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

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

  /** The plan this farm is on now (changing plan switches from it). */
  const currentPlan = useMemo(() => describeFarmPlan(selectedField), [selectedField]);

  // A farm gets one trial ever: the farm list says whether this one can still
  // have it (`trialEligible`). With a plan already running, a switch is never a trial.
  const farmsInStore = useSelector((s) => s.farmfield?.fields);
  const storeFarm = useMemo(
    () =>
      (Array.isArray(farmsInStore) ? farmsInStore : []).find(
        (f) => String(f._id) === String(selectedField?.id ?? selectedField?._id),
      ),
    [farmsInStore, selectedField],
  );
  const trialAvailable =
    !currentPlan.hasPlan &&
    (selectedField?.trialEligible ?? storeFarm?.trialEligible) !== false;

  const plans = useMemo(
    () =>
      transformApiData(
        subscriptions,
        billing,
        selectedField,
        "web",
        displayCurrency,
        { skipFreeTrial: !trialAvailable },
      ),
    [subscriptions, billing, selectedField, displayCurrency, trialAvailable],
  );

  /** The 21-day Free Trial card, when this currency has one. */
  const freeTrialPlan = useMemo(
    () => plans.find((pl) => pl.isFreeTrialOffer) || null,
    [plans],
  );

  const headerTrialDays = useMemo(() => {
    const p = plans.find(
      (pl) => pl.isTrialPlan && pl.trialDays > 0 && !pl.isFreeTrialOffer,
    );
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

  /** Yearly discount across the plans shown in the selected currency (real-time). */
  const savingsLabel = useMemo(() => {
    const pcts = plans.map((p) => p.savingsPct || 0).filter((n) => n > 0);
    if (!pcts.length) return null;
    const max = Math.max(...pcts);
    const min = Math.min(...pcts);
    return max === min ? `Save ${max}%` : `Save up to ${max}%`;
  }, [plans]);

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

      const payload = plan.isFreeTrialOffer
        ? {
            farmId,
            planId: plan.planId,
            /** 21-day Free Trial: autopay is saved now, the Growth plan bills after the trial. */
            freeTrial: true,
            billingCycle: billing,
            displayCurrency: plan.freeTrialOffer?.currency || displayCurrency,
          }
        : {
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

          // Switched within 24 hours of paying for the old plan: it is refunded.
          if (d.previousPlanRefund?.status === "refunded") {
            toast.success(
              "Plan switched. You changed plans within 24 hours, so your previous plan's payment is being refunded — it can take 5–7 working days to reach your account.",
              { autoClose: 9000 },
            );
          } else if (d.previousPlanRefund?.status === "failed") {
            toast.info(
              "Plan switched. Your previous plan's payment qualifies for a refund (switched within 24 hours); we could not issue it automatically, so our team will process it.",
              { autoClose: 9000 },
            );
          }

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
        role="dialog"
        aria-modal="true"
        aria-label="Choose the right plan"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="flex max-h-[calc(100dvh-0.75rem)] w-full max-w-6xl min-h-0 flex-col overflow-x-hidden overflow-y-hidden rounded-2xl border border-white/10 bg-white/10 shadow-xl backdrop-blur-md sm:max-h-[calc(100dvh-1.25rem)] md:max-h-[calc(100dvh-2rem)]"
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

        {/* Billing summary + currency / cycle controls (compact; details on demand) */}
        <div className="shrink-0 border-b border-white/10 px-3 py-2 sm:px-4 sm:py-2.5 md:px-6">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 sm:gap-2.5">
            <p className="text-center text-[11px] leading-snug text-white/90 sm:text-xs md:text-[13px]">
              {freeTrialPlan ? (
                <>
                  <strong className="text-white">
                    {freeTrialPlan.trialDays}-day free trial
                  </strong>{" "}
                  with autopay: 1 farm, up to{" "}
                  <strong className="text-white">
                    {freeTrialPlan.freeTrialLimits.maxHectares} ha
                  </strong>
                  , then the plan bills in{" "}
                  <strong className="text-white">INR</strong> via Razorpay.
                </>
              ) : headerTrialDays ? (
                <>
                  <strong className="text-white">
                    {headerTrialDays}-day free trial
                  </strong>{" "}
                  on this field, then the{" "}
                  <strong className="text-white">full plan</strong> bills in{" "}
                  <strong className="text-white">INR</strong> via Razorpay.
                </>
              ) : (
                <>
                  One <strong className="text-white">Razorpay (INR)</strong>{" "}
                  checkout for this field, billed{" "}
                  <strong className="text-white">
                    {billing === "yearly" ? "yearly" : "monthly"}
                  </strong>
                  .
                </>
              )}{" "}
              <button
                type="button"
                onClick={() => setShowBillingDetails((v) => !v)}
                className="inline-flex items-center gap-0.5 whitespace-nowrap font-semibold text-[#E1FFF0] underline decoration-[#E1FFF0]/50 underline-offset-2 hover:text-white"
                aria-expanded={showBillingDetails}
              >
                {showBillingDetails ? "Hide details" : "Billing details"}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${showBillingDetails ? "rotate-180" : ""}`}
                  strokeWidth={2.5}
                />
              </button>
            </p>

            {showBillingDetails ? (
              <div className="max-h-28 w-full space-y-1.5 overflow-y-auto rounded-lg bg-black/15 px-3 py-2 text-left text-[11px] leading-relaxed text-white/85 sm:text-xs">
                <p>
                  {freeTrialPlan
                    ? `The free trial covers one farm of up to ${freeTrialPlan.freeTrialLimits.maxHectares} ha for ${freeTrialPlan.trialDays} days, once per account. Adding another farm or more area needs a paid plan. One checkout saves your autopay in INR; nothing is charged until the trial ends, then Monthly or Yearly billing starts.`
                    : headerTrialDays
                      ? "One checkout saves your payment method in INR. You are not charged the full subscription amount until the trial ends. Monthly or Yearly sets recurring billing from then on."
                      : "Monthly or Yearly applies immediately, based on your selection."}
                </p>
                <p className="text-white/70">
                  The USD / INR toggle only changes how amounts are shown
                  (price per hectare × field area); payment is processed in
                  INR.
                </p>
              </div>
            ) : null}

            <div className="flex w-full flex-col items-center justify-center gap-2 sm:flex-row sm:gap-x-6">
              <div className="flex items-center gap-2 text-xs text-white select-none sm:text-sm">
                <span className="text-white/70">Prices in</span>
                <button
                  type="button"
                  onClick={() => setDisplayCurrency("USD")}
                  className={`rounded px-1 font-semibold ${
                    displayCurrency === "USD"
                      ? "text-[#E1FFF0] underline decoration-2 underline-offset-4"
                      : "text-white/60 hover:text-white/90"
                  }`}
                >
                  USD
                </button>
                <button
                  type="button"
                  role="switch"
                  aria-checked={displayCurrency === "INR"}
                  aria-label="Toggle currency between USD and INR"
                  onClick={() =>
                    setDisplayCurrency((c) => (c === "USD" ? "INR" : "USD"))
                  }
                  className="relative h-6 w-12 shrink-0 cursor-pointer rounded-full bg-gray-200"
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-[#344E41] transition-[left] duration-200 ${
                      displayCurrency === "USD" ? "left-0.5" : "left-[1.625rem]"
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayCurrency("INR")}
                  className={`rounded px-1 font-semibold ${
                    displayCurrency === "INR"
                      ? "text-[#E1FFF0] underline decoration-2 underline-offset-4"
                      : "text-white/60 hover:text-white/90"
                  }`}
                >
                  INR
                </button>
              </div>

              <div
                className="hidden h-6 w-px shrink-0 bg-white/25 sm:block"
                aria-hidden
              />

              <div className="flex items-center gap-2 text-xs text-white select-none sm:gap-3 sm:text-sm">
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
                  role="switch"
                  aria-checked={billing === "yearly"}
                  aria-label="Toggle between monthly and yearly billing"
                  onClick={() =>
                    setBilling((b) => (b === "monthly" ? "yearly" : "monthly"))
                  }
                  className="relative h-6 w-12 shrink-0 cursor-pointer rounded-full bg-gray-200"
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-[#344E41] transition-[left] duration-200 ${
                      billing === "monthly" ? "left-0.5" : "left-[1.625rem]"
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
                {savingsLabel ? (
                  <span className="rounded bg-[#E1FFF0] px-2 py-0.5 text-[11px] font-bold text-[#344E41] sm:text-xs">
                    {savingsLabel}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {currentPlan.hasPlan ? (
          <div className="shrink-0 border-b border-white/10 bg-black/10 px-3 py-2 text-center text-xs text-white/90 sm:px-4 sm:text-sm md:px-6">
            <span className="text-white/70">
              {selectedField?.fieldName ? `${selectedField.fieldName}: ` : ""}
              current plan
            </span>{" "}
            <strong className="text-white">{currentPlan.title}</strong>
            <span className="text-white/70"> · {currentPlan.detail}</span>
            <span className="ml-2 hidden text-white/60 sm:inline">
              Pick another plan below to switch — it starts right away and replaces this one.
              Switch within 24 hours of paying and your previous payment is refunded; after that there is no refund.
            </span>
          </div>
        ) : null}

        {/* Plans: cards use fixed height (540px) so %-height chains never collapse to “top border only” */}
        <div className="flex min-h-0 flex-1 flex-col px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 sm:px-3 md:px-5">
          <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col">
            <div className="relative flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
                <div
                  className={`grid grid-cols-1 items-stretch justify-center justify-items-center gap-5 pb-4 pt-4 sm:gap-6 md:gap-7 ${
                    visiblePlans.length >= 3
                      ? "md:grid-cols-[repeat(3,minmax(0,340px))]"
                      : visiblePlans.length === 2
                        ? "md:grid-cols-[repeat(2,minmax(0,340px))]"
                        : "md:grid-cols-[minmax(0,340px)]"
                  } ${
                    groups.length > 1
                      ? "px-8 sm:px-12 md:px-14"
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
                      changeMode={currentPlan.hasPlan}
                      isCurrent={
                        currentPlan.hasPlan &&
                        String(p._id) === currentPlan.planId &&
                        (!currentPlan.cycle || currentPlan.cycle === billing)
                      }
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
