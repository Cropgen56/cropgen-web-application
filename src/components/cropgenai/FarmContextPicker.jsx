import React from "react";
import { LayoutGrid, MapPin } from "lucide-react";

/**
 * Switch AI context: all farms (default) or one field.
 */
export default function FarmContextPicker({
  farms = [],
  activeFarmId = null,
  onSelect,
  disabled = false,
}) {
  if (!farms.length) return null;

  const pillBase =
    "inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-sidebar/40 disabled:cursor-not-allowed disabled:opacity-45";

  const pillActive =
    "border-ember-sidebar/35 bg-ember-sidebar/10 text-ember-sidebar shadow-sm";
  const pillIdle =
    "border-gray-200 bg-white text-gray-700 hover:border-ember-sidebar/25 hover:bg-[#f4faf7]";

  return (
    <div className="shrink-0 border-b border-gray-100 bg-[#f8fbf9] px-4 py-3">
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
        <LayoutGrid className="h-3 w-3" aria-hidden />
        Focus discussion
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelect(null)}
          className={`${pillBase} ${activeFarmId == null ? pillActive : pillIdle}`}
          aria-pressed={activeFarmId == null}
        >
          <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">All farms</span>
        </button>
        {farms.map((field) => {
          const id = field._id?.toString?.() ?? String(field._id);
          const selected = activeFarmId === id;
          const label = field.fieldName || field.farmName || "Farm";
          return (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(id)}
              className={`${pillBase} ${selected ? pillActive : pillIdle}`}
              aria-pressed={selected}
              title={field.cropName ? `${label} · ${field.cropName}` : label}
            >
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
