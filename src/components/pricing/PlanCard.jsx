import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  X,
  Users,
  Headphones,
  Shield,
  Sparkles,
  Sprout,
  Building2,
  Crown,
  ArrowRight,
} from "lucide-react";
import {
  ENTERPRISE_PRICING,
  openEnterpriseContact,
} from "../../utils/enterprisePlan";

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

/** Per-hectare unit prices keep paise (e.g. ₹491.73/ha). */
function formatInrUnit(amount) {
  if (amount == null || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Cards size to their content (nothing is clipped); this is only the minimum so
 * short plans still look substantial. Rows in the dialog grid stretch to equal height.
 */
const CARD_MIN_HEIGHT = 500;

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
  /** Settings page: no field selected, so show the per-hectare price. */
  perHectare = false,
  subscribeLabel,
  /** This farm is already on this plan (and billing cycle). */
  isCurrent = false,
  /** The farm already has a plan, so subscribing means switching to this one. */
  changeMode = false,
}) {
  const [flipped, setFlipped] = useState(false);

  const isRecommended = !!plan.recommended;
  const isEnterprise = !!plan.isEnterprise;
  const isDisabled =
    !!plan.trialDisabled || !!plan.unavailableForBilling;

  /* ================= ENTERPRISE ================= */

  if (isEnterprise) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -6 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="group h-full w-full max-w-[340px] shrink-0"
        style={{ perspective: 1000, minHeight: CARD_MIN_HEIGHT }}
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
            minHeight: CARD_MIN_HEIGHT,
          }}
        >
          <div
            className="relative flex h-full flex-col rounded-3xl border border-[#E1FFF0]/30 bg-gradient-to-br from-[#12241b] via-[#2b4538] to-[#3a5e4b] p-6 pt-9 text-white shadow-[0_20px_45px_-15px_rgba(0,0,0,0.6)] transition-shadow duration-300 group-hover:shadow-[0_28px_60px_-15px_rgba(0,0,0,0.7)]"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* soft glows */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
            >
              <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#7dffb3]/20 blur-3xl" />
              <div className="absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-emerald-300/10 blur-3xl" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>

            <span className="absolute -top-3 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-[#E1FFF0] to-[#a8e6cf] px-4 py-1 text-xs font-bold tracking-wide text-[#1f3a2d] shadow-lg">
              <Crown size={12} />
              ENTERPRISE
            </span>

            <div className="relative shrink-0">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
                  <Building2 className="text-[#E1FFF0]" size={26} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[22px] font-extrabold leading-tight sm:text-2xl">
                    {plan.name}
                  </h3>
                  <p className="mt-0.5 text-sm leading-snug text-gray-200">
                    {plan.tagline}
                  </p>
                </div>
              </div>

              <dl className="mt-5 space-y-2 text-sm">
                {ENTERPRISE_PRICING.map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5"
                  >
                    <dt className="text-white/75">{label}</dt>
                    <dd className="bg-gradient-to-r from-[#E1FFF0] to-[#9be8c2] bg-clip-text text-xl font-extrabold text-transparent">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative mb-5 mt-6 flex-1 space-y-3.5 text-sm font-medium">
              {[
                { Icon: Check, label: "All Premium Features" },
                { Icon: Users, label: "Unlimited Team Members" },
                { Icon: Headphones, label: "Dedicated Manager" },
                { Icon: Shield, label: "Priority Support" },
              ].map(({ Icon, label }) => (
                <p key={label} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                    <Icon size={14} className="text-[#E1FFF0]" />
                  </span>
                  {label}
                </p>
              ))}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                (onContactClick ?? openEnterpriseContact)({ plan });
              }}
              className="relative mt-auto inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-white to-[#E1FFF0] py-3 text-sm font-bold text-[#244034] shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:py-3.5 sm:text-[15px]"
            >
              Contact Sales
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </motion.div>
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
        ? formatInrUnit(plan.unitPriceInr)
        : null,
  };
  const mainUnit = cur === "INR" ? priceDualBlock.inrUnit : priceDualBlock.usdUnit;
  const mainTotal = perHectare
    ? mainUnit
    : cur === "INR"
      ? priceDualBlock.inrTotal
      : priceDualBlock.usdTotal;
  const periodLabel = perHectare ? `ha/${period}` : period;
  const mainLabel = cur === "INR" ? "INR" : "USD";
  /** Web pricing overlay: trial length comes from transform (0 when no trial). */
  const trialDaysShown = plan.trialDays >= 1 ? plan.trialDays : 0;
  const showTrialStylePricing =
    plan.isTrialPlan &&
    trialDaysShown > 0 &&
    !plan.unavailableForBilling &&
    !plan.trialDisabled;

  const limitsNote = plan.freeTrialLimits ? (
    <ul className="mt-1 flex flex-wrap gap-1.5">
      {[
        `Up to ${plan.freeTrialLimits.maxHectares} ha`,
        `${plan.freeTrialLimits.maxFarms} farm only`,
        "No extra farm or area",
        "Autopay required",
      ].map((t) => (
        <li
          key={t}
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            isRecommended
              ? "bg-white/15 text-white"
              : "bg-[#344E41]/10 text-[#344E41]"
          }`}
        >
          {t}
        </li>
      ))}
    </ul>
  ) : null;

  const savingsNote =
    plan.savingsPct > 0 ? (
      <p
        className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold ${
          isRecommended
            ? "bg-[#E1FFF0]/20 text-[#E1FFF0]"
            : "bg-emerald-50 text-emerald-800"
        }`}
      >
        {plan.billingCycle === "yearly"
          ? `You save ${plan.savingsPct}% vs monthly`
          : `Save ${plan.savingsPct}% with yearly billing`}
      </p>
    ) : null;

  /* ================= NORMAL PLAN ================= */

  const FRONT_FEATURE_LIMIT = 4;

  const frontFeatures = plan.features.slice(0, FRONT_FEATURE_LIMIT);

  const backFeatures = [
    ...plan.features.slice(FRONT_FEATURE_LIMIT),
    ...(plan.missing || []),
  ];

  const handleSubscribe = (e) => {
    e.stopPropagation();
    if (isDisabled || isCurrent) return;
    onSubscribeClick?.({ plan, selectedField });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={isDisabled ? undefined : { y: -6 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group h-full w-full max-w-[340px] shrink-0"
      style={{ perspective: 1000, minHeight: CARD_MIN_HEIGHT }}
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
          minHeight: CARD_MIN_HEIGHT,
        }}
      >
        {/* FRONT SIDE */}

        <div
          className={`relative flex h-full flex-col overflow-hidden rounded-3xl border p-6 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.55)] transition-shadow duration-300 group-hover:shadow-[0_26px_55px_-18px_rgba(0,0,0,0.65)] ${
            isRecommended
              ? "border-2 border-white/80 bg-gradient-to-br from-[#244034] via-[#344E41] to-[#3f5f4e] text-white"
              : "border-white/70 bg-gradient-to-b from-[#eefaf3] via-white to-white text-gray-900"
          } ${isDisabled ? "opacity-70" : ""}`}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#5A7C6B] via-[#7dd3a8] to-[#344E41]" />
          {isCurrent ? (
            <span className="absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white shadow">
              <Check size={11} strokeWidth={3} /> Current plan
            </span>
          ) : null}

          <div className="shrink-0 space-y-1">
            <div className="mt-2 flex items-center gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-md ${
                  isRecommended
                    ? "bg-white/15 text-[#E1FFF0] ring-1 ring-white/25"
                    : "bg-gradient-to-br from-[#5A7C6B] to-[#344E41] text-white"
                }`}
              >
                {plan.isFreeTrialOffer ? <Sparkles size={22} /> : <Sprout size={22} />}
              </div>
              <div className="min-w-0">
                <h3 className="text-[22px] font-extrabold leading-tight">
                  {plan.name}
                </h3>
                <p className={`text-sm leading-snug ${muted}`}>{plan.tagline}</p>
              </div>
            </div>

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
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${
                      isRecommended
                        ? "bg-[#E1FFF0]/20 text-[#E1FFF0]"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    <Sparkles size={14} />
                    {trialDaysShown}-day free trial
                  </p>
                  <p
                    className={`text-sm font-semibold leading-snug ${
                      isRecommended
                        ? cur === "INR"
                          ? "text-[#b8ffe0]"
                          : "text-white"
                        : cur === "INR"
                          ? "text-emerald-800"
                          : "text-gray-900"
                    }`}
                  >
                    Then{" "}
                    <span className="text-xl font-bold">{mainTotal}</span>
                    <span className={`text-sm font-normal ${subMuted}`}>/{periodLabel}</span>
                    <span className={`ml-1.5 text-xs font-normal ${subMuted}`}>
                      ({mainLabel})
                    </span>
                  </p>
                  {perHectare ? null : (
                    <p className={`text-[11px] leading-relaxed ${subMuted}`}>
                      {plan.areaHectares.toFixed(2)} ha × {mainUnit}/ha ({mainLabel})
                    </p>
                  )}
                  {savingsNote}
                  {limitsNote}
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
                    <span className="text-[30px] font-extrabold tracking-tight">
                      {mainTotal}
                    </span>
                    <span className={`font-normal text-base ${subMuted}`}>
                      /{periodLabel}
                    </span>
                    <span className={`ml-1.5 text-sm font-normal ${subMuted}`}>
                      ({mainLabel})
                    </span>
                  </p>
                  {perHectare ? null : (
                    <p className={`text-[11px] ${subMuted}`}>
                      {plan.areaHectares.toFixed(2)} ha × {mainUnit}/ha ({mainLabel})
                    </p>
                  )}
                  {savingsNote}
                </>
              )}
            </div>
          </div>

          <hr
            className={`my-3 shrink-0 ${
              isRecommended ? "border-white/25" : "border-[#344E41]/10"
            }`}
          />

          <div className="flex flex-1 flex-col gap-2.5 pb-3 text-sm font-medium">
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
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        isRecommended
                          ? "bg-[#7dffb3]/20 text-[#7dffb3]"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
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
              isRecommended ? "border-white/20" : "border-[#344E41]/10"
            }`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFlipped(true);
              }}
              className={`min-h-[44px] flex-1 rounded-2xl border py-2.5 text-sm font-semibold transition ${
                isDisabled
                  ? "cursor-not-allowed border-transparent bg-[#9AA9A1] text-white"
                  : isRecommended
                    ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
                    : "border-[#5A7C6B]/40 bg-white/70 text-[#344E41] hover:border-[#5A7C6B] hover:bg-white"
              }`}
              disabled={isDisabled}
            >
              View All
            </button>

            <button
              type="button"
              onClick={handleSubscribe}
              className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-2xl border py-2.5 text-sm font-bold transition ${
                isCurrent
                  ? "cursor-not-allowed border-emerald-300 bg-emerald-50 text-emerald-800"
                  : isDisabled
                  ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400"
                  : isRecommended
                    ? "border-[#E1FFF0] bg-[#E1FFF0] text-[#344E41] shadow-md hover:bg-white hover:shadow-lg"
                    : "border-transparent bg-gradient-to-r from-[#344E41] to-[#5A7C6B] text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110"
              }`}
              disabled={isDisabled || isCurrent}
            >
              {isCurrent
                ? "Current plan"
                : isDisabled
                ? "Not Available"
                : changeMode && !subscribeLabel
                ? "Switch to this plan"
                : (subscribeLabel ??
                  (showTrialStylePricing
                    ? plan.isFreeTrialOffer
                      ? "Start free trial"
                      : "Start trial"
                    : "Subscribe"))}
              {!isDisabled && !isCurrent ? <ArrowRight size={15} /> : null}
            </button>
          </div>
        </div>

        {/* BACK SIDE */}

        <div
          className="absolute inset-0 flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-b from-[#eefaf3] via-white to-white p-6 text-gray-900 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.55)]"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#5A7C6B] via-[#7dd3a8] to-[#344E41]" />
          <h3 className="mb-3 mt-2 shrink-0 text-[20px] font-extrabold">
            {plan.name} — All Features
          </h3>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-2 text-sm font-medium">
            {backFeatures.map((f, idx) => (
              <p key={idx} className="flex items-start gap-2">
                {plan.features.includes(f) ? (
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check size={12} strokeWidth={3} />
                  </span>
                ) : (
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
                    <X size={12} strokeWidth={3} />
                  </span>
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
            className="mt-auto min-h-[44px] w-full shrink-0 rounded-2xl bg-gradient-to-r from-[#344E41] to-[#5A7C6B] py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-110"
          >
            Back
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
