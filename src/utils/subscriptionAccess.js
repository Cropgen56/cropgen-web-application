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

  return Boolean(features[featureKey]);
}

export function fieldIsRecentlyCreated(field, maxAgeMs = 15 * 60 * 1000) {
  if (!field) return false;
  if (!field.createdAt) return true;
  const t = new Date(field.createdAt).getTime();
  if (!Number.isFinite(t) || t <= 0) return true;
  return Date.now() - t < maxAgeMs;
}
