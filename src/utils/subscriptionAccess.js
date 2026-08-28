/**
 * Plan-feature access for a farm field (from GET /field enrichment).
 *
 * Legacy CropGen plans without a `features` object keep full access once
 * the farm is subscribed. AAT (and any plan with a features map) only
 * unlocks keys that are explicitly true.
 */

export function isSubscriptionActive(field) {
  if (!field) return false;
  if (field.isLocked === true) return false;

  const sub = field.subscription;
  if (!sub) return false;

  if (sub.hasActiveSubscription === true) return true;
  return sub.status === "active";
}

export function hasPlanFeature(field, featureKey) {
  if (!isSubscriptionActive(field)) return false;
  if (!featureKey) return true;

  const features = field?.subscription?.plan?.features;
  if (!features || typeof features !== "object") return true;

  // The backend's `features` map defaults every flag to `false`, so a
  // legacy plan that was never configured with per-feature flags still
  // arrives here as a fully-populated object (all false) rather than
  // missing entirely. An all-false map is indistinguishable from "never
  // configured" (a paid plan that unlocks nothing isn't a real product),
  // so only start enforcing the allowlist once at least one flag has been
  // explicitly turned on.
  const isConfigured = Object.values(features).some(Boolean);
  if (!isConfigured) return true;

  return Boolean(features[featureKey]);
}

export function fieldIsRecentlyCreated(field, maxAgeMs = 15 * 60 * 1000) {
  if (!field) return false;
  if (!field.createdAt) return true;
  const t = new Date(field.createdAt).getTime();
  if (!Number.isFinite(t) || t <= 0) return true;
  return Date.now() - t < maxAgeMs;
}
