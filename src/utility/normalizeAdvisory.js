import { attachClientNpkDisplay } from "./enrichNpkDisplayClient";

/** Normalize advisory API payload for consistent UI binding. */
export function normalizeActivity(activity) {
  if (!activity || typeof activity !== "object") return null;

  const type = String(activity.type || "").toUpperCase();
  if (!type) return null;

  let details = activity.details;
  if (typeof details === "string" && details.trim()) {
    details = { note: details.trim() };
  } else if (!details || typeof details !== "object" || Array.isArray(details)) {
    details = {};
  }

  return {
    ...activity,
    type,
    title: String(activity.title || type).trim(),
    message: String(activity.message || activity.description || "").trim(),
    details,
    progress: activity.progress ?? null,
  };
}

export function normalizeAdvisory(raw) {
  if (!raw) return null;

  const farmFieldId = raw.farmFieldId?._id ?? raw.farmFieldId ?? null;
  const activities = (raw.activitiesToDo || [])
    .map(normalizeActivity)
    .filter(Boolean);

  return attachClientNpkDisplay({
    ...raw,
    farmFieldId,
    activitiesToDo: activities,
  });
}
