import React from "react";
import brandMarkEmptyState from "../../../assets/image/Group 31.png";

/**
 * Minimal spinner — use instead of the brand PNG outside the sidebar.
 * @param {"onDark"|"onLight"|"brandMark"} [variant] — onDark/onLight: ring spinner; brandMark: Bio Drops empty-state graphic (weather, operations, etc.)
 */
export default function SimpleLoader({
  className = "",
  size = "md",
  variant = "onDark",
}) {
  if (variant === "brandMark") {
    const sizeClass =
      size === "sm"
        ? "h-12 w-12 max-h-12 max-w-12"
        : size === "lg"
          ? "h-40 w-40 max-h-40 max-w-40 sm:h-48 sm:w-48 sm:max-h-48 sm:max-w-48"
          : "h-24 w-24 max-h-24 max-w-24";
    return (
      <img
        src={brandMarkEmptyState}
        alt=""
        className={`object-contain opacity-95 animate-pulse ${sizeClass} ${className}`}
        role="status"
        aria-label="Loading"
      />
    );
  }

  const sizeClass =
    size === "sm"
      ? "h-8 w-8 border-2"
      : size === "lg"
        ? "h-16 w-16 border-4"
        : "h-12 w-12 border-[3px]";
  const ringClass =
    variant === "onLight"
      ? "border-[#0B5D3D]/20 border-t-[#0B5D3D]"
      : "border-white/25 border-t-white";

  return (
    <div
      className={`inline-block rounded-full animate-spin ${sizeClass} ${ringClass} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
