import {
  isSubscriptionActive,
  hasPlanFeature,
  fieldIsRecentlyCreated,
} from "./subscriptionAccess";
import { PLAN_FEATURE_KEYS } from "./planFeatures";

describe("isSubscriptionActive", () => {
  test("false when field or subscription is missing", () => {
    expect(isSubscriptionActive(null)).toBe(false);
    expect(isSubscriptionActive({})).toBe(false);
  });

  test("false when the field is area-locked", () => {
    expect(
      isSubscriptionActive({
        isLocked: true,
        subscription: { hasActiveSubscription: true, status: "active" },
      }),
    ).toBe(false);
  });

  test("true for hasActiveSubscription or status active", () => {
    expect(
      isSubscriptionActive({
        subscription: { hasActiveSubscription: true, status: "locked" },
      }),
    ).toBe(true);
    expect(
      isSubscriptionActive({
        subscription: { hasActiveSubscription: false, status: "active" },
      }),
    ).toBe(true);
  });
});

describe("hasPlanFeature", () => {
  const limitedPlanField = {
    subscription: {
      hasActiveSubscription: true,
      status: "active",
      plan: {
        features: {
          cropHealthAndYield: true,
          weatherAnalytics: true,
          smartAdvisorySystem: false,
          soilAnalysisAndHealth: false,
          diseaseDetectionAlerts: false,
        },
      },
    },
  };

  test("plan with a features map unlocks only its enabled features", () => {
    expect(hasPlanFeature(limitedPlanField, "cropHealthAndYield")).toBe(true);
    expect(hasPlanFeature(limitedPlanField, "weatherAnalytics")).toBe(true);
    expect(hasPlanFeature(limitedPlanField, "smartAdvisorySystem")).toBe(false);
    expect(hasPlanFeature(limitedPlanField, "soilAnalysisAndHealth")).toBe(false);
    expect(hasPlanFeature(limitedPlanField, "diseaseDetectionAlerts")).toBe(false);
  });

  test("unsubscribed farm never has features", () => {
    expect(
      hasPlanFeature(
        { subscription: { status: "locked", hasActiveSubscription: false } },
        "weatherAnalytics",
      ),
    ).toBe(false);
  });

  test("legacy plan without features map keeps full access once subscribed", () => {
    const legacy = {
      subscription: { hasActiveSubscription: true, status: "active", plan: {} },
    };
    expect(hasPlanFeature(legacy, "smartAdvisorySystem")).toBe(true);
  });

  test("plan with an all-false features map unlocks nothing", () => {
    const allFalse = {
      subscription: {
        hasActiveSubscription: true,
        status: "active",
        plan: {
          features: Object.fromEntries(
            PLAN_FEATURE_KEYS.map((k) => [k, false]),
          ),
        },
      },
    };
    PLAN_FEATURE_KEYS.forEach((k) =>
      expect(hasPlanFeature(allFalse, k)).toBe(false),
    );
  });

  test("only explicitly-true flags unlock, for every known feature", () => {
    PLAN_FEATURE_KEYS.forEach((on) => {
      const field = {
        subscription: {
          hasActiveSubscription: true,
          status: "active",
          plan: {
            features: Object.fromEntries(
              PLAN_FEATURE_KEYS.map((k) => [k, k === on]),
            ),
          },
        },
      };
      PLAN_FEATURE_KEYS.forEach((k) =>
        expect(hasPlanFeature(field, k)).toBe(k === on),
      );
    });
  });

  test("locked farm has no feature even when the plan enables it", () => {
    const field = {
      isLocked: true,
      subscription: {
        hasActiveSubscription: true,
        plan: { features: { weatherAnalytics: true } },
      },
    };
    expect(hasPlanFeature(field, "weatherAnalytics")).toBe(false);
  });
});

describe("fieldIsRecentlyCreated", () => {
  test("true when createdAt is missing (just added)", () => {
    expect(fieldIsRecentlyCreated({ _id: "1" })).toBe(true);
  });

  test("true within the window, false after", () => {
    expect(
      fieldIsRecentlyCreated({ createdAt: new Date().toISOString() }, 60_000),
    ).toBe(true);
    expect(
      fieldIsRecentlyCreated(
        { createdAt: new Date(Date.now() - 120_000).toISOString() },
        60_000,
      ),
    ).toBe(false);
  });
});
