import { OPERATION_TYPES } from "./operationform/operationFieldConfig";

export const OPERATION_TYPE_COLORS = {
  tillage: { bg: "#D97706", light: "#FEF3C7", text: "#92400E" },
  cultivator: { bg: "#EA580C", light: "#FFEDD5", text: "#9A3412" },
  sowing: { bg: "#16A34A", light: "#DCFCE7", text: "#166534" },
  transplanting: { bg: "#0D9488", light: "#CCFBF1", text: "#115E59" },
  fertilizer_application: { bg: "#65A30D", light: "#ECFCCB", text: "#3F6212" },
  harvesting: { bg: "#CA8A04", light: "#FEF9C3", text: "#854D0E" },
  spray: { bg: "#2563EB", light: "#DBEAFE", text: "#1E40AF" },
  interculture_operation: { bg: "#7C3AED", light: "#EDE9FE", text: "#5B21B6" },
  other: { bg: "#64748B", light: "#F1F5F9", text: "#334155" },
};

export const PROGRESS_STYLES = {
  completed: {
    label: "Completed",
    className: "bg-emerald-500/20 text-emerald-100 border-emerald-400/40",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-amber-500/20 text-amber-100 border-amber-400/40",
  },
  started: {
    label: "Started",
    className: "bg-sky-500/20 text-sky-100 border-sky-400/40",
  },
};

export function formatOperationType(type) {
  if (!type) return "Operation";
  const found = OPERATION_TYPES.find((t) => t.value === type);
  if (found) return found.label;
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getOperationTypeColor(type) {
  return OPERATION_TYPE_COLORS[type] || OPERATION_TYPE_COLORS.other;
}

export function getProgressStyle(progress) {
  return PROGRESS_STYLES[progress] || null;
}

const ADVISORY_ACTIVITY_LABELS = {
  SPRAY: "Spray",
  FERTIGATION: "Fertigation",
  IRRIGATION: "Irrigation",
  WEATHER: "Weather",
  CROP_RISK: "Crop Risk",
  MONITORING: "Field Monitoring",
  CARBON_TRACKING: "Carbon Tracking",
};

export function formatAdvisoryActivityType(type) {
  return ADVISORY_ACTIVITY_LABELS[type] || formatOperationType(type);
}

export function getOperationDisplayTitle(operation) {
  if (operation?.source === "advisory" && operation?.advisoryActivityType) {
    return formatAdvisoryActivityType(operation.advisoryActivityType);
  }
  return formatOperationType(operation?.operationType);
}
