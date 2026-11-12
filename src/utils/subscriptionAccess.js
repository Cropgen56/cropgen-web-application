/**
 * Plan-feature access for a farm field (from GET /field enrichment).
 *
 * A farm whose plan has no `features` object at all keeps full access once
 * subscribed. Any plan that carries a features map (even all-false) only
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
  // No features map at all (plan not resolved, e.g. a subscription whose plan
  // document was removed): keep the paid farm usable.
  if (!features || typeof features !== "object") return true;

  // A features map is authoritative. The backend defaults every flag to
  // `false`, so a plan with no flags enabled unlocks nothing: an unconfigured
  // plan must never grant every feature.
  return features[featureKey] === true;
}

export function fieldIsRecentlyCreated(field, maxAgeMs = 15 * 60 * 1000) {
  if (!field) return false;
  if (!field.createdAt) return true;
  const t = new Date(field.createdAt).getTime();
  if (!Number.isFinite(t) || t <= 0) return true;
  return Date.now() - t < maxAgeMs;
}
