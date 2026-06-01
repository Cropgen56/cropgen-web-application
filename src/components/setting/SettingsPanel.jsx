import React from "react";
import { ArrowLeft } from "lucide-react";

/**
 * Shared shell for Settings tabs (Personal Info, Farm, Pricing).
 * Keeps headers, spacing, and scroll behavior consistent.
 */
export default function SettingsPanel({
  title,
  description,
  onBack,
  children,
  className = "",
}) {
  return (
    <div className={`flex h-full min-h-0 flex-col font-inter ${className}`}>
      <header className="shrink-0 border-b border-ember-border/80 bg-white px-3 py-2.5 sm:px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-ember-sidebar sm:text-base">
              {title}
            </h2>
            {description ? (
              <p className="mt-0.5 text-[11px] leading-snug text-ember-text-secondary sm:text-xs">
                {description}
              </p>
            ) : null}
          </div>
          {typeof onBack === "function" ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex shrink-0 items-center gap-1 rounded-md border border-ember-border px-2 py-1 text-[11px] font-medium text-ember-sidebar transition-colors hover:bg-ember-card lg:hidden"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Menu
            </button>
          ) : null}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 sm:px-3 sm:py-4 md:px-4">
        {children}
      </div>
    </div>
  );
}

export const settingsFieldStyles = {
  label:
    "mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-[11px]",
  inputBase:
    "w-full rounded-lg border py-2 text-sm outline-none transition-[border-color,box-shadow] duration-150",
  inputWithIcon: "pl-9 pr-3",
  inputPlain: "px-3",
  inputReadonly: "border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed",
  inputEditable:
    "border-gray-200 bg-white text-gray-900 hover:border-ember-sidebar/35 focus:border-ember-sidebar focus:ring-1 focus:ring-ember-sidebar/25",
  btnPrimary:
    "inline-flex items-center justify-center gap-1.5 rounded-lg bg-ember-sidebar px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-ember-sidebar-hover focus:outline-none focus:ring-2 focus:ring-ember-sidebar/40 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
  btnSecondary:
    "inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50",
};
