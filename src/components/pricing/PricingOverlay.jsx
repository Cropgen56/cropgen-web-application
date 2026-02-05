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

const USD_TO_INR = 83;
const DEFAULT_AREA = 5;

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

function transformApiData(apiData, billing, currency, userArea) {
  if (!Array.isArray(apiData)) return [];

  const areaInHectares = userArea || DEFAULT_AREA;

  const plans = apiData
    .map((plan) => {
      const pricingMap = {};
      plan.pricing?.forEach((p) => {
        pricingMap[`${p.currency}_${p.billingCycle}`] = p;
      });

      const isTrial = plan.isTrial;
      let totalPrice = 0;
      let basePrice = 0;

      if (!isTrial) {
        const priceObj = pricingMap[`${currency}_${billing}`];
        if (priceObj) {
          basePrice = priceObj.amountMinor / 100;
          totalPrice = basePrice * areaInHectares;
        }
      }

      const enabled = [];
      const disabled = [];
      Object.entries(plan.features || {}).forEach(([k, v]) => {
        (v ? enabled : disabled).push(FEATURE_DISPLAY_NAMES[k] || k);
      });

      return {
        _id: plan._id,
        name: plan.name,
        tagline: plan.description,
        price:
          isTrial || totalPrice === 0
            ? `Free Trial (${plan.trialDays} days)`
            : currency === "USD"
              ? `$${totalPrice.toFixed(2)}/${billing}`
              : `₹${Math.round(totalPrice)}/${billing}`,
        features: enabled,
        missing: disabled,
        isTrial,
        trialDays: plan.trialDays,
        active: plan.active,
        isEnterprise: false,
      };
    })
    .filter((p) => p.active !== false);

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
  const [currency, setCurrency] = useState("USD");
  const [groupIndex, setGroupIndex] = useState(0);
  const [cardsPerGroup, setCardsPerGroup] = useState(3);
  const [scale, setScale] = useState(1);
  const [checkoutData, setCheckoutData] = useState(null);
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
    () => transformApiData(subscriptions, billing, currency, userArea),
    [subscriptions, billing, currency, userArea],
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
      const res = await dispatch(
        createUserSubscription({
          planId: plan._id,
          fieldId: selectedField.id,
          hectares: userArea,
          billingCycle: plan.isTrial ? "trial" : billing,
          currency,
        }),
      ).unwrap();

      if (plan.isTrial) {
        dispatch(
          setPaymentSuccess({
            fieldName: selectedField.name,
            planName: plan.name,
            daysLeft: plan.trialDays,
          }),
        );
        dispatch(getFarmFields(user.id));
        onClose();
        return;
      }

      setCheckoutData({ plan, razorpay: res.data });
    } catch (e) {
      toast.error(e.message || "Subscription failed");
    }
  };

  /* ---------- RAZORPAY ---------- */

  useEffect(() => {
    if (!checkoutData || !window.Razorpay) return;

    const { plan, razorpay } = checkoutData;

    const rzp = new window.Razorpay({
      key: razorpay.key,
      subscription_id: razorpay.razorpaySubscriptionId,
      name: "CropGen",
      handler: async (response) => {
        await dispatch(
          verifyUserSubscriptionPayment({
            subscriptionId: razorpay.subscriptionRecordId,
            paymentData: response,
          }),
        ).unwrap();

        dispatch(
          setPaymentSuccess({
            fieldName: selectedField.name,
            planName: plan.name,
            transactionId: response.razorpay_payment_id,
          }),
        );

        dispatch(getFarmFields(user.id));
        onClose();
        navigate("/cropgen-analytics");
      },
    });

    rzp.open();
    setCheckoutData(null);
  }, [checkoutData]);

  /* ================= RENDER ================= */

  if (loading) return <Loader2 className="animate-spin mx-auto mt-40" />;
  if (error) return <div>Error loading plans</div>;

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

        {/* ===== HEADER UI (UNCHANGED) ===== */}
        <h2 className="text-4xl font-extrabold text-center text-white mb-6">
          Choose the <span className="text-[#E1FFF0]">Right Plan</span>
        </h2>

        {/* ===== TOGGLES ===== */}
        <div className="flex justify-center gap-6 mb-6 flex-wrap">
          {/* Billing Toggle */}
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

          {/* Currency Toggle */}
          <div className="flex items-center gap-3">
            <span onClick={() => setCurrency("USD")}>Plan in $</span>
            <div
              onClick={() => setCurrency((c) => (c === "USD" ? "INR" : "USD"))}
              className="w-14 h-7 bg-gray-200 rounded-full relative cursor-pointer"
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-[#344E41] ${
                  currency === "USD" ? "left-1" : "left-7"
                }`}
              />
            </div>
            <span onClick={() => setCurrency("INR")}>Plan in ₹</span>
          </div>
        </div>

        {/* ===== PLANS ===== */}
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
      </motion.div>
    </div>
  );
}
