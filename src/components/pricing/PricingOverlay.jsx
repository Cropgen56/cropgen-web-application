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
  setPaymentSuccess,
} from "../../redux/slices/subscriptionSlice";
import { getFarmFields } from "../../redux/slices/farmSlice";
import { toast } from "react-toastify";
import PlanCard from "./PlanCard";

/* ================= CONSTANTS ================= */

const DEFAULT_AREA = 1;
const PLAN_ORDER = ["free-trial", "basic", "pro", "premium"];

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

function transformApiData(apiData, billing, userArea, platform = "web") {
  if (!Array.isArray(apiData)) return [];

  const area = userArea || DEFAULT_AREA;

  let plans = apiData
    .filter((plan) => plan.platform === platform)
    .map((plan) => {
      const priceObj = plan.pricing?.find(
        (p) => p.currency === "USD" && p.billingCycle === billing,
      );

      let totalPrice = 0;
      if (priceObj) {
        totalPrice = (priceObj.pricePerUnitMinor / 100) * area;
      }

      const enabled = [];
      const disabled = [];

      Object.entries(plan.features || {}).forEach(([k, v]) => {
        (v ? enabled : disabled).push(FEATURE_DISPLAY_NAMES[k] || k);
      });

      return {
        _id: plan._id,
        slug: plan.slug,
        name: plan.name,
        tagline: plan.description,
        price:
          plan.slug === "free-trial"
            ? "Free"
            : `$${totalPrice.toFixed(2)}/${billing}`,
        priceBreakdown:
          plan.slug === "free-trial"
            ? `Free Trial (${plan.trialDays} days)`
            : null,
        features: enabled,
        missing: disabled,
        isTrialPlan: plan.slug === "free-trial",
        active: plan.active,
        isEnterprise: false,
      };
    })
    .filter((p) => p.active !== false);

  plans.sort((a, b) => PLAN_ORDER.indexOf(a.slug) - PLAN_ORDER.indexOf(b.slug));
  plans.push(ENTERPRISE_PLAN);

  return plans;
}

/* ================= COMPONENT ================= */

export default function PricingOverlay({ onClose, userArea, selectedField }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { subscriptions, loading, error } = useSelector((s) => s.subscription);
  const { token, user } = useSelector((s) => s.auth);

  const [billing, setBilling] = useState("monthly");
  const [groupIndex, setGroupIndex] = useState(0);
  const [cardsPerGroup, setCardsPerGroup] = useState(3);
  const [scale, setScale] = useState(1);
  const [checkoutData, setCheckoutData] = useState(null);
  const [dialogError, setDialogError] = useState(null);

  const containerRef = useRef(null);

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

  useLayoutEffect(() => {
    const resize = () => {
      if (!containerRef.current) return;
      const el = containerRef.current;
      const s = Math.min((window.innerWidth - 48) / el.scrollWidth, 1);
      setScale(s);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

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
    () => transformApiData(subscriptions, billing, userArea, "web"),
    [subscriptions, billing, userArea],
  );

  const groups = useMemo(() => {
    const arr = [];
    for (let i = 0; i < plans.length; i += cardsPerGroup) {
      arr.push(plans.slice(i, i + cardsPerGroup));
    }
    return arr;
  }, [plans, cardsPerGroup]);

  const visiblePlans = groups[groupIndex] || [];

  /* ---------- SUBSCRIBE ---------- */

  const handleSubscribeClick = async ({ plan }) => {
    if (!token) return toast.error("Please login");

    try {
      const payload = {
        farmId: selectedField.id,
        planId: plan._id,
      };

      if (plan.isTrialPlan) {
        payload.billingCycle = "trial";
      } else {
        payload.billingCycle = billing;
        payload.displayCurrency = "USD";
      }

      const res = await dispatch(createUserSubscription(payload)).unwrap();

      if (res.type === "trial") {
        dispatch(
          setPaymentSuccess({
            fieldName: selectedField.fieldName,
            planName: plan.name,
            daysLeft: res.daysLeft,
          }),
        );

        dispatch(getFarmFields(user._id));
        onClose();
        return;
      }

      setCheckoutData({
        plan,
        order: res.order,
        subscriptionId: res.subscriptionId,
      });
    } catch (e) {
      const message =
        e?.message ||
        e?.response?.data?.message ||
        "Subscription failed. Please try again.";

      setDialogError(message);
    }
  };

  /* ---------- RAZORPAY ---------- */

  useEffect(() => {
    if (!checkoutData || !window.Razorpay) return;

    const { plan, order, subscriptionId } = checkoutData;

    const rzp = new window.Razorpay({
      key: order.key,
      order_id: order.id,
      name: "CropGen",
      handler: async (response) => {
        await dispatch(
          verifyUserSubscriptionPayment({
            subscriptionId,
            paymentData: response,
          }),
        ).unwrap();

        dispatch(
          setPaymentSuccess({
            fieldName: selectedField.fieldName,
            planName: plan.name,
            transactionId: response.razorpay_payment_id,
          }),
        );

        dispatch(getFarmFields(user._id));
        onClose();
        navigate("/cropgen-analytics");
      },
    });

    rzp.open();
    setCheckoutData(null);
  }, [checkoutData]);

  /* ================= RENDER ================= */

  if (loading) return <Loader2 className="animate-spin mx-auto mt-40" />;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#344E41]/50 flex items-center justify-center p-4">
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale }}
        className="relative w-full max-w-7xl bg-white/10 backdrop-blur-sm rounded-xl p-6"
      >
        <button onClick={onClose} className="absolute top-4 right-4">
          <X size={28} className="text-white" />
        </button>

        <h2 className="text-4xl font-extrabold text-center text-white mb-6">
          Choose the <span className="text-[#E1FFF0]">Right Plan</span>
        </h2>

        {/* Billing Toggle */}
        <div className="flex justify-center gap-6 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <span onClick={() => setBilling("monthly")}>Monthly</span>
            <div
              onClick={() =>
                setBilling((b) => (b === "monthly" ? "yearly" : "monthly"))
              }
              className="w-14 h-7 bg-gray-200 rounded-full relative cursor-pointer"
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-[#344E41] ${
                  billing === "monthly" ? "left-1" : "left-7"
                }`}
              />
            </div>
            <span onClick={() => setBilling("yearly")}>Yearly</span>
            <span className="bg-[#E1FFF0] px-2 rounded text-sm">Save 20%</span>
          </div>
        </div>

        {/* Plans */}
        <div className="flex justify-center gap-6">
          {visiblePlans.map((p) => (
            <PlanCard
              key={p._id}
              plan={p}
              selectedField={selectedField}
              onSubscribeClick={handleSubscribeClick}
            />
          ))}
        </div>

        {/* Arrows */}
        {groups.length > 1 && (
          <>
            <button
              onClick={() =>
                setGroupIndex((i) => (i - 1 + groups.length) % groups.length)
              }
              className="absolute left-4 top-1/2"
            >
              <ChevronLeft size={36} />
            </button>
            <button
              onClick={() => setGroupIndex((i) => (i + 1) % groups.length)}
              className="absolute right-4 top-1/2"
            >
              <ChevronRight size={36} />
            </button>
          </>
        )}

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

              <p className="text-gray-700 mb-6">{error}</p>

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
