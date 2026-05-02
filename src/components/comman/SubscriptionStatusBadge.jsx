import React from "react";

const VARIANTS = {
  light: {
    sub: "bg-[#DAFFED] text-[#28C878] border-[#28C878]/30",
    unsub: "bg-[#FFDEDF] text-[#EC1C24] border-[#EC1C24]/30",
  },
  onDark: {
    sub: "bg-emerald-400/20 text-emerald-100 border-emerald-300/40",
    unsub: "bg-red-500/20 text-red-100 border-red-300/40",
  },
};

/**
 * Compact subscription pill — full labels only (Subscribed / Unsubscribed).
 * @param {"light"|"onDark"} variant
 * @param {"subscribed"|"active"} mode — "active" uses Active / Inactive
 */
export default function SubscriptionStatusBadge({
  isSubscribed,
  variant = "light",
  mode = "subscribed",
  className = "",
}) {
  const palette = VARIANTS[variant] || VARIANTS.light;
  const tone = isSubscribed ? palette.sub : palette.unsub;

  const label =
    mode === "active"
      ? isSubscribed
        ? "Active"
        : "Inactive"
      : isSubscribed
        ? "Subscribed"
        : "Unsubscribed";

  return (
    <span
      className={`inline-flex max-w-[100%] items-center justify-center shrink-0 whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[9px] font-semibold leading-tight tracking-tight sm:px-2 sm:text-[10px] ${tone} ${className}`}
    >
      {label}
    </span>
  );
}
