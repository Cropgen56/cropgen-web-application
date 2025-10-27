import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  createUserSubscription,
  verifyUserSubscriptionPayment,
} from "../../redux/slices/subscriptionSlice";
import { toast } from "react-toastify";

export default function PlanCard({ plan, selectedField }) {
  const [flipped, setFlipped] = useState(false);
  const isRecommended = !!plan.recommended;
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const userArea = useSelector((state) => state.user?.area) || 1;
  const { loading } = useSelector((state) => state.subscription);

  const frontCount = Math.min(5, Math.ceil(plan.features.length / 2) + 1);
  const frontFeatures = plan.features.slice(0, frontCount);
  const backFeatures = [
    ...plan.features.slice(frontCount),
    ...(plan.missing || []),
  ];

  const handleSubscribe = async (e) => {
    e.stopPropagation();
    try {
      if (!token) {
        toast.error("Please log in to subscribe.");
        return;
      }

      if (!window.Razorpay) {
        toast.error("Razorpay SDK not loaded. Please try again.");
        return;
      }

      const subscriptionData = {
        planId: plan?._id,
        hectares: userArea,
        currency: plan.currency || "INR",
        billingCycle: plan.isTrial ? "trial" : plan.billing || "monthly",
        fieldId: selectedField?.id,
      };

      const response = await dispatch(
        createUserSubscription(subscriptionData)
      ).unwrap();
      console.log("Create subscription response:", response);

      if (!response.success) {
        toast.error(response.message || "Failed to create subscription");
        return;
      }

      // If trial with zero amount, activate locally without invoking Checkout
      if (plan.isTrial && response.data.amountMinor === 0) {
        toast.success("Trial subscription activated successfully!");
        return;
      }

      // --- Minimal / safe Razorpay options for subscription flow ---
      // Key points:
      // 1. DO NOT pass `amount` together with `subscription_id`.
      // 2. Keep theme minimal and remove local http:// assets (use HTTPS CDN if needed).
      // 3. Remove advanced `display` / `method` / `modal` structures while debugging.
      const options = {
        key: response.data.key, // rzp_test_...
        subscription_id: response.data.razorpaySubscriptionId, // required for subscription checkout
        name: "CropGen",
        description: `Subscription for ${plan.name} - ${userArea} hectares`,
        // image: 'https://yourcdn.example.com/logo.png', // use HTTPS if you want a logo
        handler: async (paymentResponse) => {
          console.log("Payment response:", paymentResponse);
          try {
            const paymentData = {
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_subscription_id:
                paymentResponse.razorpay_subscription_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            };

            const verifyUrl = `/api/subscriptions/${response.data.subscriptionRecordId}/verify`;

            const verifyResponse = await dispatch(
              verifyUserSubscriptionPayment({
                url: verifyUrl,
                paymentData,
              })
            ).unwrap();
            console.log("Verify payment response:", verifyResponse);

            if (verifyResponse.success) {
              toast.success("Subscription activated successfully!");
              // prefer state update instead of full reload where possible
              window.location.reload();
            } else {
              toast.error(
                "Payment verification failed: " +
                  (verifyResponse.message || "Unknown error")
              );
            }
          } catch (error) {
            console.error("Error verifying payment:", error);
            toast.error("Error verifying payment: " + (error.message || error));
          }
        },
        prefill: {
          name: user?.name || "User Name",
          email: user?.email || "user@example.com",
          contact: user?.contact || "9999999999",
        },
        notes: {
          subscriptionId: response.data.subscriptionRecordId,
        },
        // Keep theme minimal to avoid styling/SVG issues in the Checkout iframe
        theme: {
          color: "#344E41",
        },
        locale: "en",
        // Accessibility is fine to keep, but avoid complex nested 'display' config here
        accessibility: {
          aria_label: `Checkout for ${plan.name} subscription`,
          keyboard: true,
        },
      };

      console.log("Razorpay options:", options);

      const razorpay = new window.Razorpay(options);

      // Listen to failure event to surface errors to user
      razorpay.on("payment.failed", (error) => {
        console.error("Payment failed:", error);
        const msg =
          error?.error?.description ||
          error?.description ||
          "Payment failed. Check console/network for details.";
        toast.error("Payment failed: " + msg);
      });

      // Open the checkout
      razorpay.open();
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast.error("Error creating subscription: " + (error.message || error));
    }
  };

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
        <div
          className={`absolute inset-0 rounded-2xl shadow-lg p-6 flex flex-col ${
            isRecommended
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
          <h3 className="text-[24px] font-extrabold mt-6 mb-1">{plan.name}</h3>
          <p className="text-xs mb-2">{plan.tagline}</p>
          <div className="flex items-baseline gap-5 mt-2">
            <p className="text-[20px] font-bold">{plan.price || ""}</p>
            {plan.priceBreakdown && (
              <p className="text-xs text-gray-400">{plan.priceBreakdown}</p>
            )}
          </div>

          <hr className="border-t border-gray-800 mb-3" />
          <div className="flex-1 flex flex-col gap-1 text-[11px] font-semibold leading-[11px] overflow-hidden">
            {frontFeatures.length > 0 ? (
              frontFeatures.map((f, idx) => (
                <p key={idx} className="flex items-start gap-2">
                  <Check
                    strokeWidth={4}
                    size={14}
                    className="text-green-700 shrink-0"
                  />
                  {f}
                </p>
              ))
            ) : (
              <p className="text-gray-500">No features enabled</p>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFlipped(true);
              }}
              className="flex-1 py-2 rounded-2xl text-xs bg-[#5A7C6B] text-white hover:bg-[#466657]"
            >
              View All Features
            </button>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className={`flex-1 py-2 rounded-2xl font-bold text-xs bg-white text-[#344E41] hover:bg-gray-900 border-[1px] border-[#344E41] ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Processing..." : "Subscribe"}
            </button>
          </div>
        </div>

        <div
          className={`absolute inset-0 rounded-2xl shadow-lg p-6 flex flex-col ${
            isRecommended
              ? "bg-[#344E41] text-white border-[2px] border-white"
              : "bg-white text-black border border-gray-200"
          }`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <h3 className="text-[18px] font-bold mt-6 mb-3">
            {plan.name} — All Features
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
