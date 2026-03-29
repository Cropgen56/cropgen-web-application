import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Users, Headphones, Shield } from "lucide-react";

function formatUsd(amount) {
  if (amount == null || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatInr(amount) {
  if (amount == null || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function billingPeriodShort(cycle) {
  if (cycle === "yearly") return "yr";
  if (cycle === "season") return "season";
  return "mo";
}

export default function PlanCard({
  plan,
  displayCurrency = "USD",
  selectedField,
  onSubscribeClick,
  onContactClick,
}) {
  const [flipped, setFlipped] = useState(false);

  const isRecommended = !!plan.recommended;
  const isEnterprise = !!plan.isEnterprise;
  const isDisabled =
    !!plan.trialDisabled || !!plan.unavailableForBilling;

  /* ================= ENTERPRISE ================= */

  if (isEnterprise) {
    return (
      <div
        className="mx-auto w-[300px] shrink-0 md:w-[320px]"
        style={{ perspective: 1000, height: 540 }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.7 }}
          className="h-full w-full"
          style={{
            transformStyle: "preserve-3d",
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          <div
            className="absolute inset-0 flex min-h-0 flex-col rounded-2xl border border-[#E1FFF0]/30 bg-gradient-to-br from-[#1a2e22] via-[#344E41] to-[#2d4a3a] p-6 pt-8 text-white shadow-xl"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-[#344E41] text-xs font-bold px-4 py-1 rounded-full shadow">
              ENTERPRISE
            </span>

            <div className="shrink-0">
              <h3 className="mt-2 text-[22px] font-extrabold leading-tight sm:text-2xl">
                {plan.name}
              </h3>
              <p className="mt-1 text-sm leading-snug text-gray-200">
                {plan.tagline}
              </p>

              <div className="mt-4 text-xl font-bold text-[#E1FFF0] sm:text-[22px]">
                Custom Pricing
              </div>
            </div>

            <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto text-sm font-medium pr-0.5">
              <p className="flex items-center gap-2">
                <Check size={16} /> All Premium Features
              </p>
              <p className="flex items-center gap-2">
                <Users size={16} /> Unlimited Team Members
              </p>
              <p className="flex items-center gap-2">
                <Headphones size={16} /> Dedicated Manager
              </p>
              <p className="flex items-center gap-2">
                <Shield size={16} /> Priority Support
              </p>
            </div>

            <button
              type="button"
              className="mt-auto w-full shrink-0 rounded-xl bg-white py-3 text-sm font-semibold text-[#344E41] transition hover:bg-[#E1FFF0] sm:py-3.5 sm:text-[15px]"
            >
              Contact Sales
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const period = billingPeriodShort(plan.billingCycle);
  const muted = isRecommended ? "text-white/75" : "text-gray-600";
  const subMuted = isRecommended ? "text-white/70" : "text-gray-500";
  const cur = displayCurrency === "INR" ? "INR" : "USD";
  const priceDualBlock = {
    usdTotal: formatUsd(plan.totalPrice),
    usdUnit: formatUsd(plan.unitPrice),
    hasInr: Boolean(plan.hasInrPricing && plan.totalPriceInr > 0),
    inrTotal:
      plan.hasInrPricing && plan.totalPriceInr > 0
        ? formatInr(plan.totalPriceInr)
        : null,
    inrUnit:
      plan.hasInrPricing && plan.unitPriceInr > 0
        ? formatInr(plan.unitPriceInr)
        : null,
  };
  const mainTotal = cur === "INR" ? priceDualBlock.inrTotal : priceDualBlock.usdTotal;
  const mainUnit = cur === "INR" ? priceDualBlock.inrUnit : priceDualBlock.usdUnit;
  const mainLabel = cur === "INR" ? "INR" : "USD";
  /** Web pricing overlay: trial length comes from transform (7 days on web). */
  const trialDaysShown = plan.trialDays >= 1 ? plan.trialDays : 7;
  const showTrialStylePricing =
    !plan.unavailableForBilling && !plan.trialDisabled;

  /* ================= NORMAL PLAN ================= */

  const FRONT_FEATURE_LIMIT = 4;

  const frontFeatures = plan.features.slice(0, FRONT_FEATURE_LIMIT);

  const backFeatures = [
    ...plan.features.slice(FRONT_FEATURE_LIMIT),
    ...(plan.missing || []),
  ];

  const handleSubscribe = (e) => {
    e.stopPropagation();
    if (isDisabled) return;
    onSubscribeClick?.({ plan, selectedField });
  };

  return (
    <div
      className="mx-auto w-[300px] shrink-0 md:w-[320px]"
      style={{ perspective: 1000, height: 540 }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7 }}
        className={`h-full w-full ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        style={{
          transformStyle: "preserve-3d",
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        {/* FRONT SIDE */}

        <div
          className={`absolute inset-0 flex h-full min-h-0 flex-col rounded-2xl border p-6 shadow-xl ${
            isRecommended
              ? "border-2 border-white bg-[#344E41] text-white"
              : "border-gray-200 bg-white text-black"
          } ${isDisabled ? "opacity-70" : ""}`}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="shrink-0 space-y-1">
            <h3 className="mt-2 text-[24px] font-extrabold leading-tight">
              {plan.name}
            </h3>
            <p className={`text-sm ${muted}`}>{plan.tagline}</p>

            <div className="space-y-1.5 pt-2">
              {plan.unavailableForBilling ? (
                <p
                  className={`text-sm font-medium leading-snug ${
                    isRecommended ? "text-amber-200" : "text-amber-800"
                  }`}
                >
                  No {plan.billingCycle} price in {mainLabel} for this plan. Use the
                  currency toggle or switch Monthly/Yearly.
                </p>
              ) : showTrialStylePricing ? (
                <>
                  <p
                    className={`text-lg font-bold ${isRecommended ? "text-[#E1FFF0]" : "text-[#344E41]"}`}
                  >
                    {trialDaysShown}-day free trial
                  </p>
                  <p
                    className={`text-base font-semibold leading-snug ${
                      isRecommended
                        ? cur === "INR"
                          ? "text-[#b8ffe0]"
                          : "text-white"
                        : cur === "INR"
                          ? "text-emerald-800"
                          : "text-gray-900"
                    }`}
                  >
                    Then {mainTotal}
                    <span className={`font-normal ${subMuted}`}>/{period}</span>
                    <span className={`ml-1.5 text-xs font-normal ${subMuted}`}>
                      ({mainLabel})
                    </span>
                  </p>
                  <p className={`text-[11px] leading-relaxed ${subMuted}`}>
                    {plan.areaHectares.toFixed(2)} ha × {mainUnit}/ac ({mainLabel})
                  </p>
                </>
              ) : (
                <>
                  <p
                    className={`text-xl font-bold leading-snug ${
                      isRecommended
                        ? cur === "INR"
                          ? "text-[#b8ffe0]"
                          : "text-white"
                        : cur === "INR"
                          ? "text-emerald-800"
                          : "text-gray-900"
                    }`}
                  >
                    {mainTotal}
                    <span className={`font-normal text-base ${subMuted}`}>
                      /{period}
                    </span>
                    <span className={`ml-1.5 text-sm font-normal ${subMuted}`}>
                      ({mainLabel})
                    </span>
                  </p>
                  <p className={`text-[11px] ${subMuted}`}>
                    {plan.areaHectares.toFixed(2)} ha × {mainUnit}/ac ({mainLabel})
                  </p>
                </>
              )}
            </div>
          </div>

          <hr
            className={`my-3 shrink-0 ${
              isRecommended ? "border-white/25" : "border-gray-200"
            }`}
          />

          <div className="flex min-h-0 max-h-[200px] flex-1 flex-col gap-2 overflow-y-auto pr-1 text-sm font-medium">
            {isDisabled ? (
              <div
                className={`rounded-xl border px-4 py-4 text-sm leading-relaxed min-h-[140px] ${
                  isRecommended
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-[#344E41]/15 bg-[#F4F7F4] text-[#344E41]"
                }`}
              >
                {plan.trialDisabled
                  ? plan.disabledMessage
                  : `No ${plan.billingCycle} ${displayCurrency} price is configured for this plan. Switch the USD/INR toggle, try Monthly/Yearly, or add pricing in admin.`}
              </div>
            ) : (
              <>
                {frontFeatures.map((f, idx) => (
                  <p key={idx} className="flex items-start gap-2 shrink-0">
                    <Check
                      size={16}
                      className={
                        isRecommended ? "text-[#7dffb3] shrink-0 mt-0.5" : "text-green-600 shrink-0 mt-0.5"
                      }
                    />
                    <span>{f}</span>
                  </p>
                ))}

                {plan.features.length > FRONT_FEATURE_LIMIT && (
                  <p className={`text-xs mt-1 ${subMuted}`}>
                    +{plan.features.length - FRONT_FEATURE_LIMIT} more features
                  </p>
                )}
              </>
            )}
          </div>

          <div
            className={`mt-auto flex shrink-0 gap-3 border-t pt-4 ${
              isRecommended ? "border-white/20" : "border-gray-200"
            }`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFlipped(true);
              }}
              className={`min-h-[44px] flex-1 rounded-xl py-2.5 text-sm font-medium text-white transition ${
                isDisabled
                  ? "cursor-not-allowed bg-[#9AA9A1]"
                  : "bg-[#5A7C6B] hover:bg-[#49675a]"
              }`}
              disabled={isDisabled}
            >
              View All
            </button>

            <button
              type="button"
              onClick={handleSubscribe}
              className={`min-h-[44px] flex-1 rounded-xl border py-2.5 text-sm font-semibold transition ${
                isDisabled
                  ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400"
                  : isRecommended
                    ? "border-[#E1FFF0] bg-[#E1FFF0] text-[#344E41] hover:bg-white"
                    : "border-[#344E41] bg-white text-[#344E41] hover:bg-[#f5f7f6]"
              }`}
              disabled={isDisabled}
            >
              {isDisabled
                ? "Not Available"
                : showTrialStylePricing
                  ? "Start trial"
                  : "Subscribe"}
            </button>
          </div>
        </div>

        {/* BACK SIDE */}

        <div
          className="absolute inset-0 flex h-full min-h-0 flex-col rounded-2xl border border-gray-200 bg-white p-6 text-black shadow-xl"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <h3 className="mb-3 mt-2 shrink-0 text-[20px] font-bold">
            {plan.name} — All Features
          </h3>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-2 text-sm font-medium">
            {backFeatures.map((f, idx) => (
              <p key={idx} className="flex items-start gap-2">
                {plan.features.includes(f) ? (
                  <Check size={16} className="text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <X size={16} className="text-red-500 shrink-0 mt-0.5" />
                )}
                <span>{f}</span>
              </p>
            ))}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFlipped(false);
            }}
            className="mt-auto min-h-[44px] w-full shrink-0 rounded-xl bg-[#5A7C6B] py-2.5 text-sm font-medium text-white transition hover:bg-[#49675a]"
          >
            Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
