/**
 * What plan a farm is on, for display (farm cards, dashboard, pricing dialog).
 * Reads the `subscription` object the field list returns for each farm.
 */
const CYCLE_LABEL = { monthly: "Monthly", yearly: "Yearly", season: "Season", trial: "Trial" };
const DAY_MS = 86400000;

const cap = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : "");

export function formatPlanDate(date) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * @returns {{
 *  hasPlan: boolean, planId: string|null, planName: string, cycle: string|null,
 *  cycleLabel: string, kind: "none"|"paid"|"trial"|"free_trial",
 *  daysLeft: number|null, endDate: string|null, title: string, detail: string
 * }}
 */
export function describeFarmPlan(field) {
  const sub = field?.subscription;
  const none = {
    hasPlan: false, planId: null, planName: "", cycle: null, cycleLabel: "",
    kind: "none", daysLeft: null, endDate: null,
    title: "No plan", detail: "Subscribe to unlock this farm",
  };
  if (!sub || field?.isLocked === true) return none;
  const active = sub.hasActiveSubscription === true || sub.status === "active";
  if (!active) return none;

  const planName = sub.plan?.name || "Plan";
  const isTrialCycle = sub.billingCycle === "trial";
  const cycle = isTrialCycle ? sub.commitBillingCycle || null : sub.billingCycle || null;
  const endDate = sub.endDate || null;
  const daysLeft =
    typeof sub.daysLeft === "number"
      ? sub.daysLeft
      : endDate
        ? Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / DAY_MS))
        : null;
  const cycleLabel = CYCLE_LABEL[cycle] || cap(cycle);

  if (isTrialCycle) {
    const free = Boolean(sub.freeTrialOffer);
    return {
      hasPlan: true, planId: sub.plan?.id ? String(sub.plan.id) : null, planName,
      cycle, cycleLabel, kind: free ? "free_trial" : "trial", daysLeft, endDate,
      title: free ? `Free Trial · ${planName}` : `${planName} · Trial`,
      detail:
        (daysLeft != null ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left` : "Trial running") +
        (cycleLabel ? ` · then ${cycleLabel}` : ""),
    };
  }

  return {
    hasPlan: true, planId: sub.plan?.id ? String(sub.plan.id) : null, planName,
    cycle, cycleLabel, kind: "paid", daysLeft, endDate,
    title: planName,
    detail:
      [cycleLabel, endDate ? `until ${formatPlanDate(endDate)}` : ""].filter(Boolean).join(" · ") ||
      "Active",
  };
}
