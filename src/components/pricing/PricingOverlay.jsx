import React, {
  useMemo,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { motion } from "framer-motion";
import { Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchSubscriptions,
  createUserSubscription,
  verifyUserSubscriptionPayment,
} from "../../redux/slices/subscriptionSlice.js";
import { toast } from "react-toastify";
import PlanCard from "./PlanCard.jsx";

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
  enterpriseSupport: "Enterprise Support",
};

function transformApiData(apiData, billing, currency, userArea) {
  if (!apiData || !Array.isArray(apiData)) return [];

  const areaInHectares = userArea || DEFAULT_AREA;

  return apiData
    .map((plan) => {
      const pricingByCurrencyAndCycle = {};

      plan.pricing?.forEach((price) => {
        const key = `${price.currency}_${price.billingCycle}`;
        if (
          !pricingByCurrencyAndCycle[key] ||
          pricingByCurrencyAndCycle[key].amountMinor < price.amountMinor
        ) {
          pricingByCurrencyAndCycle[key] = price;
        }
      });

      let displayPrice = 0;
      let pricePerHectare = 0;
      let totalPrice = 0;
      let unit = billing === "monthly" ? "/month" : "/year";
      let basePrice = 0;

      const isTrial =
        plan.isTrial || plan.pricing?.some((p) => p.billingCycle === "trial");

      if (!isTrial) {
        const matchKey = `${currency}_${billing}`;
        const exactMatch = pricingByCurrencyAndCycle[matchKey];

        if (exactMatch) {
          pricePerHectare = exactMatch.amountMinor / 100;
          totalPrice = pricePerHectare * areaInHectares;
          basePrice = pricePerHectare;
        } else {
          const currencyMatch = Object.values(pricingByCurrencyAndCycle).find(
            (p) => p.currency === currency
          );

          if (currencyMatch) {
            pricePerHectare = currencyMatch.amountMinor / 100;

            if (
              billing === "yearly" &&
              currencyMatch.billingCycle === "monthly"
            ) {
              pricePerHectare = pricePerHectare * 12 * 0.8;
            } else if (
              billing === "monthly" &&
              currencyMatch.billingCycle === "yearly"
            ) {
              pricePerHectare = pricePerHectare / 12 / 0.8;
            }

            totalPrice = pricePerHectare * areaInHectares;
            basePrice = pricePerHectare;
          } else {
            const anyPrice = Object.values(pricingByCurrencyAndCycle)[0];
            if (anyPrice) {
              pricePerHectare = anyPrice.amountMinor / 100;

              if (anyPrice.currency === "INR" && currency === "USD") {
                pricePerHectare = pricePerHectare / USD_TO_INR;
              } else if (anyPrice.currency === "USD" && currency === "INR") {
                pricePerHectare = pricePerHectare * USD_TO_INR;
              }

              if (billing === "yearly" && anyPrice.billingCycle === "monthly") {
                pricePerHectare = pricePerHectare * 12 * 0.8;
              } else if (
                billing === "monthly" &&
                anyPrice.billingCycle === "yearly"
              ) {
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
        formattedPrice = plan.trialDays
          ? `Free Trial (${plan.trialDays} days)`
          : "Free";
      } else {
        if (currency === "USD") {
          formattedPrice = `$${displayPrice.toFixed(2)}${unit}`;
          priceBreakdown = `($${basePrice.toFixed(
            2
          )}/ha × ${areaInHectares.toFixed(1)} ha)`;
        } else {
          formattedPrice = `₹${Math.round(displayPrice)}${unit}`;
          priceBreakdown = `(₹${Math.round(
            basePrice
          )}/ha × ${areaInHectares.toFixed(1)} ha)`;
        }
      }

      const enabledFeatures = [];
      const disabledFeatures = [];
      Object.entries(plan.features || {}).forEach(([key, value]) => {
        const displayName = FEATURE_DISPLAY_NAMES[key] || key;
        if (value) enabledFeatures.push(displayName);
        else disabledFeatures.push(displayName);
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
        areaInHectares,
      };
    })
    .filter((plan) => plan.active !== false);
}

export default function PricingOverlay({ onClose, userArea, selectedField }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    subscriptions,
    loading: subLoading,
    error,
  } = useSelector((state) => state.subscription);
  const { token, user } = useSelector((state) => state.auth);
  const { loading: checkoutLoading } = useSelector(
    (state) => state.subscription
  );

  const [billing, setBilling] = useState("monthly");
  const [currency, setCurrency] = useState("INR");
  const [groupIndex, setGroupIndex] = useState(0);
  const [cardsPerGroup, setCardsPerGroup] = useState(3);
  const [scale, setScale] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState(null);

  const containerRef = useRef(null);

  // Load Razorpay SDK once
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
      return () => document.body.removeChild(script);
    }
  }, []);

  useEffect(() => {
    dispatch(fetchSubscriptions());
  }, [dispatch]);

  useLayoutEffect(() => {
    const recompute = () => {
      const el = containerRef.current;
      if (!el) return;
      const s = Math.min(
        (window.innerWidth - 48) / (el.scrollWidth || 1),
        (window.innerHeight - 48) / (el.scrollHeight || 1),
        1
      );
      setScale(s > 0 ? s : 1);
    };
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [cardsPerGroup, groupIndex]);

  useEffect(() => {
    const handle = () => {
      if (window.innerWidth < 768) setCardsPerGroup(1);
      else if (window.innerWidth < 1024) setCardsPerGroup(2);
      else setCardsPerGroup(3);
    };
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  const adjusted = useMemo(
    () => transformApiData(subscriptions, billing, currency, userArea),
    [subscriptions, billing, currency, userArea]
  );

  const groups = useMemo(() => {
    const g = [];
    for (let i = 0; i < adjusted.length; i += cardsPerGroup) {
      g.push(adjusted.slice(i, i + cardsPerGroup));
    }
    return g;
  }, [adjusted, cardsPerGroup]);

  const visibleGroup = groups[groupIndex] || [];

  // === HANDLE SUBSCRIBE ===
  const handleSubscribeClick = async ({ plan }) => {
    if (!token) {
      toast.error("Please log in to subscribe.");
      return;
    }

    try {
      const payload = {
        planId: plan._id,
        fieldId: selectedField?.id,
        hectares: userArea,
        billingCycle: plan.isTrial ? "trial" : billing,
        currency,
      };

      const res = await dispatch(createUserSubscription(payload)).unwrap();

      if (!res.success) throw new Error(res.message);

      if (plan.isTrial) {
        toast.success("Trial activated!");
        onClose?.();
        return;
      }

      setCheckoutPlan({ plan, razorpayData: res.data });
      setShowCheckout(true);
    } catch (err) {
      toast.error(err.message || "Failed to start subscription");
    }
  };

  // === OPEN RAZORPAY ===
  useEffect(() => {
    if (!showCheckout || !checkoutPlan || !window.Razorpay) return;

    const { razorpayData, plan } = checkoutPlan;

    const options = {
      key: razorpayData.key,
      subscription_id: razorpayData.razorpaySubscriptionId,
      name: "CropGen",
      description: `${plan.name} – ${userArea} ha`,
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.contact || "",
      },
      notes: { subscriptionId: razorpayData.subscriptionRecordId },
      theme: { color: "#344E41" },
      handler: async (response) => {
        try {
          const verifyRes = await dispatch(
            verifyUserSubscriptionPayment({
              paymentData: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
              },
            })
          ).unwrap();

          if (verifyRes.success) {
            toast.success("Subscription activated!");
            setTimeout(() => window.location.reload(), 1500);
            navigate("/cropgen-analytics");
          }
        } catch (e) {
          toast.error("Verification failed");
        }
      },
      modal: {
        ondismiss: () => {
          setShowCheckout(false);
          setCheckoutPlan(null);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", () => toast.error("Payment failed"));
    rzp.open();

    return () => rzp.close?.();
  }, [showCheckout, checkoutPlan, dispatch, user, userArea]);

  // === RENDER ===
  if (subLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#344E41]/50">
        <div className="bg-white rounded-lg p-8 flex flex-col items-center">
          <Loader2 className="animate-spin h-12 w-12 text-[#344E41]" />
          <p className="mt-4 text-lg font-semibold">Loading plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#344E41]/50">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <h3 className="text-xl font-bold text-red-600 mb-2">Error</h3>
          <p className="text-gray-600">
            {error.message || "Failed to load plans"}
          </p>
          <button
            onClick={() => dispatch(fetchSubscriptions())}
            className="mt-4 px-4 py-2 bg-[#344E41] text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* PRICING OVERLAY */}
      {!showCheckout && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#344E41]/50">
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: scale }}
            className="relative w-full max-w-7xl bg-white/10 backdrop-blur-sm rounded-xl p-6"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white"
            >
              <X size={28} />
            </button>

            <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-3 text-white">
              Choose the <span className="text-[#E1FFF0]">Right Plan</span>
            </h2>

            <div className="flex justify-center gap-6 mb-6">
              {/* Billing Toggle */}
              <div className="flex items-center gap-3">
                <span
                  className={`font-bold text-sm cursor-pointer ${
                    billing === "monthly" ? "text-white" : "text-gray-300"
                  }`}
                  onClick={() => setBilling("monthly")}
                >
                  Monthly
                </span>
                <div
                  onClick={() =>
                    setBilling((b) => (b === "monthly" ? "yearly" : "monthly"))
                  }
                  className="relative flex items-center bg-gray-200 rounded-full w-14 h-7 cursor-pointer"
                >
                  <div
                    className={`absolute top-0.5 w-6 h-6 rounded-full transition-all ${
                      billing === "monthly"
                        ? "left-1 bg-[#344E41]"
                        : "left-7 bg-[#344E41]"
                    }`}
                  />
                </div>
                <span
                  className={`font-bold text-sm cursor-pointer ${
                    billing === "yearly" ? "text-white" : "text-gray-300"
                  }`}
                  onClick={() => setBilling("yearly")}
                >
                  Yearly
                </span>
                <span className="ml-2 text-xs bg-[#E1FFF0] text-[#344E41] px-2 py-0.5 rounded-full">
                  Save 20%
                </span>
              </div>

              {/* Currency Toggle */}
              <div className="flex items-center gap-3">
                <span
                  className={`font-bold text-sm cursor-pointer ${
                    currency === "USD" ? "text-white" : "text-gray-300"
                  }`}
                  onClick={() => setCurrency("USD")}
                >
                  Plan in $
                </span>
                <div
                  onClick={() =>
                    setCurrency((c) => (c === "USD" ? "INR" : "USD"))
                  }
                  className="relative flex items-center bg-gray-200 rounded-full w-14 h-7 cursor-pointer"
                >
                  <div
                    className={`absolute top-0.5 w-6 h-6 rounded-full transition-all ${
                      currency === "USD"
                        ? "left-1 bg-[#344E41]"
                        : "left-7 bg-[#344E41]"
                    }`}
                  />
                </div>
                <span
                  className={`font-bold text-sm cursor-pointer ${
                    currency === "INR" ? "text-white" : "text-gray-300"
                  }`}
                  onClick={() => setCurrency("INR")}
                >
                  Plan in ₹
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="flex justify-center gap-6">
              {visibleGroup.map((p) => (
                <PlanCard
                  key={p._id}
                  plan={p}
                  selectedField={selectedField}
                  onSubscribeClick={handleSubscribeClick}
                />
              ))}
            </div>

            {groups.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setGroupIndex(
                      (i) => (i - 1 + groups.length) % groups.length
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white"
                >
                  <ChevronLeft size={36} />
                </button>
                <button
                  onClick={() => setGroupIndex((i) => (i + 1) % groups.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
                >
                  <ChevronRight size={36} />
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* RAZORPAY LOADER */}
      {showCheckout && (
        <div className="fixed inset-0 z-[99999] bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 shadow-2xl text-center">
            <div className="h-16 w-16 mx-auto animate-spin rounded-full border-4 border-gray-300 border-t-[#344E41]" />
            <p className="mt-4 text-lg font-semibold">
              Opening secure checkout...
            </p>
          </div>
        </div>
      )}
    </>
  );
}
