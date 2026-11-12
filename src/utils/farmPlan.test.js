import { describeFarmPlan } from "./farmPlan";

const sub = (extra) => ({
  subscription: {
    hasActiveSubscription: true,
    status: "active",
    plan: { id: "p1", name: "Growth Plan" },
    ...extra,
  },
});

describe("describeFarmPlan", () => {
  test("no subscription, locked or inactive -> no plan", () => {
    expect(describeFarmPlan(null).hasPlan).toBe(false);
    expect(describeFarmPlan({}).kind).toBe("none");
    expect(describeFarmPlan({ isLocked: true, ...sub({}) }).hasPlan).toBe(false);
    expect(describeFarmPlan({ subscription: { hasActiveSubscription: false, status: "locked" } }).hasPlan).toBe(false);
  });

  test("paid plan shows name, cycle and end date", () => {
    const d = describeFarmPlan(sub({ billingCycle: "monthly", endDate: "2027-01-15T00:00:00Z" }));
    expect(d).toMatchObject({ hasPlan: true, kind: "paid", planName: "Growth Plan", cycle: "monthly", planId: "p1", title: "Growth Plan" });
    expect(d.detail).toContain("Monthly");
    expect(d.detail).toContain("2027");
  });

  test("free trial shows days left and the plan it converts to", () => {
    const d = describeFarmPlan(sub({ billingCycle: "trial", freeTrialOffer: true, commitBillingCycle: "yearly", daysLeft: 12 }));
    expect(d.kind).toBe("free_trial");
    expect(d.title).toBe("Free Trial · Growth Plan");
    expect(d.detail).toBe("12 days left · then Yearly");
    expect(d.cycle).toBe("yearly");
  });

  test("ordinary trial, singular day", () => {
    const d = describeFarmPlan(sub({ billingCycle: "trial", commitBillingCycle: "monthly", daysLeft: 1 }));
    expect(d.kind).toBe("trial");
    expect(d.detail).toBe("1 day left · then Monthly");
  });
});
